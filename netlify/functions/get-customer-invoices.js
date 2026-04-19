const Stripe = require('stripe');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Verify Netlify Identity JWT
  const authHeader = event.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Get user email from Identity token
    const token = authHeader.replace('Bearer ', '');
    const identityUrl = process.env.URL || '';
    
    // Verify token with Netlify Identity
    const userRes = await fetch(`${identityUrl}/.netlify/identity/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Invalid token' }) };
    }

    const user = await userRes.json();
    const email = user.email;

    // Find Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (!customers.data.length) {
      // No Stripe customer yet — return empty
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ invoices: [], customer: null }),
      };
    }

    const customer = customers.data[0];

    // Get all invoices for this customer
    const invoices = await stripe.invoices.list({
      customer: customer.id,
      limit: 50,
    });

    const mapped = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      amountDue: inv.amount_due / 100,
      amountPaid: inv.amount_paid / 100,
      status: inv.status,
      created: inv.created,
      dueDate: inv.due_date,
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
      description: inv.description || '',
      lines: inv.lines.data.map(l => ({
        description: l.description,
        quantity: l.quantity,
        amount: l.amount / 100,
      })),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        invoices: mapped,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
        },
      }),
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
