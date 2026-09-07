const { getStore } = require('@netlify/blobs');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const THEME_STORE = 'site-settings';
const THEME_KEY = 'seasonal-theme';

function badRequest(message) {
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: message }),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    if (!event.body) return badRequest('A theme configuration is required.');

    let config;
    try {
      config = JSON.parse(event.body);
    } catch {
      return badRequest('The theme configuration must be valid JSON.');
    }

    if (!config || typeof config !== 'object' || Array.isArray(config)) {
      return badRequest('The theme configuration must be an object.');
    }

    // Blobs is writable from a function without a personal access token or a rebuild.
    // Unlike environment variables, a saved theme is therefore available immediately.
    await getStore(THEME_STORE).setJSON(THEME_KEY, config);

    return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Unable to save the theme. Please try again.' }),
    };
  }
};
