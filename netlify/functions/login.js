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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });

  const expectedUser = process.env.HUB_USERNAME;
  const expectedPassword = process.env.HUB_PASSWORD;
  const secret = process.env.HUB_SECRET;

  if (!expectedUser || !expectedPassword || !secret) {
    return json(500, { error: 'HUB auth is not configured. Add HUB_USERNAME, HUB_PASSWORD, and HUB_SECRET in Netlify.' });
  }

  let payload = {};
  try { payload = JSON.parse(event.body || '{}'); } catch (_) {}

  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');

  if (username !== expectedUser || password !== expectedPassword) {
    return json(401, { error: 'Invalid credentials' });
  }

  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const raw = `${username}|${expires}`;
  const token = Buffer.from(`${raw}|${sign(raw, secret)}`).toString('base64url');

  return json(200, { success: true }, {
    'Set-Cookie': `hub_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${8 * 60 * 60}`
  });
};
