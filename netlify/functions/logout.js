exports.handler = async () => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Set-Cookie': 'hub_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
  },
  body: JSON.stringify({ success: true })
});
