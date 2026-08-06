// Vercel serverless function — sends transactional emails via Resend.
//
// This is the ONLY place the Resend key is used; it never reaches the
// browser. The client (src/lib/email.ts) POSTs { userId, event, title,
// message, applicationId } with the caller's Supabase JWT. We verify the
// token, look up the recipient's email under RLS (so a caller can only
// email themselves, or anyone if they're an admin), pull the application
// summary + its public token, then send a branded, official email whose
// CTA opens the no-login status view at /view/<token>.
//
// Required env vars (Vercel → Project → Settings → Environment):
//   RESEND_API_KEY   — your Resend API key
//   EMAIL_FROM       — verified sender, e.g. "RiseAxis Capital <grants@riseaxiscapital.info>"
//   APP_URL          — e.g. https://riseaxiscapital.info  (links in emails)
//   SUPABASE_URL / VITE_SUPABASE_URL           — project URL
//   SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY — anon key

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'RiseAxis Capital <onboarding@resend.dev>'
const APP_URL = (process.env.APP_URL || 'https://riseaxiscapital.info').replace(/\/$/, '')

// ── Brand palette ──────────────────────────────────────────────
const NAVY = '#0F2540'
const NAVY_2 = '#1E3A5F'
const INK = '#0F172A'
const BODY = '#334155'
const MUTED = '#94A3B8'
const LINE = '#E2E8F0'
const PANEL = '#F8FAFC'

// ── Per-event presentation ─────────────────────────────────────
const EVENTS = {
  submitted: {
    subject: 'Application Received — RiseAxis Capital',
    accent: '#2563EB', tag: 'Application Received', icon: '&#128196;',
    cta: 'View Your Application',
    next: 'Your application has been logged and placed in the review queue. A grant specialist will begin the initial eligibility review within 1–2 business days. You will receive an email at each stage — no action is required from you right now.',
  },
  under_review: {
    subject: 'Your Application Is Under Review — RiseAxis Capital',
    accent: '#2563EB', tag: 'Under Review', icon: '&#128269;',
    cta: 'View Your Application',
    next: 'A grant specialist is now actively reviewing your file and supporting documents. A decision is typically issued within 5–10 business days. We will contact you if any additional information is required.',
  },
  approved: {
    subject: 'Congratulations — Your Grant Has Been Approved',
    accent: '#16A34A', tag: 'Application Approved', icon: '&#127881;',
    cta: 'View Approval Details',
    next: 'Your application has been approved for funding. Our disbursement team will prepare your award and notify you as funds are processed to your RiseAxis wallet. Please ensure your banking details on file are accurate.',
  },
  rejected: {
    subject: 'An Update On Your Grant Application',
    accent: '#DC2626', tag: 'Application Decision', icon: '&#128233;',
    cta: 'View Application Status',
    next: 'After careful review, this application did not meet the current eligibility criteria. This decision does not prevent you from re-applying. You may submit a new application after 90 days, or contact our support team with any questions.',
  },
  documents_requested: {
    subject: 'Action Required — Document Needed For Your Application',
    accent: '#D97706', tag: 'Action Required', icon: '&#128206;',
    cta: 'Upload Your Document',
    next: 'To continue processing your application, we need an additional or corrected document. Please sign in to your secure portal and upload the requested file at your earliest convenience. Processing is paused until it is received.',
  },
  disbursed: {
    subject: 'Your Grant Funds Have Been Disbursed',
    accent: '#16A34A', tag: 'Funds Disbursed', icon: '&#128176;',
    cta: 'View Your Wallet',
    next: 'Your approved grant funds have been credited to your RiseAxis wallet. You may now sign in to review your disbursement receipt and request a withdrawal to your verified bank account.',
  },
  message: {
    subject: 'New Message Regarding Your Application',
    accent: '#2563EB', tag: 'Official Message', icon: '&#9993;',
    cta: 'View Your Application',
    next: 'A member of the RiseAxis Capital grants team has sent you a message regarding your application. Please review it and respond through your secure portal if a reply is requested.',
  },
}

