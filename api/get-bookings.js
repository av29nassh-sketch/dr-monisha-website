// ════════════════════════════════════════════════════════════════
//  GET /api/get-bookings
//  ADMIN ONLY — requires `x-admin-token` header matching ADMIN_PASSWORD env.
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Admin not configured' });
  const token = req.headers['x-admin-token'];
  if (!token || !safeEqual(token, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?select=*&order=submitted_at.desc`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase fetch failed:', errText);
      return res.status(500).json({ error: 'Database error' });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('get-bookings error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
