// ════════════════════════════════════════════════════════════════
//  GET /api/config
//  Public — returns ONLY values that are safe to expose to the browser.
// ════════════════════════════════════════════════════════════════

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  return res.status(200).json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || null,
  });
};
