const Stripe = require('stripe');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const authHeader = event.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const token = authHeader.replace('Bearer ', '');
    const identityUrl = process.env.URL || '';

    const userRes = await fetch(`${identityUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    const user = await userRes.json();
    const email = user.email;

    // Find or create Stripe customer
    let customer;
    const existing = await stripe.customers.list({ email, limit: 1 });

    if (existing.data.length) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        email,
        name: user.user_metadata?.full_name || email,
      });
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.URL}/account.html`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
