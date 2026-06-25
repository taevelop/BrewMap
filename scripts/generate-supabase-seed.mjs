import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const seedPath = 'data/seed-cafes.csv';
const outputPath = 'supabase/seed.sql';

const capabilityCatalog = [
  { id: 'filter_coffee', label_ko: '필터커피', group_name: '커피 종류', is_mvp_filter: true },
  { id: 'cold_brew', label_ko: '콜드브루', group_name: '커피 종류', is_mvp_filter: true },
  { id: 'decaf', label_ko: '디카페인', group_name: '커피 종류', is_mvp_filter: true },
  { id: 'flat_white', label_ko: '플랫화이트', group_name: '커피 종류', is_mvp_filter: true },
  { id: 'einspanner', label_ko: '아인슈페너', group_name: '커피 종류', is_mvp_filter: false },
  { id: 'single_origin', label_ko: '싱글오리진', group_name: '원두', is_mvp_filter: true },
  { id: 'house_blend', label_ko: '하우스 블렌드', group_name: '원두', is_mvp_filter: false },
  { id: 'decaf_bean', label_ko: '디카페인 원두', group_name: '원두', is_mvp_filter: false },
  { id: 'hand_drip', label_ko: '핸드드립', group_name: '추출', is_mvp_filter: false },
  { id: 'batch_brew', label_ko: '배치브루', group_name: '추출', is_mvp_filter: false },
  { id: 'espresso_machine', label_ko: '에스프레소 머신', group_name: '추출', is_mvp_filter: false },
  { id: 'bean_sales', label_ko: '원두구매', group_name: '구매', is_mvp_filter: true },
  { id: 'dripbag_sales', label_ko: '드립백 판매', group_name: '구매', is_mvp_filter: false },
  { id: 'roastery', label_ko: '로스터리', group_name: '매장', is_mvp_filter: false },
  { id: 'specialty_coffee', label_ko: '스페셜티 커피', group_name: '매장', is_mvp_filter: false },
  { id: 'pet_friendly', label_ko: '애견 동반', group_name: '옵션', is_mvp_filter: false },
  { id: 'kids_zone', label_ko: '키즈존', group_name: '옵션', is_mvp_filter: false },
  { id: 'no_kids_zone', label_ko: '노키즈존', group_name: '옵션', is_mvp_filter: false },
  { id: 'outdoor_seating', label_ko: '야외 좌석', group_name: '옵션', is_mvp_filter: false },
  { id: 'discount_available', label_ko: '할인 가능', group_name: '옵션', is_mvp_filter: false },
  { id: 'rewards_available', label_ko: '적립 가능', group_name: '옵션', is_mvp_filter: false },
];

const requiredColumns = ['id', 'name', 'city', 'area', 'address', 'latitude', 'longitude', 'capabilities', 'confidence', 'verification_source'];
const optionalColumns = ['verified_at', 'naver_map_url', 'kakao_map_url', 'google_map_url'];
const allowedColumns = new Set([...requiredColumns, ...optionalColumns]);
const allowedCapabilities = new Set(capabilityCatalog.map((capability) => capability.id));
const confidenceLevels = new Set(['A', 'B', 'C', 'D', 'X']);
const verificationSources = new Set(['owner_verified', 'admin_verified', 'user_report', 'menu_photo']);

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

