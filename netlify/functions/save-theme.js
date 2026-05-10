const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: 'Method not allowed' };

  const siteId = process.env.NETLIFY_SITE_ID;
  const token  = process.env.NETLIFY_ACCESS_TOKEN;

  if (!siteId || !token) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Missing NETLIFY_SITE_ID or NETLIFY_ACCESS_TOKEN' }) };
  }

  try {
    const body = event.body; // raw JSON string of the theme config

    // Try update first, then create if it doesn't exist
    let res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/SITE_THEME`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: 'SITE_THEME',
        values: [{ context: 'all', value: body }],
      }),
    });

    if (res.status === 404) {
      // Env var doesn't exist yet — create it
      res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{
          key: 'SITE_THEME',
          values: [{ context: 'all', value: body }],
        }]),
      });
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Netlify API error: ${err}`);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
