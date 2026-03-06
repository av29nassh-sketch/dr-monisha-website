const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, status, action } = req.body || {};

  // Handle single booking delete
  if (action === 'delete') {
    if (!id) return res.status(400).json({ error: 'Missing id' });
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
      }
    );
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }
    return res.status(200).json({ ok: true });
  }

  // Handle clear-rejected bulk delete
  if (action === 'clear-rejected') {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings?status=eq.rejected`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal',
        },
      }
    );
    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: text });
    }
    return res.status(200).json({ ok: true });
  }

  if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });
  if (!['confirmed', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/bookings?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return res.status(500).json({ error: text });
  }

  return res.status(200).json({ ok: true });
};
