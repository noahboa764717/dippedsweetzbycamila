// save-orders.js
// Saves order data back to a Netlify environment variable via the Netlify API
// This is our free persistence layer since we don't have a database

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { orders } = JSON.parse(event.body);
    const siteId     = process.env.NETLIFY_SITE_ID;
    const token      = process.env.NETLIFY_ACCESS_TOKEN;

    if (!siteId || !token) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing NETLIFY_SITE_ID or NETLIFY_ACCESS_TOKEN env vars' }),
      };
    }

    // Update the ORDERS_DATA env var via Netlify API
    const res = await fetch(`https://api.netlify.com/api/v1/sites/${siteId}/env/ORDERS_DATA`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        key: 'ORDERS_DATA',
        values: [{ context: 'all', value: JSON.stringify(orders) }],
      }),
    });

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
