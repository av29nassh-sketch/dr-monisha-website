const webpush = require('web-push');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Supabase sends the new row in req.body.record
  const booking = req.body?.record;
  if (!booking) {
    return res.status(400).json({ error: 'No booking data' });
  }

  // Fetch all push subscriptions from Supabase
  const response = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=subscription`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const rows = await response.json();
  if (!rows || rows.length === 0) {
    return res.status(200).json({ message: 'No subscribers' });
  }

  const payload = JSON.stringify({
    title: 'New Booking Request',
    body: `${booking.name} — ${booking.service || 'Consultation'} on ${booking.date || ''}`,
    url: '/admin.html',
  });

  const results = await Promise.allSettled(
    rows.map(row => webpush.sendNotification(row.subscription, payload))
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return res.status(200).json({ sent, failed });
};
