// ════════════════════════════════════════════════════════════════
//  POST /api/save-fcm-token
//  ADMIN ONLY — only the doctor's logged-in admin browser registers tokens.
//  Requires `x-admin-token` header matching ADMIN_PASSWORD env.
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Admin not configured' });
  const adminToken = req.headers['x-admin-token'];
  if (!adminToken || !safeEqual(adminToken, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || token.length < 50 || token.length > 4096) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
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
      const errText = await response.text();
      console.error('save-fcm-token failed:', errText);
      return res.status(500).json({ error: 'Database error' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('save-fcm-token error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
