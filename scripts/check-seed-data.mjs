import { readFile } from 'node:fs/promises';

const seedPath = 'data/seed-cafes.csv';
const requiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const optionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const allowedColumns = new Set([...requiredColumns, ...optionalColumns]);
const allowedCities = new Set(['busan', 'seoul']);
const busanAreas = new Set(['jeonpo', 'gwangan', 'haeundae', 'jung', 'yeongdo', 'dongnae', 'saha', 'gangseo', 'yeonje', 'geumjeong']);
const coffeeCapabilities = new Set([
  'filter_coffee',
  'cold_brew',
  'decaf',
  'flat_white',
  'einspanner',
  'single_origin',
  'house_blend',
  'decaf_bean',
  'hand_drip',
  'batch_brew',
  'espresso_machine',
  'bean_sales',
  'dripbag_sales',
  'roastery',
  'specialty_coffee',
]);
const optionCapabilities = new Set(['pet_friendly', 'kids_zone', 'no_kids_zone', 'outdoor_seating', 'discount_available', 'rewards_available']);
const allowedCapabilities = new Set([...coffeeCapabilities, ...optionCapabilities]);
const mvpCapabilities = new Set(['filter_coffee', 'decaf', 'cold_brew', 'flat_white', 'single_origin', 'bean_sales']);
const confidenceLevels = new Set(['A', 'B', 'C', 'D', 'X']);
const verificationSources = new Set(['owner_verified', 'admin_verified', 'user_report', 'menu_photo']);
const confidenceLabels = { A: 'A 등급', B: 'B 등급', C: 'C 등급', D: 'D 등급', X: '검증 필요' };
const verificationSourceLabels = {
  owner_verified: '사장님 확인',
  admin_verified: '관리자 확인',
  user_report: '사용자 제보',
  menu_photo: '메뉴 사진',
};
const busanBounds = { minLatitude: 35.0, maxLatitude: 35.3, minLongitude: 128.93, maxLongitude: 129.25 };

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (inQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  if (inQuotes) throw new Error('CSV quote is not closed.');
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function isValidExternalLink(value) {
  return !value || value === '#' || /^https?:\/\//i.test(value);
}

function inRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function formatCountMap(map, labels = {}) {
  return [...map.entries()].map(([key, count]) => `${labels[key] || key} ${count}`).join(', ') || '-';
}

function addCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

const seedBytes = await readFile(seedPath);
const errors = [];
const warnings = [];

if (!(seedBytes[0] === 0xef && seedBytes[1] === 0xbb && seedBytes[2] === 0xbf)) {
  errors.push('seed CSV must be UTF-8 with BOM for Excel compatibility.');
}

let rows = [];
try {
  rows = parseCsvRows(seedBytes.toString('utf8'));
} catch (error) {
  errors.push(error.message);
}

if (rows.length < 2) {
  errors.push('seed CSV must include a header and at least one data row.');
}

const headers = rows[0]?.map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim()) || [];
const headerSet = new Set(headers);
const duplicateHeaders = headers.filter((header, index) => headers.indexOf(header) !== index);
const missingHeaders = requiredColumns.filter((column) => !headerSet.has(column));
const unknownHeaders = headers.filter((header) => !allowedColumns.has(header));

duplicateHeaders.forEach((header) => errors.push(`duplicate header: ${header}`));
missingHeaders.forEach((header) => errors.push(`missing required header: ${header}`));
unknownHeaders.forEach((header) => errors.push(`unknown header: ${header}`));

const cafeRows = [];
const seenIds = new Set();
const areaCounts = new Map();
const confidenceCounts = new Map();
const sourceCounts = new Map();
const capabilityCounts = new Map();
let coffeeCapabilityTotal = 0;

