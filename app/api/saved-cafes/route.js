export const dynamic = 'force-dynamic';

const defaultListName = '가보고 싶은 곳';

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new ApiError(503, 'Supabase URL and publishable key are required.');
  }

  return { url, key };
}

function bearerToken(request) {
  const header = request.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new ApiError(401, 'Supabase access token is required.');
  }

  return match[1].trim();
}

function encodeFilter(value) {
  return encodeURIComponent(value);
}

async function supabaseRest(path, { method = 'GET', token, body, prefer = '' } = {}) {
  const { url, key } = supabaseConfig();
  const headers = {
    accept: 'application/json',
    apikey: key,
    authorization: `Bearer ${token}`,
  };

  if (body !== undefined) headers['content-type'] = 'application/json';
  if (prefer) headers.prefer = prefer;

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new ApiError(response.status, `Supabase request failed with ${response.status}: ${responseBody.slice(0, 240)}`);
  }

  if (response.status === 204) return null;

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function ensureSavedList(token) {
  const existingRows = await supabaseRest('saved_lists?select=id,name&order=created_at.asc&limit=1', { token });
  if (existingRows?.[0]?.id) return existingRows[0];

  const createdRows = await supabaseRest('saved_lists?select=id,name', {
    method: 'POST',
    token,
    body: [{ name: defaultListName }],
    prefer: 'return=representation',
  });

  if (!createdRows?.[0]?.id) {
    throw new ApiError(502, 'Could not create a saved cafe list.');
  }

  return createdRows[0];
}

async function readSavedCafeIds(token, listId) {
  const rows = await supabaseRest(`saved_cafes?select=cafe_id&list_id=eq.${encodeFilter(listId)}&order=created_at.desc`, { token });
  return (rows || []).map((row) => row.cafe_id).filter(Boolean);
}

function validateCafeId(cafeId) {
  if (typeof cafeId !== 'string' || !/^[a-z0-9][a-z0-9-]{1,160}$/.test(cafeId)) {
    throw new ApiError(400, 'A valid cafeId is required.');
  }

  return cafeId;
}

async function readRequestCafeId(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    throw new ApiError(400, 'Request body must be JSON.');
  }

  return validateCafeId(payload.cafeId);
}

function savedCafeResponse(savedCafeIds) {
  return Response.json(
    { savedCafeIds },
    { headers: { 'cache-control': 'no-store' } },
  );
}

function errorResponse(error) {
  const status = error instanceof ApiError ? error.status : 500;
  const code = status === 401 ? 'auth_required' : 'saved_cafes_failed';

  console.error(`BrewMap saved cafes API failed. ${error.message}`);
  return Response.json(
    { error: code, message: error.message },
    { status, headers: { 'cache-control': 'no-store' } },
  );
}

export async function GET(request) {
  try {
    const token = bearerToken(request);
    const list = await ensureSavedList(token);
    return savedCafeResponse(await readSavedCafeIds(token, list.id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const token = bearerToken(request);
    const cafeId = await readRequestCafeId(request);
    const list = await ensureSavedList(token);

    await supabaseRest('saved_cafes?on_conflict=list_id,cafe_id', {
      method: 'POST',
      token,
      body: [{ list_id: list.id, cafe_id: cafeId }],
      prefer: 'resolution=ignore-duplicates,return=minimal',
    });

    return savedCafeResponse(await readSavedCafeIds(token, list.id));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request) {
  try {
    const token = bearerToken(request);
    const cafeId = await readRequestCafeId(request);
    const list = await ensureSavedList(token);

    await supabaseRest(`saved_cafes?list_id=eq.${encodeFilter(list.id)}&cafe_id=eq.${encodeFilter(cafeId)}`, {
      method: 'DELETE',
      token,
      prefer: 'return=minimal',
    });

    return savedCafeResponse(await readSavedCafeIds(token, list.id));
  } catch (error) {
    return errorResponse(error);
  }
}