function sqlString(value) {
  if (value === undefined || value === null || value === '') return 'null';
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlDate(value) {
  return value ? `${sqlString(value)}::date` : 'null';
}

function sqlNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Invalid number: ${value}`);
  return String(number);
}

function sqlBoolean(value) {
  return value ? 'true' : 'false';
}

function valuesBlock(rows) {
  return rows.map((row) => `  (${row.join(', ')})`).join(',\n');
}

const bytes = await readFile(seedPath);
const rows = parseCsvRows(bytes.toString('utf8'));
const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, '') : header).trim());
const headerSet = new Set(headers);
const missingColumns = requiredColumns.filter((column) => !headerSet.has(column));
const unknownColumns = headers.filter((column) => !allowedColumns.has(column));

if (missingColumns.length) throw new Error(`Missing required CSV columns: ${missingColumns.join(', ')}`);
if (unknownColumns.length) throw new Error(`Unknown CSV columns: ${unknownColumns.join(', ')}`);

const cafes = rows.slice(1).map((row, index) => {
  const record = Object.fromEntries(headers.map((header, headerIndex) => [header, (row[headerIndex] || '').trim()]));
  const rowNumber = index + 2;
  requiredColumns.forEach((column) => {
    if (!record[column]) throw new Error(`${rowNumber}: ${column} is required.`);
  });
  if (!confidenceLevels.has(record.confidence)) throw new Error(`${rowNumber}: invalid confidence ${record.confidence}.`);
  if (!verificationSources.has(record.verification_source)) throw new Error(`${rowNumber}: invalid verification source ${record.verification_source}.`);
  const capabilities = record.capabilities.split('|').map((tag) => tag.trim()).filter(Boolean);
  capabilities.forEach((capability) => {
    if (!allowedCapabilities.has(capability)) throw new Error(`${rowNumber}: unknown capability ${capability}.`);
  });
  return { ...record, capabilities };
});

const capabilityRows = capabilityCatalog.map((capability) => [
  sqlString(capability.id),
  sqlString(capability.label_ko),
  sqlString(capability.group_name),
  sqlBoolean(capability.is_mvp_filter),
]);

const cafeRows = cafes.map((cafe) => [
  sqlString(cafe.id),
  sqlString(cafe.name),
  sqlString(cafe.city),
  sqlString(cafe.area),
  sqlString(cafe.address),
  sqlNumber(cafe.latitude),
  sqlNumber(cafe.longitude),
  sqlString(cafe.naver_map_url || '#'),
  sqlString(cafe.kakao_map_url || '#'),
  sqlString(cafe.google_map_url || '#'),
  sqlString('active'),
]);

const cafeCapabilityRows = cafes.flatMap((cafe) => cafe.capabilities.map((capability) => [
  sqlString(cafe.id),
  sqlString(capability),
  sqlString(cafe.confidence),
  sqlString(cafe.verification_source),
  sqlDate(cafe.verified_at),
  'null',
]));

const cafeIdList = cafes.map((cafe) => sqlString(cafe.id)).join(', ');
const sql = `-- Generated by scripts/generate-supabase-seed.mjs.
-- Run this after supabase/migrations/20260625000000_initial_schema.sql.

begin;

insert into coffee_capabilities (id, label_ko, group_name, is_mvp_filter)
values
${valuesBlock(capabilityRows)}
on conflict (id) do update set
  label_ko = excluded.label_ko,
  group_name = excluded.group_name,
  is_mvp_filter = excluded.is_mvp_filter;

insert into cafes (id, name, city, area, address, latitude, longitude, naver_map_url, kakao_map_url, google_map_url, status)
values
${valuesBlock(cafeRows)}
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  area = excluded.area,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  naver_map_url = excluded.naver_map_url,
  kakao_map_url = excluded.kakao_map_url,
  google_map_url = excluded.google_map_url,
  status = excluded.status;

delete from cafe_capabilities
where cafe_id in (${cafeIdList});

insert into cafe_capabilities (cafe_id, capability_id, confidence, verification_source, verified_at, notes)
values
${valuesBlock(cafeCapabilityRows)}
on conflict (cafe_id, capability_id) do update set
  confidence = excluded.confidence,
  verification_source = excluded.verification_source,
  verified_at = excluded.verified_at,
  notes = excluded.notes;

commit;
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, sql, 'utf8');
console.log(`Wrote ${outputPath}`);
console.log(`Capabilities: ${capabilityRows.length}`);
console.log(`Cafes: ${cafeRows.length}`);
console.log(`Cafe capabilities: ${cafeCapabilityRows.length}`);