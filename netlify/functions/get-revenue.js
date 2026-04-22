const Stripe = require('stripe');

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // Get all invoices (up to 100 most recent)
    const invoices = await stripe.invoices.list({
      limit: 100,
      expand: ['data.customer'],
    });

    const all = invoices.data;

    // Summary stats
    const totalInvoiced  = all.reduce((s, i) => s + i.amount_due, 0) / 100;
    const totalPaid      = all.reduce((s, i) => s + i.amount_paid, 0) / 100;
    const totalOutstanding = all
      .filter(i => i.status === 'open')
      .reduce((s, i) => s + i.amount_due, 0) / 100;
    const totalVoid      = all.filter(i => i.status === 'void').length;
    const countPaid      = all.filter(i => i.status === 'paid').length;
    const countOpen      = all.filter(i => i.status === 'open').length;

    // Monthly breakdown for chart (last 12 months)
    const now     = new Date();
    const monthly = {};

    for (let i = 11; i >= 0; i--) {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthly[key] = { label, invoiced: 0, paid: 0, month: key };
    }

    all.forEach(inv => {
      const d   = new Date(inv.created * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthly[key]) {
        monthly[key].invoiced += inv.amount_due  / 100;
        monthly[key].paid     += inv.amount_paid / 100;
      }
    });

    // Recent invoices (last 10)
    const recent = all.slice(0, 10).map(inv => ({
      id:            inv.id,
      number:        inv.number,
      customerName:  inv.customer?.name  || 'Unknown',
      customerEmail: inv.customer?.email || '',
      amountDue:     inv.amount_due  / 100,
      amountPaid:    inv.amount_paid / 100,
      status:        inv.status,
      created:       inv.created,
      hostedUrl:     inv.hosted_invoice_url,
    }));

    // Top customers by spend
    const customerMap = {};
    all.filter(i => i.status === 'paid').forEach(inv => {
      const email = inv.customer?.email || 'unknown';
      const name  = inv.customer?.name  || email;
      if (!customerMap[email]) customerMap[email] = { name, email, total: 0, count: 0 };
      customerMap[email].total += inv.amount_paid / 100;
      customerMap[email].count++;
    });
    const topCustomers = Object.values(customerMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        summary: { totalInvoiced, totalPaid, totalOutstanding, countPaid, countOpen, totalVoid },
        monthly: Object.values(monthly),
        recent,
        topCustomers,
      }),
    };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
