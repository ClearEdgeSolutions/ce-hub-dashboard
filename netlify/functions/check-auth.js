const crypto = require('crypto');

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function getCookie(event, name) {
  const cookie = event.headers.cookie || event.headers.Cookie || '';
  const match = cookie.split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : '';
}

function verifySession(event) {
  const secret = process.env.HUB_SECRET;
  const token = getCookie(event, 'hub_session');
  if (!secret || !token) return false;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [username, expiresRaw, signature] = decoded.split('|');
    const raw = `${username}|${expiresRaw}`;
    const expected = sign(raw, secret);
    const expires = Number(expiresRaw);
    return Boolean(username) && Number.isFinite(expires) && Date.now() < expires && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (_) {
    return false;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method Not Allowed' });
  if (!verifySession(event)) return json(401, { authenticated: false });
  return json(200, { authenticated: true });
};
