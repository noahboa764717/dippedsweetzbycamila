const { getStore } = require('@netlify/blobs');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'no-store',
};

const THEME_STORE = 'site-settings';
const THEME_KEY = 'seasonal-theme';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    let theme = await getStore(THEME_STORE).get(THEME_KEY, { type: 'json' });

    // Keep an existing env-var theme visible until the first save moves it to Blobs.
    if (!theme && process.env.SITE_THEME) {
      try {
        theme = JSON.parse(process.env.SITE_THEME);
      } catch {
        console.warn('SITE_THEME is not valid JSON.');
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(theme || null),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
