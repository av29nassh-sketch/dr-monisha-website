# Dr. Monisha Clinic — Security Upgrade

This document records the security hardening applied on **2026-04-06** and the steps required to make the upgraded site work.

## What changed

1. **`api/submit-booking.js`** — now requires Cloudflare Turnstile token + honeypot + strict validation
2. **`api/get-bookings.js`** — now requires `x-admin-token` header
3. **`api/update-booking.js`** — now requires `x-admin-token` header + ID + status whitelist
4. **`api/save-fcm-token.js`** — now requires `x-admin-token` header (only doctor can register devices)
5. **`api/send-push.js`** — now requires `x-webhook-secret` header (only Supabase webhook can call it)
6. **`api/config.js`** — new public endpoint that exposes ONLY the Turnstile site key
7. **`index.html`** — booking form now loads Turnstile + sends honeypot
8. **`admin.html`** — full-screen password gate, sessionStorage token, all admin fetches use `adminFetch()` helper

## ⚠️ BEFORE THIS DEPLOYS, YOU MUST:

The next push to this repo will auto-deploy via Vercel. **The booking form will break** unless these env vars exist on the Vercel project for Monisha:

```
ADMIN_PASSWORD          # Generate a strong random string. Save in password manager.
TURNSTILE_SITE_KEY      # From Cloudflare Turnstile dashboard (public)
TURNSTILE_SECRET_KEY    # From Cloudflare Turnstile dashboard (secret)
WEBHOOK_SECRET          # Generate another strong random string for the Supabase webhook header
```

The existing `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `FIREBASE_SERVICE_ACCOUNT` should remain.

### Steps in order

1. **Cloudflare Turnstile**
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile (search if not in sidebar)
   - Add site → name: `Dr. Monisha Clinic` → hostnames: your Monisha production URL
   - Mode: Managed
   - Copy Site Key + Secret Key

2. **Generate ADMIN_PASSWORD and WEBHOOK_SECRET**
   - In a terminal:
     ```
     node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
     ```
   - Run twice — once for `ADMIN_PASSWORD`, once for `WEBHOOK_SECRET`
   - Save both somewhere safe (password manager)

3. **Add 4 env vars to Vercel** (Monisha project, Production + Preview only)
   - `ADMIN_PASSWORD`
   - `TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
   - `WEBHOOK_SECRET`

4. **Update the Supabase database webhook** for `send-push`
   - Supabase dashboard → Database → Webhooks → find the existing `send-push` webhook
   - Edit → HTTP Headers → add: `x-webhook-secret: <your-WEBHOOK_SECRET>`
   - Save
   - **Without this, push notifications stop firing on new bookings.**

5. **Push the code** (auto-deploys to Vercel)
   ```
   git push origin main
   ```

6. **Test:**
   - Open `/` → fill the booking form → Turnstile widget appears → submit → success
   - Open `/admin.html` → password gate → enter `ADMIN_PASSWORD` → dashboard loads
   - Confirm a booking → WhatsApp redirect still works
   - Submit a real booking → push notification fires (if FCM tokens exist + webhook secret was added)

## What the dashboard doctor needs to know

- **Old admin link no longer just opens** — there's now a password to type the first time on each device
- That password is stored in the browser session, so they only type it once per browser session (until they logout or close all tabs)
- All existing bookings, FCM tokens, and clinic data are preserved — this is purely an authentication layer added on top
