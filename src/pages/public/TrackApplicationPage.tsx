import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Loader2, XCircle, CheckCircle2, Clock, Shield, HelpCircle, ArrowRight, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const PROGRAM_LABELS: Record<string, string> = {
  emergency:  'Emergency Assistance Grant',
  education:  'Education Support Grant',
  medical:    'Medical Expenses Grant',
  community:  'Community Development Grant',
  business:   'Business Funding Grant',
  other:      'Other Qualifying Needs',
}

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending:      { label: 'Pending Review',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  under_review: { label: 'Under Review',    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  approved:     { label: 'Approved',        color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  rejected:     { label: 'Not Approved',    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  disbursed:    { label: 'Funded',          color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
}

const NEXT_STEPS: Record<string, string> = {
  pending:      'Your application has been received and is in the queue. A grant specialist will begin review within 1–2 business days. You will be notified by email when review begins.',
  under_review: 'A grant specialist is actively reviewing your file. You will receive a decision notification within 5–10 business days. No action is required from you at this time.',
  approved:     'Congratulations — your application has been approved! Log in to your secure portal to complete disbursement setup and provide your bank account information.',
  rejected:     'After careful review, this application did not meet current eligibility criteria. You may submit a new application after 90 days. Contact our support team if you have questions.',
  disbursed:    'Your grant has been disbursed via ACH direct transfer. Funds typically post within 2–3 business days. Log in to your portal to view your disbursement receipt.',
}

const STAGES = [
  { key: 'submitted',   label: 'Submitted',   sub: '1–2 days',   statuses: ['pending','under_review','approved','rejected','disbursed'] },
  { key: 'in_review',   label: 'In Review',   sub: '3–5 days',   statuses: ['under_review','approved','rejected','disbursed'] },
  { key: 'decision',    label: 'Decision',    sub: '5–10 days',  statuses: ['approved','rejected','disbursed'] },
  { key: 'disbursement',label: 'Disbursement',sub: '1–2 days',   statuses: ['disbursed'] },
  { key: 'funded',      label: 'Complete',    sub: 'Funded',     statuses: ['disbursed'] },
]

interface AppStatus {
  app_number: string
  status: string
  grant_program: string
  created_at: string
  reviewed_at: string | null
}

export default function TrackApplicationPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('ref') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AppStatus | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) { setQuery(ref); handleTrack(ref) }
  }, [])

  async function handleTrack(id?: string) {
    const q = (id || query).trim().toUpperCase()
    if (!q) return
    setLoading(true)
    setNotFound(false)
    setResult(null)

    const { data, error } = await supabase
      .from('grant_applications')
      .select('app_number, status, grant_program, created_at, reviewed_at')
      .eq('app_number', q)
      .single()

    setLoading(false)
    if (error || !data) {
      setNotFound(true)
    } else {
      setResult(data as AppStatus)
    }
  }

  const status = result ? (STATUS_META[result.status] || STATUS_META['pending']) : null
  const isRejected = result?.status === 'rejected'
  const currentStageIdx = result
    ? (isRejected ? 2 : STAGES.findLastIndex(s => s.statuses.includes(result.status)))
    : -1

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={{ background: G.page }} className="pt-16 min-h-screen">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 60%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <Search size={12} style={{ color: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Application Status Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight" style={{ color: G.heading }}>
              Track Your Application
            </h1>
            <p className="text-base leading-relaxed" style={{ color: G.body }}>
              Enter your application reference number to check the current status of your grant application — no login required.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search ───────────────────────────────────────── */}
      <section className="py-10">
        <div className="max-w-2xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 mb-5"
            style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>
              Application Reference Number
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="APP-NEP-2025-XXXXXX"
                value={query}
                onChange={e => setQuery(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleTrack()}
                className="flex-1 h-11 rounded-xl px-4 font-mono text-sm outline-none transition-all"
                style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}
                onFocus={e => { e.target.style.borderColor = G.green; e.target.style.boxShadow = `0 0 0 3px ${G.greenLt}` }}
                onBlur={e => { e.target.style.borderColor = G.border; e.target.style.boxShadow = 'none' }}
              />
              <button
                onClick={() => handleTrack()}
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Track
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: G.muted }}>Format: APP-NEP-YYYY-XXXXXX · Found on your confirmation email</p>
          </motion.div>

          {/* ── Not found ── */}
          {notFound && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-center mb-5"
              style={{ background: G.white, border: '1px solid #FECACA', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: G.heading }}>Application Not Found</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>
                No application found with reference number{' '}
                <span className="font-mono font-semibold" style={{ color: G.heading }}>{query}</span>.
                Please double-check the number or contact us.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:brightness-105 text-white"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                Contact Support <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}

          {/* ── Result card ── */}
          {result && status && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden mb-5"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

              {/* Header */}
              <div className="p-5 flex items-center justify-between gap-3"
                style={{ background: G.navy, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl" />
                  <div>
                    <div className="text-sm font-bold text-white">RiseAxis Capital</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Grant Application Status</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Reference</div>
                  <div className="font-mono text-green-400 font-semibold text-sm">{result.app_number}</div>
                </div>
              </div>

              {/* Status banner */}
              <div className="px-5 py-3 flex items-center gap-3"
                style={{ background: status.bg, borderBottom: `1px solid ${status.border}` }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: status.color }} />
                <span className="text-sm font-bold" style={{ color: status.color }}>Status: {status.label}</span>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G.muted }}>Program</div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>
                      {PROGRAM_LABELS[result.grant_program] || result.grant_program}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G.muted }}>Submitted</div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>{formatDate(result.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G.muted }}>Last Updated</div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>
                      {result.reviewed_at ? formatDate(result.reviewed_at) : 'Pending'}
                    </div>
                  </div>
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
                          {/* Connector left */}
                          {i > 0 && (
                            <div className="absolute top-4 right-1/2 w-full h-0.5 -translate-y-1/2"
                              style={{ background: isDone || (isCurrent && !isRej) ? G.green : G.border }} />
                          )}
                          {/* Circle */}
                          <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-all"
                            style={isRej
                              ? { background: '#FEF2F2', border: '2px solid #DC2626', color: '#DC2626' }
                              : isDone
                                ? { background: G.green, border: `2px solid ${G.green}`, color: '#fff' }
                                : isCurrent
                                  ? { background: '#EFF6FF', border: '2px solid #2563EB', color: '#2563EB', boxShadow: '0 0 0 4px rgba(37,99,235,0.15)' }
                                  : { background: G.page, border: `2px solid ${G.border}`, color: G.muted }}>
                            {isRej
                              ? <XCircle className="w-4 h-4" />
                              : isDone
                                ? <CheckCircle2 className="w-4 h-4" />
                                : isCurrent
                                  ? <Clock className="w-4 h-4" />
                                  : <span>{i + 1}</span>}
                          </div>
                          <div className="text-center px-1">
                            <div className="text-[10px] font-bold leading-tight" style={{ color: isDone || isCurrent ? G.heading : G.muted }}>
                              {stage.label}
                            </div>
                            <div className="text-[9px] mt-0.5" style={{ color: G.muted }}>{stage.sub}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Next steps */}
                <div className="p-4 rounded-xl" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: G.muted }}>What Happens Next</div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>
                    {NEXT_STEPS[result.status] || NEXT_STEPS['pending']}
                  </p>
                </div>
              </div>

              {/* Privacy footer */}
              <div className="px-6 py-4 flex items-center justify-between gap-3"
                style={{ borderTop: `1px solid ${G.border}` }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: G.muted }}>
                  <Shield className="w-3.5 h-3.5" />
                  Full application details visible only in your secure portal
                </div>
                <Link to="/login" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: G.green }}>
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* ── Help card ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-5"
            style={{ background: G.white, border: `1px solid ${G.border}` }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                <HelpCircle className="w-4 h-4" style={{ color: G.green }} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>Can't find your application?</div>
                <ul className="text-xs space-y-1 mb-3" style={{ color: G.body }}>
                  <li>· Reference numbers are in the format <span className="font-mono font-semibold">APP-NEP-2025-XXXXXX</span></li>
                  <li>· Check your confirmation email — it contains your reference number</li>
                  <li>· Applications submitted via AI Assistant are assigned a number within 24 hours</li>
                  <li>· Reference numbers are case-insensitive</li>
                </ul>
                <div className="flex gap-3">
                  <Link to="/contact" className="text-xs font-semibold hover:underline" style={{ color: G.green }}>
                    Contact Support →
                  </Link>
                  <Link to="/register" className="text-xs font-semibold hover:underline" style={{ color: G.navy }}>
                    Create an Account →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
