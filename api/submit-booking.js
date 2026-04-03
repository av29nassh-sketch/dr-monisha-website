const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, phone, date, time, type } = req.body || {};

  if (!name || !phone || !date || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bookings`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          id: Date.now().toString(),
          name,
          phone,
          date,
          time,
          type: type || 'online',
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    res.status(201).json({ ok: true, booking: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
