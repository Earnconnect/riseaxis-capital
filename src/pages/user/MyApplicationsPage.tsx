import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, CheckCircle2, Clock, XCircle, DollarSign, Plus,
  ChevronDown, ChevronUp, Shield, GraduationCap, HeartPulse,
  Briefcase, Building2, Users, Banknote, AlertTriangle,
  MessageSquare, RefreshCw, Search,
  ClipboardList, BarChart3, Award, ExternalLink, Lock,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', head: '#0F172A', body: '#475569',
  muted: '#94A3B8', border: '#EDE9E3', green: '#16A34A',
  greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  card: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
}

const SC = (s: string) => ({ pending: '#D97706', under_review: '#2563EB', approved: '#16A34A', rejected: '#DC2626', disbursed: '#7C3AED' }[s] ?? '#94A3B8')
const SB = (s: string) => ({ pending: '#FFFBEB', under_review: '#EFF6FF', approved: '#F0FDF4', rejected: '#FEF2F2', disbursed: '#F5F3FF' }[s] ?? '#F8FAFC')
const SD = (s: string) => ({ pending: '#FDE68A', under_review: '#BFDBFE', approved: '#BBF7D0', rejected: '#FECACA', disbursed: '#DDD6FE' }[s] ?? '#E2E8F0')

const PROGRAM_ICONS: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  emergency_assistance: Shield,
  education_support: GraduationCap,
  medical_expenses: HeartPulse,
  community_development: Users,
  business_funding: Briefcase,
  other: Building2,
}

const STATUS_FILTERS = ['all', 'pending', 'under_review', 'approved', 'disbursed', 'rejected'] as const
type StatusFilter = typeof STATUS_FILTERS[number]

const PIPELINE = [
  { key: 'submitted', label: 'Submitted',   icon: ClipboardList, statuses: ['pending','under_review','approved','rejected','disbursed'] },
  { key: 'review',    label: 'In Review',   icon: Shield,        statuses: ['under_review','approved','rejected','disbursed'] },
  { key: 'decision',  label: 'Decision',    icon: Award,         statuses: ['approved','rejected','disbursed'] },
  { key: 'funded',    label: 'Funded',      icon: Banknote,      statuses: ['disbursed'] },
]

const DISBURSEMENT_STAGES = [
  { key: 'initiated',     label: 'Initiated',     desc: 'Transfer request created' },
  { key: 'processing',    label: 'Processing',    desc: 'Bank processing payment' },
  { key: 'sent_to_bank',  label: 'Sent to Bank',  desc: 'Funds sent to your bank' },
  { key: 'deposited',     label: 'Deposited',     desc: 'Funds in your account' },
]

function Pill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap"
      style={{ background: SB(status), color: SC(status), border: `1px solid ${SD(status)}` }}>
      {getStatusLabel(status)}
    </span>
  )
}

