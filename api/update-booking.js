// ════════════════════════════════════════════════════════════════
//  POST /api/update-booking
//  ADMIN ONLY — requires `x-admin-token` header matching ADMIN_PASSWORD env.
//  Actions: update-status (default) | delete | clear-rejected
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const VALID_STATUSES = new Set(['confirmed', 'rejected', 'pending', 'booked']);
const VALID_ACTIONS  = new Set(['update-status', 'delete', 'clear-rejected', undefined]);
// Note: undefined action treated as 'update-status' to preserve compatibility
//       with the existing admin.html which omits action for status updates.

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function isValidId(id) {
  if (id === undefined || id === null) return false;
  // Monisha uses string IDs (Date.now().toString()) — accept non-empty strings
  return typeof id === 'string' && id.length > 0 && id.length < 64 && /^[\w-]+$/.test(id);
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Admin not configured' });
  const token = req.headers['x-admin-token'];
  if (!token || !safeEqual(token, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  const { id, status, action } = req.body || {};

  if (!VALID_ACTIONS.has(action)) {
    return res.status(400).json({ error: 'Unknown action' });
  }

  const headers = {
    'apikey':        SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
  };

  try {
    if (action === 'delete') {
      if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`,
        { method: 'DELETE', headers }
      );
      if (!response.ok) {
        const errText = await response.text();
        console.error('Delete failed:', errText);
        return res.status(500).json({ error: 'Delete failed' });
      }
      return res.status(200).json({ ok: true });
    }

    if (action === 'clear-rejected') {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/bookings?status=eq.rejected`,
        { method: 'DELETE', headers }
      );
      if (!response.ok) {
        const errText = await response.text();
        console.error('Clear failed:', errText);
        return res.status(500).json({ error: 'Clear failed' });
      }
      return res.status(200).json({ ok: true });
    }

    // Default: update-status
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });
    if (!VALID_STATUSES.has(status)) return res.status(400).json({ error: 'Invalid status' });

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`,
      { method: 'PATCH', headers, body: JSON.stringify({ status }) }
    );
    if (!response.ok) {
      const errText = await response.text();
      console.error('Update failed:', errText);
      return res.status(500).json({ error: 'Update failed' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('update-booking error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
