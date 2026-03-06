// Saves an FCM token for a device to Supabase so send-push.js can reach it.
// Called from admin.html after Firebase Messaging generates a token.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'Missing token' });

  const response = await fetch(`${SUPABASE_URL}/rest/v1/fcm_tokens`, {
    method: 'POST',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'resolution=merge-duplicates',
    },
    body: JSON.stringify({ token, updated_at: new Date().toISOString() }),
  });

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ error: text });
  }

  return res.status(200).json({ ok: true });
};
