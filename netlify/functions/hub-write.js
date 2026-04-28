const crypto = require('crypto');

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function getCookie(event, name) {
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function verifyHubSession(event) {
  const secret = process.env.HUB_SECRET;
  const token = getCookie(event, 'hub_session');
  if (!secret || !token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expiresRaw, signature] = decoded.split('|');
    const raw = `${username}|${expiresRaw}`;
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    const expires = Number(expiresRaw);
    return (
      Boolean(username) &&
      Number.isFinite(expires) &&
      Date.now() < expires &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
    );
  } catch (_) {
    return false;
  }
}

const ALLOWED_TABLES = ['leads', 'partners'];

exports.handler = async (event) => {
  if (!verifyHubSession(event)) return json(401, { error: 'Unauthorized' });

  if (event.httpMethod !== 'POST' && event.httpMethod !== 'PATCH') {
    return json(405, { error: 'Method Not Allowed' });
  }

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (_) {}

  const { table, record, id } = body;

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return json(400, { error: 'Invalid or missing table. Allowed: leads, partners' });
  }
  if (!record || typeof record !== 'object') {
    return json(400, { error: 'Missing or invalid record object' });
  }

  const rawUrl = process.env.SUPABASE_URL || 'https://sjgrbcqgkxwvzetjhutf.supabase.co';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  // Use service key for writes if available, fall back to anon key
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || 'sb_publishable_dIek41t_shwMSKbv1aUQbA_QE29KUaO';

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  try {
    let url = `${supabaseUrl}/rest/v1/${table}`;
    let method = 'POST';

    if (event.httpMethod === 'PATCH' && id) {
      url += `?id=eq.${encodeURIComponent(id)}`;
      method = 'PATCH';
    }

    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(record)
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(`hub-write ${method} ${table} failed:`, response.status, text);
      return json(500, { error: `Supabase write failed: ${response.status}`, details: text });
    }

    const data = text ? JSON.parse(text) : null;
    return json(200, { success: true, data });
  } catch (error) {
    console.error('hub-write crash:', error.message);
    return json(500, { error: 'Write failed', details: error.message });
  }
};