if (!missingHeaders.length && !duplicateHeaders.length && !unknownHeaders.length) {
  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const record = Object.fromEntries(headers.map((header, headerIndex) => [header, (row[headerIndex] || '').trim()]));

    requiredColumns.forEach((column) => {
      if (!record[column]) errors.push(`${rowNumber}: ${column} is required.`);
    });

    if (record.id && !/^[a-z0-9-]+$/.test(record.id)) errors.push(`${rowNumber}: id must use lowercase letters, numbers, and hyphens.`);
    if (record.id && seenIds.has(record.id)) errors.push(`${rowNumber}: duplicate id ${record.id}.`);
    if (record.id) seenIds.add(record.id);

    if (record.city && !allowedCities.has(record.city)) errors.push(`${rowNumber}: city must be busan or seoul.`);
    if (record.city === 'busan' && record.area && !busanAreas.has(record.area)) errors.push(`${rowNumber}: Busan area is not supported.`);

    const latitude = Number(record.latitude);
    const longitude = Number(record.longitude);
    if (!inRange(latitude, -90, 90)) errors.push(`${rowNumber}: latitude is invalid.`);
    if (!inRange(longitude, -180, 180)) errors.push(`${rowNumber}: longitude is invalid.`);
    if (record.city === 'busan' && (!inRange(latitude, busanBounds.minLatitude, busanBounds.maxLatitude) || !inRange(longitude, busanBounds.minLongitude, busanBounds.maxLongitude))) {
      warnings.push(`${rowNumber}: coordinates are outside the broad Busan QA bounds.`);
    }

    const capabilities = record.capabilities.split('|').map((tag) => tag.trim()).filter(Boolean);
    const duplicateCapabilities = capabilities.filter((tag, capabilityIndex) => capabilities.indexOf(tag) !== capabilityIndex);
    if (!capabilities.length) errors.push(`${rowNumber}: capabilities must include at least one tag.`);
    duplicateCapabilities.forEach((tag) => errors.push(`${rowNumber}: duplicate capability ${tag}.`));
    if (capabilities.includes('kids_zone') && capabilities.includes('no_kids_zone')) errors.push(`${rowNumber}: kids_zone and no_kids_zone cannot be used together.`);
    capabilities.forEach((tag) => {
      if (!allowedCapabilities.has(tag)) errors.push(`${rowNumber}: unknown capability ${tag}.`);
      addCount(capabilityCounts, tag);
    });

    if (record.confidence && !confidenceLevels.has(record.confidence)) errors.push(`${rowNumber}: confidence must be A, B, C, D, or X.`);
    if (record.verification_source && !verificationSources.has(record.verification_source)) errors.push(`${rowNumber}: verification_source is not allowed.`);
    if (record.verified_at && !/^\d{4}-\d{2}-\d{2}$/.test(record.verified_at)) errors.push(`${rowNumber}: verified_at must use YYYY-MM-DD.`);

    ['naver_map_url', 'kakao_map_url', 'google_map_url'].forEach((column) => {
      if (!isValidExternalLink(record[column])) errors.push(`${rowNumber}: ${column} must be http(s) URL or #.`);
    });

    addCount(areaCounts, record.area || 'missing');
    addCount(confidenceCounts, record.confidence || 'missing');
    addCount(sourceCounts, record.verification_source || 'missing');
    coffeeCapabilityTotal += capabilities.filter((tag) => coffeeCapabilities.has(tag)).length;
    cafeRows.push({ ...record, capabilities });
  });
}

const rowCount = cafeRows.length;
const averageCoffeeCapabilities = rowCount ? coffeeCapabilityTotal / rowCount : 0;
const missingAreas = [...busanAreas].filter((area) => !areaCounts.has(area));
const missingMvpFilters = [...mvpCapabilities].filter((capability) => !capabilityCounts.has(capability));

if (rowCount < 150) warnings.push(`MVP target gap: ${rowCount}/150 cafes. Add ${150 - rowCount} more verified rows for closed beta readiness.`);
if (averageCoffeeCapabilities < 3) warnings.push(`MVP target gap: average coffee capabilities is ${averageCoffeeCapabilities.toFixed(1)}; target is 3.0 or higher.`);
if (missingAreas.length) warnings.push(`MVP area gap: no rows for ${missingAreas.join(', ')}.`);
if (missingMvpFilters.length) warnings.push(`MVP filter coverage gap: no rows for ${missingMvpFilters.join(', ')}.`);

console.log('BrewMap seed data check');
console.log(`Rows: ${rowCount}`);
console.log(`Areas: ${formatCountMap(areaCounts)}`);
console.log(`Average coffee capabilities: ${averageCoffeeCapabilities.toFixed(1)}`);
console.log(`Confidence: ${formatCountMap(confidenceCounts, confidenceLabels)}`);
console.log(`Sources: ${formatCountMap(sourceCounts, verificationSourceLabels)}`);
console.log(`MVP filter coverage: ${[...mvpCapabilities].filter((capability) => capabilityCounts.has(capability)).length}/${mvpCapabilities.size}`);

if (warnings.length) {
  console.log('\nWarnings');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}

if (errors.length) {
  console.log('\nErrors');
  errors.forEach((error) => console.log(`- ${error}`));
  process.exit(1);
}

console.log('\nSeed CSV structure is valid.');
