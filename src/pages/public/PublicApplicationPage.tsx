import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Loader2, XCircle, CheckCircle2, Clock, Shield, ChevronRight,
  FileText, Calendar, DollarSign, ArrowRight,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#0F2540',
}

const PROGRAM_LABELS: Record<string, string> = {
  emergency_assistance: 'Emergency Assistance Grant',
  education_support: 'Education Support Grant',
  medical_expenses: 'Medical Expenses Grant',
  community_development: 'Community Development Grant',
  business_funding: 'Business Funding Grant',
  other: 'Other Qualifying Needs',
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:      { label: 'Pending Review', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  under_review: { label: 'Under Review',   color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  approved:     { label: 'Approved',        color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  rejected:     { label: 'Not Approved',    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  disbursed:    { label: 'Funded',          color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
}

const NEXT_STEPS: Record<string, string> = {
  pending:      'Your application has been received and is in the review queue. A grant specialist will begin review within 1–2 business days. You will be notified by email when review begins.',
  under_review: 'A grant specialist is actively reviewing your file. You will receive a decision notification within 5–10 business days. No action is required from you at this time.',
  approved:     'Congratulations — your application has been approved. Sign in to your secure portal to complete disbursement setup and confirm your bank account information.',
  rejected:     'After careful review, this application did not meet current eligibility criteria. You may submit a new application after 90 days. Contact our support team if you have questions.',
  disbursed:    'Your grant has been disbursed to your RiseAxis wallet. Sign in to your portal to view your disbursement receipt and request a withdrawal.',
}

const STAGES = [
  { key: 'submitted',    label: 'Submitted',    sub: '1–2 days',  statuses: ['pending', 'under_review', 'approved', 'rejected', 'disbursed'] },
  { key: 'in_review',    label: 'In Review',    sub: '3–5 days',  statuses: ['under_review', 'approved', 'rejected', 'disbursed'] },
  { key: 'decision',     label: 'Decision',     sub: '5–10 days', statuses: ['approved', 'rejected', 'disbursed'] },
  { key: 'disbursement', label: 'Disbursement', sub: '1–2 days',  statuses: ['disbursed'] },
  { key: 'funded',       label: 'Complete',     sub: 'Funded',    statuses: ['disbursed'] },
]

interface PublicApp {
  app_number: string
  full_name: string
  status: string
  grant_program: string
  requested_amount: number
  approved_amount: number | null
  purpose: string | null
  created_at: string
  reviewed_at: string | null
  disbursement_stage: string | null
  rejection_reason: string | null
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function PublicApplicationPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [app, setApp] = useState<PublicApp | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function load() {
      if (!token) { setError(true); setLoading(false); return }
      const { data, error: rpcErr } = await supabase
        .rpc('get_application_public', { p_token: token })
      setLoading(false)
      const row = Array.isArray(data) ? data[0] : data
      if (rpcErr || !row) { setError(true); return }
      setApp(row as PublicApp)
    }
    load()
  }, [token])

  const status = app ? (STATUS_META[app.status] || STATUS_META.pending) : null
  const isRejected = app?.status === 'rejected'
  const currentStageIdx = app
    ? (isRejected ? 2 : STAGES.findLastIndex(s => s.statuses.includes(app.status)))
    : -1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16" style={{ background: G.page }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: G.green }} />
          <p className="text-sm" style={{ color: G.muted }}>Retrieving your application…</p>
        </div>
      </div>
    )
  }

  if (error || !app || !status) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-5" style={{ background: G.page }}>
        <div className="rounded-2xl p-8 text-center max-w-md w-full"
          style={{ background: G.white, border: '1px solid #FECACA', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <XCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: G.heading }}>Link No Longer Valid</h3>
          <p className="text-sm leading-relaxed mb-5" style={{ color: G.body }}>
            This application link is invalid or has expired. Please use the most recent email we sent you,
            or sign in to your secure portal to view your application.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/track" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ border: `1px solid ${G.border}`, color: G.body }}>
              Track by Reference
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen" style={{ background: G.page }}>
      <section className="py-10">
        <div className="max-w-2xl mx-auto px-5">

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <Shield size={12} style={{ color: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Secure Application View
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: G.heading }}>
              Grant Application Status
            </h1>
            <p className="text-sm mt-1.5" style={{ color: G.body }}>
              Official status for <span className="font-semibold" style={{ color: G.heading }}>{app.full_name}</span> — no login required.
            </p>
          </motion.div>

          {/* Main card */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden mb-5"
            style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

            {/* Letterhead */}
            <div className="p-5 flex items-center justify-between gap-3" style={{ background: G.navy }}>
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl" />
                <div>
                  <div className="text-sm font-bold text-white">RiseAxis Capital</div>
                  <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Office of Grants Administration</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Reference</div>
                <div className="font-mono text-green-400 font-semibold text-sm">{app.app_number}</div>
              </div>
            </div>

            {/* Status banner */}
            <div className="px-5 py-3 flex items-center gap-3"
              style={{ background: status.bg, borderBottom: `1px solid ${status.border}` }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: status.color }} />
              <span className="text-sm font-bold" style={{ color: status.color }}>Status: {status.label}</span>
            </div>

            {/* Summary grid */}
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-7">
                {[
                  { icon: FileText,   label: 'Program',   value: PROGRAM_LABELS[app.grant_program] || app.grant_program },
                  { icon: DollarSign, label: 'Requested', value: formatCurrency(app.requested_amount) },
                  ...(app.approved_amount != null
                    ? [{ icon: CheckCircle2, label: 'Approved', value: formatCurrency(app.approved_amount) }]
                    : []),
                  { icon: Calendar,   label: 'Submitted', value: fmtDate(app.created_at) },
                  { icon: Clock,      label: 'Last Update', value: app.reviewed_at ? fmtDate(app.reviewed_at) : 'Pending' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: G.muted }} />
                      <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: G.muted }}>{label}</div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Stage stepper */}
              <div className="mb-6">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: G.muted }}>Application Progress</div>
                <div className="flex items-start gap-0">
                  {STAGES.map((stage, i) => {
                    const isDone    = i < currentStageIdx
                    const isCurrent = i === currentStageIdx
                    const isRej     = isRejected && i === 2
                    return (
                      <div key={stage.key} className="flex-1 flex flex-col items-center relative">
                        {i > 0 && (
                          <div className="absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2"
                            style={{ background: isDone || (isCurrent && !isRej) ? G.green : G.border }} />
                        )}
                        <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2"
                          style={isRej
                            ? { background: '#FEF2F2', border: '2px solid #DC2626', color: '#DC2626' }
                            : isDone
                              ? { background: G.green, border: `2px solid ${G.green}`, color: '#fff' }
                              : isCurrent
                                ? { background: '#EFF6FF', border: '2px solid #2563EB', color: '#2563EB', boxShadow: '0 0 0 4px rgba(37,99,235,0.15)' }
                                : { background: G.page, border: `2px solid ${G.border}`, color: G.muted }}>
                          {isRej ? <XCircle className="w-4 h-4" />
                            : isDone ? <CheckCircle2 className="w-4 h-4" />
                            : isCurrent ? <Clock className="w-4 h-4" />
                            : <span>{i + 1}</span>}
                        </div>
                        <div className="text-center px-1">
                          <div className="text-[10px] font-bold leading-tight" style={{ color: isDone || isCurrent ? G.heading : G.muted }}>{stage.label}</div>
                          <div className="text-[9px] mt-0.5" style={{ color: G.muted }}>{stage.sub}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Purpose */}
              {app.purpose && (
                <div className="p-4 rounded-xl mb-4" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: G.muted }}>Purpose of Grant</div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{app.purpose}</p>
                </div>
              )}

              {/* Rejection reason */}
              {isRejected && app.rejection_reason && (
                <div className="p-4 rounded-xl mb-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#DC2626' }}>Reviewer Note</div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{app.rejection_reason}</p>
                </div>
              )}

              {/* Next steps */}
              <div className="p-4 rounded-xl" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: G.muted }}>What Happens Next</div>
                <p className="text-sm leading-relaxed" style={{ color: G.body }}>{NEXT_STEPS[app.status] || NEXT_STEPS.pending}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${G.border}` }}>
              <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
                <Shield className="w-3.5 h-3.5" />
                Sensitive details are visible only in your secure portal
              </div>
              <Link to="/login" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: G.green }}>
                Sign In <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          <p className="text-center text-[11px]" style={{ color: G.muted }}>
            RiseAxis Capital will never ask you to pay a fee to receive a grant.{' '}
            <Link to="/fraud-warning" className="underline">Learn about grant fraud</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
