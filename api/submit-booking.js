// ════════════════════════════════════════════════════════════════
//  POST /api/submit-booking
//  Public endpoint — protected by:
//   1. Honeypot field (silent reject)
//   2. Cloudflare Turnstile verification
//   3. Strict input validation + sanitization
// ════════════════════════════════════════════════════════════════

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_KEY         = process.env.SUPABASE_SERVICE_KEY;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

const VALID_TYPES = new Set(['online', 'offline']);

function isString(v) { return typeof v === 'string'; }
function clean(s, maxLen) { return String(s).trim().slice(0, maxLen); }
function stripHtml(s) { return String(s).replace(/<[^>]*>/g, ''); }

function isValidPhone(s) {
  const digits = String(s).replace(/\D/g, '');
  if (digits.length === 10) return '+91' + digits;
  if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
  return null;
}

function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d <= today) return false;
  if (d.getDay() === 0) return false; // Sundays closed
  const max = new Date(today);
  max.setDate(max.getDate() + 90);
  if (d > max) return false;
  return true;
}

function isValidTime(s) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

async function verifyTurnstile(token, ip) {
  if (!TURNSTILE_SECRET_KEY) {
    return process.env.VERCEL_ENV !== 'production';
  }
  if (!token) return false;
  try {
    const body = new URLSearchParams();
    body.append('secret', TURNSTILE_SECRET_KEY);
    body.append('response', token);
    if (ip) body.append('remoteip', ip);
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
    });
    const data = await r.json();
    return data.success === true;
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = req.body || {};

  // Honeypot — silent success
  if (body.website || body.url || body.company) {
    return res.status(201).json({ ok: true });
  }

  const required = ['name', 'phone', 'date', 'time', 'turnstileToken'];
  for (const f of required) {
    if (!body[f] || !isString(body[f])) {
      return res.status(400).json({ error: 'Missing or invalid field: ' + f });
    }
  }

  // Turnstile verification
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || null;
  const turnstileOk = await verifyTurnstile(body.turnstileToken, ip);
  if (!turnstileOk) {
    return res.status(403).json({ error: 'Verification failed. Please refresh and try again.' });
  }

  // Strict validation + sanitization
  const name = clean(body.name, 100);
  if (name.length < 2) return res.status(400).json({ error: 'Name too short' });

  const normalizedPhone = isValidPhone(body.phone);
  if (!normalizedPhone) return res.status(400).json({ error: 'Invalid phone (10 digit Indian number expected)' });

  if (!isValidDate(body.date)) return res.status(400).json({ error: 'Invalid date (must be a future weekday within 90 days, Sundays closed)' });
  if (!isValidTime(body.time)) return res.status(400).json({ error: 'Invalid time (HH:MM 24h)' });

  const type = body.type && VALID_TYPES.has(body.type) ? body.type : 'online';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id: Date.now().toString(),
        name,
        phone: normalizedPhone,
        date: body.date,
        time: body.time,
        type,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Supabase insert failed:', errText);
      return res.status(500).json({ error: 'Database error' });
    }

    const data = await response.json();
    return res.status(201).json({ ok: true, booking: data[0] });
  } catch (err) {
    console.error('submit-booking error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
};
