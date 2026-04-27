exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const rawUrl = process.env.SUPABASE_URL || 'https://sjgrbcqgkxwvzetjhutf.supabase.co';
  const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_dIek41t_shwMSKbv1aUQbA_QE29KUaO';

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing SUPABASE_URL or SUPABASE_KEY' })
    };
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json'
  };

  async function readTable(path) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, { headers });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${path} failed with ${response.status}: ${text}`);
    }
    return text ? JSON.parse(text) : [];
  }

  try {
    const [leads, partners] = await Promise.all([
      readTable('leads?select=*&order=created_at.desc'),
      readTable('partners?select=*&order=created_at.desc')
    ]);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      },
      body: JSON.stringify({ leads, partners })
    };
  } catch (error) {
    console.error('hub-data error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Unable to load HUB data', details: error.message })
    };
  }
};