const PROGRAM_LABELS = {
  emergency_assistance: 'Emergency Assistance Grant',
  education_support: 'Education Support Grant',
  medical_expenses: 'Medical Expenses Grant',
  community_development: 'Community Development Grant',
  business_funding: 'Business Funding Grant',
  other: 'Other Qualifying Needs',
}

const STATUS_LABELS = {
  pending: 'Pending Review', under_review: 'Under Review', approved: 'Approved',
  rejected: 'Not Approved', disbursed: 'Funded',
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function money(n) {
  if (n == null || isNaN(Number(n))) return null
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n))
}

function longDate(iso) {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return null }
}

// One row of the "Application Summary" table.
function row(label, value, opts = {}) {
  if (value == null || value === '') return ''
  const strong = opts.strong ? `font-weight:700;color:${opts.color || INK};` : `color:${INK};`
  return `<tr>
    <td style="padding:11px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:11px 0 11px 20px;border-bottom:1px solid ${LINE};font-size:14px;${strong}text-align:right;">${value}</td>
  </tr>`
}

function renderEmail({ event, title, message, name, link, app }) {
  const e = EVENTS[event]
  const safeTitle = escapeHtml(title || e.tag)
  const safeMsg = escapeHtml(message || '').replace(/\n/g, '<br>')
  const greeting = name ? `Dear ${escapeHtml(name)},` : 'Dear Applicant,'

  // Application summary rows (only what we actually have)
  let summary = ''
  if (app) {
    summary += row('Reference No.', app.app_number ? `<span style="font-family:'SF Mono',Consolas,monospace;">${escapeHtml(app.app_number)}</span>` : null, { strong: true })
    summary += row('Grant Program', app.grant_program ? escapeHtml(PROGRAM_LABELS[app.grant_program] || app.grant_program) : null)
    summary += row('Amount Requested', money(app.requested_amount))
    if (app.approved_amount != null) summary += row('Amount Approved', money(app.approved_amount), { strong: true, color: '#16A34A' })
    summary += row('Current Status', app.status ? escapeHtml(STATUS_LABELS[app.status] || app.status) : null, { strong: true, color: e.accent })
    summary += row('Date Submitted', longDate(app.created_at))
  }

  const summaryBlock = summary ? `
    <tr><td style="padding:8px 40px 4px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin:0 0 4px;">Application Summary</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid ${INK};">
        ${summary}
      </table>
    </td></tr>` : ''

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
</head>
<body style="margin:0;padding:0;background:#eef2f7;-webkit-font-smoothing:antialiased;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safeTitle} — official notification from RiseAxis Capital regarding your grant application.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 24px rgba(15,37,64,0.10);">

        <!-- Letterhead -->
        <tr><td style="background:linear-gradient(135deg,${NAVY},${NAVY_2});padding:26px 40px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;">
              <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:.5px;">RISEAXIS CAPITAL</div>
              <div style="color:rgba(255,255,255,0.55);font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Office of Grants Administration</div>
            </td>
            <td style="vertical-align:middle;text-align:right;">
              <div style="color:rgba(255,255,255,0.5);font-size:10px;text-transform:uppercase;letter-spacing:1px;">Official Notice</div>
              <div style="color:#ffffff;font-size:12px;font-weight:600;margin-top:2px;">${app && app.app_number ? escapeHtml(app.app_number) : 'Grant Program'}</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Status ribbon -->
        <tr><td style="background:${e.accent};padding:14px 40px;">
          <span style="color:#ffffff;font-size:15px;font-weight:700;letter-spacing:.3px;">${e.icon}&nbsp;&nbsp;${escapeHtml(e.tag)}</span>
        </td></tr>

        <!-- Heading + body -->
        <tr><td style="padding:32px 40px 8px;">
          <h1 style="margin:0 0 18px;font-size:23px;line-height:1.3;color:${INK};font-weight:800;">${safeTitle}</h1>
          <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.65;">${greeting}</p>
          <p style="margin:0;color:${BODY};font-size:15px;line-height:1.65;">${safeMsg}</p>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:26px 40px 22px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="border-radius:12px;background:${e.accent};">
              <a href="${link}" style="display:inline-block;padding:15px 34px;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;border-radius:12px;">${e.cta} &rarr;</a>
            </td>
          </tr></table>
          <p style="margin:12px 0 0;color:${MUTED};font-size:12px;">Or copy this secure link into your browser:<br>
            <a href="${link}" style="color:${e.accent};word-break:break-all;">${link}</a>
          </p>
        </td></tr>

        ${summaryBlock}

        <!-- What happens next -->
        <tr><td style="padding:18px 40px 8px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PANEL};border:1px solid ${LINE};border-radius:12px;">
            <tr><td style="padding:16px 18px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${MUTED};margin-bottom:6px;">What Happens Next</div>
              <div style="color:${BODY};font-size:13.5px;line-height:1.6;">${e.next}</div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Signature -->
        <tr><td style="padding:24px 40px 8px;">
          <p style="margin:0;color:${BODY};font-size:14px;line-height:1.6;">Sincerely,<br>
            <strong style="color:${INK};">The Grants Administration Team</strong><br>
            <span style="color:${MUTED};font-size:13px;">RiseAxis Capital</span>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:22px 40px 30px;border-top:1px solid ${LINE};">
          <p style="margin:14px 0 0;color:${MUTED};font-size:11.5px;line-height:1.6;">
            RiseAxis Capital &middot; 3040 Idaho Ave NW, Washington, DC 20016<br>
            grants@riseaxiscapital.com &middot; (702) 274-7227
          </p>
          <p style="margin:12px 0 0;color:${MUTED};font-size:11px;line-height:1.6;">
            <strong>Confidentiality Notice:</strong> This message is an official communication intended only for the named applicant and may contain
            confidential information. If you received it in error, please delete it and notify us. RiseAxis Capital will never ask you to pay a fee
            to receive a grant. <a href="${APP_URL}/fraud-warning" style="color:${MUTED};">Learn about grant fraud</a>.
          </p>
        </td></tr>

      </table>
      <div style="max-width:600px;margin:16px auto 0;color:#9aa7b8;font-size:11px;text-align:center;">
        &copy; ${'2026'} RiseAxis Capital. All rights reserved.
      </div>
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

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { userId, event, title, message, applicationId } = body || {}

  if (!userId || !event || !EVENTS[event]) {
    return res.status(400).json({ error: 'Missing or invalid userId/event' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return res.status(401).json({ error: 'Missing auth token' })

  // Client bound to the caller's identity — RLS then decides which rows
  // this caller may read (their own, or everything if they're an admin).
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid session' })
  }

  // Recipient — RLS blocks this unless the caller is that user or admin.
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .maybeSingle()

  if (profErr || !profile?.email) {
    return res.status(403).json({ error: 'Recipient not found or not permitted' })
  }

  // Application summary + its public token (for the no-login view link).
  let app = null
  if (applicationId) {
    const { data: appRow } = await supabase
      .from('grant_applications')
      .select('app_number, grant_program, requested_amount, approved_amount, status, created_at, public_token')
      .eq('id', applicationId)
      .maybeSingle()
    if (appRow) app = appRow
  }

  // CTA link: disbursed → wallet; otherwise the no-login status view when
  // we have a token, falling back to the dashboard.
  let link
  if (event === 'disbursed') link = `${APP_URL}/wallet`
  else if (app?.public_token) link = `${APP_URL}/view/${app.public_token}`
  else link = `${APP_URL}/dashboard`

  const html = renderEmail({ event, title, message, name: profile.full_name, link, app })

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
