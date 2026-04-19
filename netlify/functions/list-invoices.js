const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://dippedsweetzbycamila.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const invoices = await stripe.invoices.list({
      limit: 50,
      expand: ['data.customer'],
    });

    const mapped = invoices.data.map(inv => ({
      id: inv.id,
      number: inv.number,
      customerName: inv.customer?.name || 'Unknown',
      customerEmail: inv.customer?.email || '',
      amountDue: inv.amount_due / 100,
      amountPaid: inv.amount_paid / 100,
      status: inv.status,
      created: inv.created,
      dueDate: inv.due_date,
      hostedUrl: inv.hosted_invoice_url,
      pdfUrl: inv.invoice_pdf,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ invoices: mapped }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
