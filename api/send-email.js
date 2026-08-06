// Vercel serverless function — sends transactional emails via Resend.
//
// This is the ONLY place the Resend key is used; it never reaches the
// browser. The client (src/lib/email.ts) POSTs { userId, event, title,
// message, applicationId } with the caller's Supabase JWT. We verify the
// token, look up the recipient's email under RLS (so a caller can only
// email themselves, or anyone if they're an admin), then send.
//
// Required env vars (set in Vercel → Project → Settings → Environment):
//   RESEND_API_KEY   — your Resend API key
//   EMAIL_FROM       — verified sender, e.g. "RiseAxis Capital <grants@riseaxiscapital.info>"
//   APP_URL          — e.g. https://riseaxiscapital.info  (for links in emails)
//   SUPABASE_URL / VITE_SUPABASE_URL         — project URL
//   SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY — anon key

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'RiseAxis Capital <onboarding@resend.dev>'
const APP_URL = (process.env.APP_URL || 'https://riseaxiscapital.info').replace(/\/$/, '')

// Per-event presentation. `path` is where the CTA button points.
const EVENTS = {
  submitted:           { subject: 'We received your application',        accent: '#2563EB', heading: 'Application Received',   cta: 'View Application', path: (id) => id ? `/applications/${id}` : '/dashboard' },
  under_review:        { subject: 'Your application is under review',    accent: '#2563EB', heading: 'Under Review',           cta: 'View Application', path: (id) => id ? `/applications/${id}` : '/dashboard' },
  approved:            { subject: 'Your application has been approved',  accent: '#16A34A', heading: 'Application Approved',   cta: 'View Application', path: (id) => id ? `/applications/${id}` : '/dashboard' },
  rejected:            { subject: 'An update on your application',       accent: '#DC2626', heading: 'Application Update',     cta: 'View Application', path: (id) => id ? `/applications/${id}` : '/dashboard' },
  documents_requested: { subject: 'Action needed: document required',    accent: '#D97706', heading: 'Document Required',      cta: 'Upload Document',  path: (id) => id ? `/applications/${id}` : '/dashboard' },
  disbursed:           { subject: 'Your grant funds have been disbursed',accent: '#16A34A', heading: 'Funds Disbursed',       cta: 'View Wallet',      path: () => '/wallet' },
  message:             { subject: 'New message about your application',  accent: '#2563EB', heading: 'New Message',           cta: 'View Application', path: (id) => id ? `/applications/${id}` : '/dashboard' },
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function renderEmail({ event, title, message, name, link }) {
  const e = EVENTS[event]
  const safeTitle = escapeHtml(title || e.heading)
  const safeMsg = escapeHtml(message).replace(/\n/g, '<br>')
  const greeting = name ? `Hi ${escapeHtml(name.split(' ')[0])},` : 'Hello,'
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:${e.accent};height:6px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:32px 32px 8px;">
          <div style="font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${e.accent};">RiseAxis Capital</div>
          <h1 style="margin:16px 0 0;font-size:22px;color:#0f172a;">${safeTitle}</h1>
        </td></tr>
        <tr><td style="padding:12px 32px 8px;color:#334155;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 12px;">${greeting}</p>
          <p style="margin:0;">${safeMsg}</p>
        </td></tr>
        <tr><td style="padding:24px 32px 8px;">
          <a href="${link}" style="display:inline-block;background:${e.accent};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 22px;border-radius:10px;">${e.cta}</a>
        </td></tr>
        <tr><td style="padding:24px 32px 32px;border-top:1px solid #f1f5f9;margin-top:16px;">
          <p style="margin:16px 0 0;color:#94a3b8;font-size:12px;line-height:1.5;">
            You're receiving this because you have an application with RiseAxis Capital.<br>
            3040 Idaho Ave NW, Washington, DC 20016 &middot; grants@riseaxiscapital.com
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Email service is not configured' })
  }

  // Body may arrive parsed (Vercel) or as a raw string — handle both.
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { userId, event, title, message, applicationId } = body || {}

  if (!userId || !event || !EVENTS[event]) {
    return res.status(400).json({ error: 'Missing or invalid userId/event' })
  }

  // Verify the caller's JWT.
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing auth token' })

  // Client bound to the caller's identity — RLS then decides which
  // profile rows this caller may read.
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid session' })
  }

  // Recipient = the notification's target user. RLS blocks this read
  // unless the caller is that user or an admin, so we can't be used to
  // harvest arbitrary emails.
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .maybeSingle()

  if (profErr || !profile?.email) {
    return res.status(403).json({ error: 'Recipient not found or not permitted' })
  }

  const link = `${APP_URL}${EVENTS[event].path(applicationId)}`
  const html = renderEmail({ event, title, message, name: profile.full_name, link })

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [profile.email],
      subject: EVENTS[event].subject,
      html,
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => '')
    return res.status(502).json({ error: 'Failed to send email', detail })
  }

  return res.status(200).json({ ok: true })
}
