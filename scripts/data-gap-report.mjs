import { readFile } from 'node:fs/promises';

const seedPath = 'data/seed-cafes.csv';
const requiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const optionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const expectedColumns = [...requiredColumns, ...optionalColumns];
const busanAreas = ['jeonpo', 'gwangan', 'haeundae', 'jung', 'yeongdo', 'dongnae', 'saha', 'gangseo', 'yeonje', 'geumjeong', 'buk', 'dong', 'nam', 'gijang', 'sasang'];
const coffeeCapabilities = [
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
];
const optionCapabilities = ['pet_friendly', 'kids_zone', 'no_kids_zone', 'outdoor_seating', 'discount_available', 'rewards_available'];
const allCapabilities = [...coffeeCapabilities, ...optionCapabilities];
const staleThresholdDays = 90;
const targetCoffeeTagCount = 3;
const confidenceLabels = { A: 'A grade', B: 'B grade', C: 'C grade', D: 'D grade', X: 'Needs verification' };
const companionRules = [
  { has: 'hand_drip', missing: 'filter_coffee', reason: 'hand_drip usually implies filter_coffee availability' },
  { has: 'batch_brew', missing: 'filter_coffee', reason: 'batch_brew is a brewed filter-style option' },
  { has: 'decaf_bean', missing: 'decaf', reason: 'decaf beans can indicate a decaf drink/menu candidate' },
  { has: 'roastery', missing: 'bean_sales', reason: 'roastery cafes often sell beans' },
];

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

function addCount(map, key) {
  map.set(key, (map.get(key) || 0) + 1);
}

function formatCount(key, count, labels = {}) {
  const label = labels[key] || key;
  return count === 0 ? `! ${label}: 0` : `${label}: ${count}`;
}

function printSection(title, lines) {
  console.log(`\n${title}`);
  if (!lines.length) {
    console.log('- none');
    return;
  }
  lines.forEach((line) => console.log(`- ${line}`));
}

function daysSince(dateValue, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || '')) return null;
  const checkedAt = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(checkedAt.getTime())) return null;
  return Math.floor((now.getTime() - checkedAt.getTime()) / 86400000);
}

const bytes = await readFile(seedPath);
const rows = parseCsvRows(bytes.toString('utf8'));
const headers = rows[0]?.map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim()) || [];
const missingColumns = expectedColumns.filter((column) => !headers.includes(column));

if (missingColumns.length) {
  console.error(`Cannot build gap report. Missing columns: ${missingColumns.join(', ')}`);
  process.exit(1);
}

const records = rows.slice(1).map((row) => {
  const record = Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()]));
  const capabilities = record.capabilities.split('|').map((tag) => tag.trim()).filter(Boolean);
  const coffeeTagCount = capabilities.filter((tag) => coffeeCapabilities.includes(tag)).length;
  return { ...record, capabilities, coffeeTagCount };
});

const areaCounts = new Map(busanAreas.map((area) => [area, 0]));
const capabilityCounts = new Map(allCapabilities.map((capability) => [capability, 0]));
const confidenceCounts = new Map(['A', 'B', 'C', 'D', 'X', 'missing'].map((confidence) => [confidence, 0]));
let coffeeTagTotal = 0;

records.forEach((record) => {
  addCount(areaCounts, record.area || 'missing');
  addCount(confidenceCounts, record.confidence || 'missing');
  record.capabilities.forEach((capability) => addCount(capabilityCounts, capability));
  coffeeTagTotal += record.coffeeTagCount;
});

const today = new Date();
const staleRecords = records
  .map((record) => ({ ...record, ageDays: daysSince(record.verified_at, today) }))
  .filter((record) => record.ageDays !== null && record.ageDays > staleThresholdDays)
  .sort((a, b) => b.ageDays - a.ageDays || a.id.localeCompare(b.id));
const missingVerifiedAt = records.filter((record) => !record.verified_at);
const lowTagRecords = records
  .filter((record) => record.coffeeTagCount < targetCoffeeTagCount)
  .sort((a, b) => a.coffeeTagCount - b.coffeeTagCount || a.id.localeCompare(b.id));
const companionCandidates = [];

records.forEach((record) => {
  companionRules.forEach((rule) => {
    if (record.capabilities.includes(rule.has) && !record.capabilities.includes(rule.missing)) {
      companionCandidates.push(`${record.id} (${record.name}): has ${rule.has}, missing ${rule.missing} - ${rule.reason}`);
    }
  });
});

const rowCount = records.length;
const averageCoffeeTags = rowCount ? coffeeTagTotal / rowCount : 0;
const mvpGap = Math.max(150 - rowCount, 0);

console.log('BrewMap seed data gap report');
console.log(`Rows: ${rowCount}${mvpGap ? ` (${mvpGap} short of 150 cafe beta target)` : ''}`);
console.log(`Average coffee tags per cafe: ${averageCoffeeTags.toFixed(1)} / ${targetCoffeeTagCount.toFixed(1)}`);
console.log(`Generated: ${today.toISOString().slice(0, 10)}`);

printSection('Area coverage', [...areaCounts.entries()].map(([area, count]) => formatCount(area, count)));
printSection('Tag coverage', [...capabilityCounts.entries()].map(([capability, count]) => formatCount(capability, count)));
printSection('Confidence distribution', [...confidenceCounts.entries()].filter(([, count]) => count > 0).map(([confidence, count]) => formatCount(confidence, count, confidenceLabels)));
printSection(
  `Cafes below ${targetCoffeeTagCount} coffee tags`,
  lowTagRecords.map((record) => `${record.id}: ${record.coffeeTagCount} coffee tags`)
);
printSection(
  `verified_at older than ${staleThresholdDays} days`,
  staleRecords.map((record) => `${record.id}: ${record.verified_at} (${record.ageDays} days)`)
);
printSection('Missing verified_at', missingVerifiedAt.map((record) => record.id));
printSection('Possible companion tag candidates - operator review required', companionCandidates);

console.log('\nNo seed data was modified. Review candidates against docs/taxonomy.md before editing data/seed-cafes.csv.');