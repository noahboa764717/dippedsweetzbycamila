const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=60', // cache 60s so it's fast
};

exports.handler = async () => {
  try {
    const theme = process.env.SITE_THEME || 'null';
    return {
      statusCode: 200,
      headers,
      body: theme,
    };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
