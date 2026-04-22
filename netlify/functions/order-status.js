const { Resend } = require('resend');

const ORDERS_KEY = 'ds_orders'; // We'll use a simple JSON store via Drive or env

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
};

// Status colors and labels for emails
const STATUS_CONFIG = {
  received:    { label: 'Order Received',     emoji: '🎉', color: '#6c9bd2', desc: 'We\'ve received your order and will begin preparing it soon!' },
  preparing:   { label: 'Being Prepared',     emoji: '👩‍🍳', color: '#e8a838', desc: 'Your treats are currently being made fresh just for you!' },
  ready:       { label: 'Ready for Pickup',   emoji: '✅', color: '#2e7d52', desc: 'Your order is ready! Please come pick it up at your convenience.' },
  out_delivery:{ label: 'Out for Delivery',   emoji: '🚗', color: '#d4576f', desc: 'Your order is on its way to you right now!' },
  delivered:   { label: 'Delivered',          emoji: '🍓', color: '#2e7d52', desc: 'Your order has been delivered. Enjoy your treats!' },
  cancelled:   { label: 'Cancelled',          emoji: '❌', color: '#c0392b', desc: 'Your order has been cancelled. Please contact us if you have questions.' },
};

function buildEmailHtml(order, status, customMessage) {
  const cfg = STATUS_CONFIG[status] || { label: status, emoji: '📦', color: '#d4576f', desc: '' };
  const items = (order.items || []).map(i =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8eb;font-size:15px;color:#2d1a14;">${i.description}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8eb;font-size:15px;color:#2d1a14;text-align:center;">${i.quantity || 1}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8eb;font-size:15px;color:#6e4a3a;text-align:right;font-weight:600;">$${(i.price || 0).toFixed(2)}</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6eef1;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6eef1;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:white;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(110,74,58,.12);">
        
        <!-- HEADER -->
        <tr>
          <td style="background:#d4576f;padding:36px 40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🍓</div>
            <div style="font-family:Georgia,serif;font-size:24px;color:white;font-weight:700;">Dipped Sweetz by Camila</div>
            <div style="color:rgba(255,255,255,.8);font-size:14px;margin-top:4px;">dippedsweetzbycamila.com</div>
          </td>
        </tr>

        <!-- STATUS BADGE -->
        <tr>
          <td style="padding:36px 40px 0;text-align:center;">
            <div style="display:inline-block;background:${cfg.color}18;border:2px solid ${cfg.color};border-radius:50px;padding:12px 28px;margin-bottom:16px;">
              <span style="font-size:24px;">${cfg.emoji}</span>
              <span style="font-size:18px;font-weight:700;color:${cfg.color};margin-left:8px;">${cfg.label}</span>
            </div>
            <h1 style="font-family:Georgia,serif;font-size:28px;color:#2d1a14;margin:0 0 10px;">Order Update</h1>
            <p style="color:#7a5a52;font-size:16px;line-height:1.6;margin:0 0 8px;">Hi ${order.customerName || 'there'}!</p>
            <p style="color:#7a5a52;font-size:15px;line-height:1.6;margin:0;">${customMessage || cfg.desc}</p>
          </td>
        </tr>

        <!-- ORDER DETAILS -->
        <tr>
          <td style="padding:28px 40px;">
            <div style="background:#fdf5f7;border-radius:12px;padding:24px;">
              <div style="font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7a5a52;margin-bottom:16px;">Order Details</div>
              <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <span style="color:#7a5a52;font-size:14px;">Order #</span>
                <span style="font-weight:700;color:#2d1a14;font-size:14px;">${order.id || 'N/A'}</span>
              </div>
              <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                <span style="color:#7a5a52;font-size:14px;">Date</span>
                <span style="color:#2d1a14;font-size:14px;">${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
              </div>
              ${items ? `
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0e8eb;">
                <tr>
                  <th style="text-align:left;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7a5a52;padding:10px 0;">Item</th>
                  <th style="text-align:center;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7a5a52;padding:10px 0;">Qty</th>
                  <th style="text-align:right;font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#7a5a52;padding:10px 0;">Price</th>
                </tr>
                ${items}
                <tr>
                  <td colspan="2" style="padding:14px 0 0;font-weight:700;font-size:16px;color:#2d1a14;">Total</td>
                  <td style="padding:14px 0 0;font-weight:700;font-size:18px;color:#d4576f;text-align:right;">$${(order.total || 0).toFixed(2)}</td>
                </tr>
              </table>` : ''}
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="https://dippedsweetzbycamila.com/account.html" style="display:inline-block;background:#d4576f;color:white;text-decoration:none;padding:14px 32px;border-radius:40px;font-size:15px;font-weight:700;">View Your Account →</a>
            <p style="color:#7a5a52;font-size:13px;margin-top:16px;line-height:1.6;">Questions? DM us on <a href="https://instagram.com/dippedsweetz_by_camila" style="color:#d4576f;">Instagram</a> or email <a href="mailto:cderrosa@dippedsweetzbycamila.com" style="color:#d4576f;">cderrosa@dippedsweetzbycamila.com</a></p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#6e4a3a;padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,.7);font-size:13px;margin:0;">© 2026 Dipped Sweetz by Camila · Jasper, Georgia</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const method = event.httpMethod;

  try {
    // GET — fetch all orders or single order by customer email
    if (method === 'GET') {
      const params = new URLSearchParams(event.queryStringParameters || {});
      const email  = params.get('email');
      const all    = params.get('all'); // admin only

      const stored = JSON.parse(process.env.ORDERS_DATA || '[]');

      if (email) {
        const orders = stored.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
        return { statusCode: 200, headers, body: JSON.stringify({ orders }) };
      }

      if (all) {
        return { statusCode: 200, headers, body: JSON.stringify({ orders: stored }) };
      }

      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing email or all param' }) };
    }

    // POST — create new order (admin)
    if (method === 'POST') {
      const body  = JSON.parse(event.body);
      const stored = JSON.parse(process.env.ORDERS_DATA || '[]');

      const order = {
        id:            `DS-${Date.now().toString(36).toUpperCase()}`,
        customerName:  body.customerName,
        customerEmail: body.customerEmail,
        items:         body.items || [],
        total:         body.total || 0,
        status:        'received',
        notes:         body.notes || '',
        createdAt:     new Date().toISOString(),
        updatedAt:     new Date().toISOString(),
        history:       [{ status: 'received', timestamp: new Date().toISOString(), message: 'Order created' }],
      };

      stored.push(order);

      // Send confirmation email
      if (body.customerEmail && body.sendEmail !== false) {
        await resend.emails.send({
          from:    'Dipped Sweetz <orders@dippedsweetzbycamila.com>',
          to:      body.customerEmail,
          subject: `🍓 Order Confirmed — ${order.id}`,
          html:    buildEmailHtml(order, 'received', body.customMessage),
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, order, allOrders: stored }),
      };
    }

    // PUT — update order status (admin)
    if (method === 'PUT') {
      const body   = JSON.parse(event.body);
      const stored = JSON.parse(process.env.ORDERS_DATA || '[]');
      const idx    = stored.findIndex(o => o.id === body.orderId);

      if (idx === -1) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Order not found' }) };

      const prev = stored[idx].status;
      stored[idx].status    = body.status;
      stored[idx].updatedAt = new Date().toISOString();
      stored[idx].history   = stored[idx].history || [];
      stored[idx].history.push({
        status:    body.status,
        timestamp: new Date().toISOString(),
        message:   body.message || '',
      });

      // Send status update email
      if (stored[idx].customerEmail && body.sendEmail !== false && body.status !== prev) {
        await resend.emails.send({
          from:    'Dipped Sweetz <orders@dippedsweetzbycamila.com>',
          to:      stored[idx].customerEmail,
          subject: `${STATUS_CONFIG[body.status]?.emoji || '📦'} Order ${stored[idx].id} — ${STATUS_CONFIG[body.status]?.label || body.status}`,
          html:    buildEmailHtml(stored[idx], body.status, body.customMessage),
        });
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, order: stored[idx], allOrders: stored }),
      };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
