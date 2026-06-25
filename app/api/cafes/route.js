export const dynamic = 'force-dynamic';

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and publishable key are required.');
  }

  return { url, key };
}

async function readSupabase(path) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      accept: 'application/json',
      apikey: key,
      authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase request failed with ${response.status}: ${body.slice(0, 240)}`);
  }

  return response.json();
}

function groupCapabilities(rows) {
  return rows.reduce((groups, row) => {
    const group = groups.get(row.cafe_id) || [];
    group.push(row);
    groups.set(row.cafe_id, group);
    return groups;
  }, new Map());
}

function primaryCapability(rows) {
  return rows.reduce((selected, row) => {
    if (!selected) return row;
    return String(row.verified_at || '') > String(selected.verified_at || '') ? row : selected;
  }, null);
}

function mapCafe(row, capabilitiesByCafe) {
  const capabilityRows = capabilitiesByCafe.get(row.id) || [];
  const primary = primaryCapability(capabilityRows);

  return {
    id: row.id,
    name: row.name,
    city: row.city,
    area: row.area,
    address: row.address,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    capabilities: capabilityRows.map((capability) => capability.capability_id),
    confidence: primary?.confidence || 'X',
    verifiedAt: primary?.verified_at || '',
    source: primary?.verification_source || 'admin_verified',
    status: row.status,
    links: {
      naver: row.naver_map_url || '#',
      kakao: row.kakao_map_url || '#',
      google: row.google_map_url || '#',
    },
  };
}

export async function GET() {
  try {
    const [cafeRows, capabilityRows] = await Promise.all([
      readSupabase('cafes?select=id,name,city,area,address,latitude,longitude,naver_map_url,kakao_map_url,google_map_url,status&status=eq.active&order=area.asc,name.asc'),
      readSupabase('cafe_capabilities?select=cafe_id,capability_id,confidence,verification_source,verified_at'),
    ]);

    const capabilitiesByCafe = groupCapabilities(capabilityRows);
    const cafes = cafeRows.map((row) => mapCafe(row, capabilitiesByCafe));

    return Response.json(
      { source: 'supabase', cafes },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error(`BrewMap cafe API failed. ${error.message}`);
    return Response.json(
      { error: 'cafe_load_failed', message: error.message },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}