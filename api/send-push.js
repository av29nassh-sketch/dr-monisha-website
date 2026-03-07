// FCM push notification sender — triggered by Supabase webhook on new booking
// Requires env vars:
//   FIREBASE_SERVICE_ACCOUNT  — Firebase Admin SDK service account JSON (stringified)
//   SUPABASE_URL              — e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY      — Supabase service role key

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK once (Vercel keeps functions warm)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Supabase sends the new row in req.body.record
  const booking = req.body?.record;
  if (!booking) {
    return res.status(400).json({ error: 'No booking data' });
  }

  // Fetch all FCM tokens from Supabase
  const response = await fetch(`${SUPABASE_URL}/rest/v1/fcm_tokens?select=token`, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  });

  const rows = await response.json();
  if (!rows || rows.length === 0) {
    return res.status(200).json({ message: 'No FCM subscribers' });
  }

  const tokens = rows.map(r => r.token).filter(Boolean);
  if (tokens.length === 0) {
    return res.status(200).json({ message: 'No valid tokens' });
  }

  const consultType = booking.type === 'offline' ? 'In-person' : 'Online';
  const dateStr     = booking.date || '';
  const timeStr     = booking.time || '';

  // Data-only message — forces delivery through the service worker push event
  // (notification field bypasses SW on Android, so we omit it)
  const message = {
    data: {
      title: `New ${consultType} Booking`,
      body:  `${booking.name} — ${dateStr} at ${timeStr}`,
      url:   '/admin.html',
    },
    webpush: {
      headers: { Urgency: 'high' },
    },
    tokens,
  };

  let result;
  try {
    result = await admin.messaging().sendEachForMulticast(message);
  } catch (err) {
    console.error('FCM sendEachForMulticast error:', err);
    return res.status(500).json({ error: 'FCM send failed', detail: err.message });
  }

  const sent   = result.responses.filter(r => r.success).length;
  const failed = result.responses.filter(r => !r.success).length;

  // Remove any expired/invalid tokens from Supabase
  const invalidTokens = result.responses
    .map((r, i) => (!r.success ? tokens[i] : null))
    .filter(Boolean);

  if (invalidTokens.length > 0) {
    await fetch(`${SUPABASE_URL}/rest/v1/fcm_tokens?token=in.(${invalidTokens.map(t => `"${t}"`).join(',')})`, {
      method: 'DELETE',
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal',
      },
    });
  }

  return res.status(200).json({ sent, failed });
};
