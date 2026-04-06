// ════════════════════════════════════════════════════════════════
//  POST /api/send-push
//  Triggered by Supabase database webhook on new bookings.
//  Protected by `x-webhook-secret` header matching WEBHOOK_SECRET env.
//
//  To wire this up in Supabase:
//  1. Database → Webhooks → Create
//  2. Table: bookings · Event: INSERT
//  3. URL: https://<your-vercel-url>/api/send-push
//  4. HTTP headers → add `x-webhook-secret: <your-WEBHOOK_SECRET>`
// ════════════════════════════════════════════════════════════════

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET;

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }
  const provided = req.headers['x-webhook-secret'];
  if (!provided || !safeEqual(provided, WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const booking = req.body?.record;
  if (!booking) {
    return res.status(400).json({ error: 'No booking data' });
  }

  let rows;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/fcm_tokens?select=token`, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    });
    rows = await response.json();
  } catch (err) {
    console.error('FCM token fetch error:', err);
    return res.status(500).json({ error: 'Token fetch failed' });
  }

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
    return res.status(500).json({ error: 'FCM send failed' });
  }

  const sent   = result.responses.filter(r => r.success).length;
  const failed = result.responses.filter(r => !r.success).length;

  // Cleanup invalid tokens
  const invalidTokens = result.responses
    .map((r, i) => (!r.success ? tokens[i] : null))
    .filter(Boolean);

  if (invalidTokens.length > 0) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/fcm_tokens?token=in.(${invalidTokens.map(t => `"${t}"`).join(',')})`, {
        method: 'DELETE',
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer':        'return=minimal',
        },
      });
    } catch (err) {
      console.error('Token cleanup failed:', err);
    }
  }

  return res.status(200).json({ sent, failed });
};