function Sk({ w = 'w-20', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} rounded-lg animate-pulse`} style={{ background: '#EDE9E3' }} />
}

export default function MyApplicationsPage() {
  const { user } = useAuth()
  const [apps, setApps]         = useState<GrantApplication[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [search, setSearch]     = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('grant_applications').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    if (data) setApps(data as GrantApplication[])
    setLoading(false)
  }

  const filtered = apps.filter(a => {
    const matchStatus = filter === 'all' || a.status === filter
    const matchSearch = !search || [a.app_number, getGrantProgramLabel(a.grant_program), a.status]
      .some(v => v.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  const stats = {
    total:    apps.length,
    active:   apps.filter(a => ['pending','under_review'].includes(a.status)).length,
    approved: apps.filter(a => ['approved','disbursed'].includes(a.status)).length,
    received: apps.filter(a => a.status === 'disbursed').reduce((s, a) => s + (a.approved_amount || 0), 0),
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Official Grant Portal Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden" style={{ boxShadow: T.card }}>
        {/* Navy org band */}
        <div className="p-4 sm:p-5" style={{ background: 'linear-gradient(135deg, #0C1A36 0%, #1E3A5F 100%)' }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 sm:w-11 sm:h-11 object-cover rounded-xl shrink-0" />
              <div>
                <div className="font-bold text-white text-sm sm:text-base leading-tight">RiseAxis Capital</div>
                <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Grant Management Portal</div>
              </div>
            </div>
            <Link to="/apply"
              className="shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all hover:brightness-105"
              style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
              <Plus size={13} strokeWidth={2.5} /> New Application
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['501(c)(3) Nonprofit', 'EIN: 27-0964813', 'Federal Grant Program', 'IRS Tax-Exempt', 'NACHA Compliant'].map(badge => (
              <span key={badge} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.09)' }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
        {/* Official seals strip */}
        <div className="px-4 sm:px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1"
          style={{ background: T.white, borderTop: '1px solid #E2E8F0' }}>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: '#475569' }}>
            <Shield size={10} style={{ color: '#16A34A' }} /> Federally Recognized Nonprofit
          </div>
          <div className="hidden sm:block w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: '#475569' }}>
            <CheckCircle2 size={10} style={{ color: '#2563EB' }} /> IRS Tax-Exempt 501(c)(3)
          </div>
          <div className="hidden sm:block w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: '#475569' }}>
            <Lock size={10} style={{ color: '#7C3AED' }} /> 256-bit SSL Encrypted
          </div>
          <div className="ml-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.green }}>Grant Portal</p>
            <p className="text-xs font-bold" style={{ color: T.head }}>My Applications</p>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: stats.total,    color: '#C7D7FD', glow: 'rgba(99,120,245,0.15)',  fmt: String },
          { label: 'Active',             value: stats.active,   color: '#FDE68A', glow: 'rgba(245,158,11,0.15)', fmt: String },
          { label: 'Approved / Funded',  value: stats.approved, color: '#BBF7D0', glow: 'rgba(22,163,74,0.15)',  fmt: String },
          { label: 'Funds Received',     value: stats.received, color: '#E9D5FF', glow: 'rgba(124,58,237,0.15)', fmt: (v: number) => v > 0 ? formatCurrency(v) : '$0' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05 }}
            className="rounded-2xl px-5 py-4 relative overflow-hidden"
            style={{ background: s.color, boxShadow: `0 2px 16px ${s.glow}` }}>
            <div className="absolute -right-5 -bottom-5 w-20 h-20 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.25)' }} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5 relative z-10" style={{ color: 'rgba(15,23,42,0.45)' }}>{s.label}</p>
            {loading ? <Sk w="w-12" h="h-8" /> : <p className="text-2xl sm:text-3xl font-black relative z-10 leading-none" style={{ color: '#0F172A' }}>{s.fmt(s.value)}</p>}
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-4 space-y-3" style={{ background: T.white, boxShadow: T.card }}>
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by app number, program, or status…"
            className="w-full h-10 rounded-xl pl-9 pr-3.5 text-sm bg-[#F8FAFC] border border-[#EDE9E3] placeholder:text-slate-400 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#F0FDF4] transition-all"
            style={{ color: T.head }}
          />
        </div>
        {/* Status filter — horizontal scroll on mobile */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
          {STATUS_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize whitespace-nowrap shrink-0"
              style={{
                background: filter === f ? T.head : '#F8FAFC',
                color: filter === f ? '#fff' : T.muted,
                border: filter === f ? 'none' : `1px solid ${T.border}`,
              }}>
              {f === 'all' ? 'All' : getStatusLabel(f)}{f !== 'all' ? ` (${apps.filter(a => a.status === f).length})` : ''}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Applications list */}
      <div className="space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5" style={{ background: T.white, boxShadow: T.card }}>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl animate-pulse shrink-0" style={{ background: T.border }} />
                <div className="flex-1 space-y-2"><Sk w="w-48" h="h-4" /><Sk w="w-32" h="h-3" /></div>
                <Sk w="w-20" h="h-6" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ background: T.white, boxShadow: T.card }}>
            <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: T.greenLt }}>
              <FileText size={22} style={{ color: T.green }} />
            </div>
            <p className="text-base font-bold mb-1" style={{ color: T.head }}>
              {apps.length === 0 ? 'No applications yet' : 'No matching applications'}
            </p>
            <p className="text-sm mb-5" style={{ color: T.muted }}>
              {apps.length === 0 ? 'Submit your first grant application to get started.' : 'Try adjusting your search or filter.'}
            </p>
            {apps.length === 0 && (
              <Link to="/apply"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: T.green }}>
                <Plus size={13} strokeWidth={2.5} /> Apply Now
              </Link>
            )}
          </div>
        ) : (
          filtered.map((app, idx) => {
            const Icon = PROGRAM_ICONS[app.grant_program] ?? Building2
            const isOpen = expanded === app.id
            const pipelineStep = { disbursed: 3, approved: 2, under_review: 1, pending: 0 }[app.status] ?? -1
            const disbStageIdx = app.disbursement_stage
              ? DISBURSEMENT_STAGES.findIndex(d => d.key === app.disbursement_stage)
              : -1

            return (
              <motion.div key={app.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                className="rounded-2xl overflow-hidden" style={{ background: T.white, boxShadow: T.card }}>

                {/* App row */}
                <div className="flex items-center gap-3 px-4 sm:px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50/60"
                  onClick={() => setExpanded(isOpen ? null : app.id)}>
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: SB(app.status) }}>
                    <Icon size={15} style={{ color: SC(app.status) }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold truncate" style={{ color: T.head }}>{getGrantProgramLabel(app.grant_program)}</p>
                      <Pill status={app.status} />
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap" style={{ color: T.muted }}>
                      <span className="font-mono">#{app.app_number}</span>
                      <span>·</span>
                      <span>{formatDateShort(app.created_at)}</span>
                      {app.status === 'disbursed' && app.approved_amount && (
                        <span className="font-semibold text-green-600">+{formatCurrency(app.approved_amount)}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-bold" style={{ color: T.head }}>{formatCurrency(app.requested_amount)}</p>
                    {app.approved_amount && app.approved_amount !== app.requested_amount && (
                      <p className="text-xs" style={{ color: T.green }}>✓ {formatCurrency(app.approved_amount)}</p>
                    )}
                  </div>
                  <div className="shrink-0 p-1 rounded-lg transition-colors" style={{ color: T.muted }}>
                    {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                      className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-5" style={{ borderTop: `1px solid ${T.border}` }}>

                        {/* Application pipeline */}
                        {app.status !== 'rejected' && (
                          <div className="pt-5">
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Application Progress</p>
                            <div className="flex items-start">
                              {PIPELINE.map((p, i) => {
                                const done = p.statuses.includes(app.status)
                                const PIcon = p.icon
                                return (
                                  <div key={p.key} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-all"
                                        style={{
                                          background: done ? (i === pipelineStep ? SC(app.status) : T.green) : '#F8FAFC',
                                          border: done ? 'none' : `1px solid ${T.border}`,
                                        }}>
                                        {done
                                          ? <CheckCircle2 size={14} className="text-white" />
                                          : <PIcon size={14} style={{ color: T.muted }} />
                                        }
                                      </div>
                                      <span className="text-[9px] font-semibold text-center leading-tight"
                                        style={{ color: done ? T.head : T.muted }}>{p.label}</span>
                                    </div>
                                    {i < PIPELINE.length - 1 && (
                                      <div className="h-px w-full mx-1 mb-5"
                                        style={{ background: PIPELINE[i + 1].statuses.includes(app.status) ? T.green : T.border }} />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}

                        {/* Rejection reason */}
                        {app.status === 'rejected' && app.rejection_reason && (
                          <div className="rounded-xl p-4" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <XCircle size={14} style={{ color: '#DC2626' }} />
                              <p className="text-xs font-bold" style={{ color: '#DC2626' }}>Application Not Approved</p>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#7F1D1D' }}>{app.rejection_reason}</p>
                            <Link to="/apply" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#DC2626' }}>
                              Submit a new application <ChevronDown size={11} className="-rotate-90" />
                            </Link>
                          </div>
                        )}

                        {/* Disbursement tracker */}
                        {app.status === 'disbursed' && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Disbursement Tracking</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {DISBURSEMENT_STAGES.map((ds, i) => {
                                const done = disbStageIdx >= i
                                const current = disbStageIdx === i
                                return (
                                  <div key={ds.key} className="p-3 rounded-xl text-center"
                                    style={{
                                      background: done ? (current ? '#F0FDF4' : '#F0FDF4') : '#F8FAFC',
                                      border: `1px solid ${done ? T.greenBd : T.border}`,
                                    }}>
                                    <div className="w-7 h-7 rounded-full mx-auto mb-2 flex items-center justify-center"
                                      style={{ background: done ? T.green : T.border }}>
                                      {done ? <CheckCircle2 size={12} className="text-white" /> : <span className="text-[10px] font-bold" style={{ color: T.muted }}>{i + 1}</span>}
                                    </div>
                                    <p className="text-[10px] font-bold" style={{ color: done ? T.head : T.muted }}>{ds.label}</p>
                                    <p className="text-[9px] leading-tight mt-0.5" style={{ color: T.muted }}>{ds.desc}</p>
                                    {current && app.disbursement_tracking && (
                                      <p className="text-[9px] font-mono mt-1" style={{ color: T.green }}>#{app.disbursement_tracking}</p>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                            {app.bank_reference && (
                              <p className="text-xs mt-2" style={{ color: T.muted }}>
                                Bank reference: <span className="font-mono font-semibold" style={{ color: T.head }}>{app.bank_reference}</span>
                              </p>
                            )}
                          </div>
                        )}

                        {/* Application details grid */}
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: T.muted }}>Application Details</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { label: 'Program', value: getGrantProgramLabel(app.grant_program) },
                              { label: 'Amount Requested', value: formatCurrency(app.requested_amount) },
                              { label: 'Submitted', value: formatDateShort(app.created_at) },
                              { label: 'App Number', value: `#${app.app_number}` },
                              ...(app.approved_amount ? [{ label: 'Amount Approved', value: formatCurrency(app.approved_amount) }] : []),
                              ...(app.reviewed_at ? [{ label: 'Reviewed', value: formatDateShort(app.reviewed_at) }] : []),
                              ...(app.employment_status ? [{ label: 'Employment', value: app.employment_status }] : []),
                              ...(app.city && app.state ? [{ label: 'Location', value: `${app.city}, ${app.state}` }] : []),
                            ].map(({ label, value }) => (
                              <div key={label} className="p-3 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                                <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: T.muted }}>{label}</p>
                                <p className="text-xs font-semibold" style={{ color: T.head }}>{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Purpose */}
                        {app.purpose && (
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: T.muted }}>Grant Purpose</p>
                            <div className="p-3.5 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                              <p className="text-xs leading-relaxed" style={{ color: T.body }}>{app.purpose}</p>
                            </div>
                          </div>
                        )}

                        {/* Reviewer notes */}
                        {app.reviewer_notes && (
                          <div className="rounded-xl p-4" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle size={13} style={{ color: '#D97706' }} />
                              <p className="text-xs font-bold" style={{ color: '#92400E' }}>Reviewer Notes</p>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>{app.reviewer_notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Link to={`/applications/${app.id}`}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                            <ExternalLink size={12} /> View Full Details
                          </Link>
                          <Link to="/apply/chat"
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                            style={{ background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0' }}>
                            <MessageSquare size={12} /> Ask AI Assistant
                          </Link>
                          {['pending','under_review'].includes(app.status) && (
                            <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                              <Clock size={12} /> Processing — check back soon
                            </span>
                          )}
                          {app.status === 'rejected' && (
                            <Link to="/apply"
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold"
                              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                              <RefreshCw size={12} /> Reapply
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>

      {/* FAQ / Help section */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Clock, title: 'Processing Times', desc: 'Emergency: 3–5 days · Education: 7–10 days · Medical: 5–7 days · Business: 10–15 days', color: '#2563EB', bg: '#EFF6FF' },
          { icon: DollarSign, title: 'Funding Amounts', desc: 'Emergency $5K–$10K · Education $8K–$15K · Medical $10K–$25K · Business $5K–$50K', color: '#16A34A', bg: '#F0FDF4' },
          { icon: BarChart3, title: 'Approval Rate', desc: 'Complete applications with detailed purpose statements have a 78%+ approval rate on our platform.', color: '#7C3AED', bg: '#F5F3FF' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="rounded-2xl p-5" style={{ background: T.white, boxShadow: T.card }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon size={16} style={{ color }} />
            </div>
            <h3 className="text-sm font-bold mb-1.5" style={{ color: T.head }}>{title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: T.body }}>{desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
