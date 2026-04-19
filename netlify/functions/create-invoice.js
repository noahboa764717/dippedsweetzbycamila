const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://dippedsweetzbycamila.com',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { customerName, customerEmail, items, note, dueDate } = JSON.parse(event.body);

    if (!customerEmail || !items || !items.length) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Find or create customer in Stripe
    let customer;
    const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (existing.data.length) {
      customer = existing.data[0];
    } else {
      customer = await stripe.customers.create({
        name: customerName,
        email: customerEmail,
      });
    }

    // Create invoice
    const invoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: 'send_invoice',
      days_until_due: dueDate || 7,
      description: note || '',
      metadata: { created_by: 'Dipped Sweetz Admin' },
    });

    // Add line items
    for (const item of items) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        description: item.description,
        quantity: item.quantity || 1,
        unit_amount: Math.round(item.price * 100), // convert dollars to cents
        currency: 'usd',
      });
    }

    // Finalize and send invoice
    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalized.id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        invoiceId: finalized.id,
        invoiceUrl: finalized.hosted_invoice_url,
        invoiceNumber: finalized.number,
        amountDue: finalized.amount_due / 100,
      }),
    };

  } catch (err) {
    console.error('Stripe error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
