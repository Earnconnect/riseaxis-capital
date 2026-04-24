import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Clock, CheckCircle2, DollarSign, Plus, MessageSquare,
  Bell, Shield, ChevronRight, Zap, GraduationCap, HeartPulse,
  Briefcase, Building2, Users, Phone, Mail, Upload, AlertTriangle,
  BookOpen, TrendingUp, Award, RefreshCw, Star, Info,
  CheckSquare, XCircle, Calendar, ArrowUpRight, Banknote,
  ClipboardList, HelpCircle, Megaphone, Lock, BarChart3,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

/* ── Tokens ───────────────────────────────────────────────── */
const T = {
  bg: '#FAF8F5', white: '#FFFFFF', head: '#0F172A', body: '#475569',
  muted: '#94A3B8', border: '#EDE9E3', green: '#16A34A',
  greenLt: '#F0FDF4', greenBd: '#BBF7D0', navy: '#1E3A5F',
  card: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
  lift: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)',
}

const SC = (s: string) => ({ pending: '#D97706', under_review: '#2563EB', approved: '#16A34A', rejected: '#DC2626', disbursed: '#7C3AED' }[s] ?? '#94A3B8')
const SB = (s: string) => ({ pending: '#FFFBEB', under_review: '#EFF6FF', approved: '#F0FDF4', rejected: '#FEF2F2', disbursed: '#F5F3FF' }[s] ?? '#F8FAFC')
const SD = (s: string) => ({ pending: '#FDE68A', under_review: '#BFDBFE', approved: '#BBF7D0', rejected: '#FECACA', disbursed: '#DDD6FE' }[s] ?? '#E2E8F0')

/* ── Primitives ───────────────────────────────────────────── */
function Card({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-2xl ${className}`} style={{ background: T.white, boxShadow: T.card, ...style }}>{children}</div>
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>{children}</h2>
}
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

/* ── Main ─────────────────────────────────────────────────── */
export default function UserDashboard() {
  const { user, profile } = useAuth()
  const [apps, setApps]       = useState<GrantApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('grant_applications').select('*')
      .eq('user_id', user!.id).order('created_at', { ascending: false })
    if (data) setApps(data as GrantApplication[])
    setLoading(false)
  }

  const latest   = apps[0] ?? null
  const pending  = apps.filter(a => ['pending', 'under_review'].includes(a.status)).length
  const approved = apps.filter(a => ['approved', 'disbursed'].includes(a.status)).length
  const received = apps.filter(a => a.status === 'disbursed').reduce((s, a) => s + (a.approved_amount || 0), 0)
  const rejected = apps.filter(a => a.status === 'rejected').length
  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today     = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const PIPELINE = ['Submitted', 'In Review', 'Decision', 'Funded']
  const pStep    = latest ? ({ disbursed: 3, approved: 2, under_review: 1 }[latest.status] ?? 0) : -1

  const docsComplete = 2
  const docsTotal    = 5
  const needsAction  = latest && ['pending', 'under_review'].includes(latest.status)

  return (
    <div className="px-5 lg:px-8 py-8 space-y-6 max-w-[1440px]" style={{ background: T.bg }}>

      {/* ══ 1. GREETING ══════════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: T.muted }}>{today}</p>
          <h1 className="text-2xl font-bold" style={{ color: T.head }}>{greeting}, {firstName} 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: T.muted }}>
            {apps.length === 0 ? 'Welcome to your grant portal. Start your first application.' : `You have ${apps.length} application${apps.length !== 1 ? 's' : ''} on file.`}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link to="/apply/chat"
            className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: T.white, border: `1px solid ${T.border}`, color: T.body, boxShadow: T.card }}>
            <MessageSquare size={15} style={{ color: T.muted }} /> <span className="hidden sm:inline">AI </span>Chat
          </Link>
          <Link to="/apply"
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
            <Plus size={15} strokeWidth={2.5} /> Apply Now
          </Link>
        </div>
      </motion.div>

      {/* ══ 2. ACTION ALERT ══════════════════════════════════ */}
      {needsAction && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl"
          style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#FEF3C7' }}>
              <AlertTriangle size={15} style={{ color: '#D97706' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#92400E' }}>Action may be required on your application</p>
              <p className="text-xs" style={{ color: '#B45309' }}>Ensure all required documents are uploaded to avoid delays.</p>
            </div>
          </div>
          <Link to={`/applications/${latest?.id}?tab=documents`}
            className="self-start sm:self-auto shrink-0 text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all hover:brightness-105"
            style={{ background: '#F59E0B', color: '#fff' }}>
            Take Action
          </Link>
        </motion.div>
      )}

      {/* ══ 3. KPI CARDS ═════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', value: apps.length,  icon: FileText,     to: '/apply',         pastel: '#C7D7FD', glow: 'rgba(99,120,245,0.18)',  fmt: (v: number) => String(v) },
          { label: 'Under Review',       value: pending,       icon: Clock,        to: '/notifications', pastel: '#FDE68A', glow: 'rgba(245,158,11,0.18)', fmt: (v: number) => String(v) },
          { label: 'Approved',           value: approved,      icon: CheckCircle2, to: '/dashboard',     pastel: '#BBF7D0', glow: 'rgba(22,163,74,0.18)',   fmt: (v: number) => String(v) },
          { label: 'Funds Received',     value: received,      icon: DollarSign,   to: '/apply/chat',    pastel: '#E9D5FF', glow: 'rgba(124,58,237,0.18)',  fmt: (v: number) => received > 0 ? formatCurrency(v) : '$0' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.05 }}
            whileHover={{ y: -3, boxShadow: T.lift }}
            className="rounded-2xl px-5 py-5 flex flex-col items-center text-center relative overflow-hidden cursor-default transition-all duration-200"
            style={{ background: s.pastel, boxShadow: `0 2px 16px ${s.glow}` }}>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,255,255,0.25)' }} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 relative z-10"
              style={{ color: 'rgba(15,23,42,0.45)' }}>{s.label}</p>
            {loading
              ? <Sk w="w-16" h="h-9" />
              : <p className="text-2xl sm:text-3xl font-black relative z-10 leading-none mb-4" style={{ color: '#0F172A' }}>{s.fmt(s.value)}</p>
            }
            <Link to={s.to}
              className="relative z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ background: '#0F172A', boxShadow: '0 4px 12px rgba(15,23,42,0.28)' }}>
              <s.icon size={17} strokeWidth={1.8} className="text-white" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ══ 4. MAIN GRID ═════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* LEFT 2/3 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Application Status Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: latest
                ? `linear-gradient(135deg, ${SC(latest.status)}F0, ${SC(latest.status)}BB)`
                : 'linear-gradient(135deg,#16A34A,#15803D)',
              boxShadow: latest ? `0 8px 28px ${SC(latest.status)}35` : '0 8px 28px rgba(22,163,74,0.3)',
            }}>
            <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="absolute right-6 bottom-4 opacity-[0.07] pointer-events-none"><Zap size={80} strokeWidth={1.2} className="text-white" /></div>

            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">
                  {latest ? 'Latest Application Status' : 'Grant Portal · FY 2025–2026'}
                </p>
                {loading ? <div className="h-9 w-52 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.2)' }} /> : latest ? (
                  <>
                    <p className="text-white/70 text-sm font-medium mb-0.5">{getGrantProgramLabel(latest.grant_program)}</p>
                    <p className="text-3xl font-black text-white leading-none mb-1">{formatCurrency(latest.requested_amount)}</p>
                    <p className="font-mono text-white/40 text-xs">#{latest.app_number}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-black text-white mb-1">No Applications Yet</p>
                    <p className="text-white/55 text-sm">You haven't submitted any applications yet.</p>
                  </>
                )}
              </div>
              {latest && <Pill status={latest.status} />}
            </div>

            {latest && (
              <div className="relative mt-5 flex items-center">
                {PIPELINE.map((step, i) => (
                  <div key={step} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: i <= pStep ? '#fff' : 'rgba(255,255,255,0.18)', color: i <= pStep ? SC(latest.status) : 'rgba(255,255,255,0.45)' }}>
                        {i <= pStep ? <CheckCircle2 size={11} /> : i + 1}
                      </div>
                      <span className="text-[9px] font-semibold mt-1 whitespace-nowrap"
                        style={{ color: i <= pStep ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>{step}</span>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className="h-px flex-1 mx-1 mb-4 rounded"
                        style={{ background: i < pStep ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.18)' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
            {!latest && (
              <Link to="/apply" className="relative mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.18)' }}>
                <Plus size={14} strokeWidth={2.5} /> Apply for a Grant
              </Link>
            )}
          </motion.div>

          {/* Recent Applications */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            <Card>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                <h2 className="text-sm font-bold" style={{ color: T.head }}>My Applications</h2>
                <Link to="/apply" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: T.green, boxShadow: '0 2px 10px rgba(22,163,74,0.28)' }}>
                  <Plus size={11} strokeWidth={3} /> New
                </Link>
              </div>
              {loading ? (
                <div className="p-5 space-y-4">{[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl animate-pulse shrink-0" style={{ background: T.border }} />
                    <div className="flex-1 space-y-2"><Sk w="w-40" h="h-3.5" /><Sk w="w-24" h="h-3" /></div>
                    <Sk w="w-16" h="h-6" />
                  </div>
                ))}</div>
              ) : apps.length === 0 ? (
                <div className="py-14 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: T.greenLt }}>
                    <FileText size={20} style={{ color: T.green }} />
                  </div>
                  <p className="font-semibold text-sm mb-1" style={{ color: T.head }}>No applications yet</p>
                  <p className="text-xs mb-4" style={{ color: T.muted }}>Submit your first grant application to get started.</p>
                  <Link to="/apply" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white" style={{ background: T.green }}>
                    <Plus size={12} /> Apply Now
                  </Link>
                </div>
              ) : (
                <div>
                  {apps.slice(0, 5).map((app, i) => (
                    <div key={app.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50/70"
                      style={{ borderBottom: i < Math.min(apps.length, 5) - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: SB(app.status) }}>
                        <FileText size={14} style={{ color: SC(app.status) }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: T.head }}>{getGrantProgramLabel(app.grant_program)}</p>
                        <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: T.muted }}>
                          <span className="font-mono">#{app.app_number}</span><span>·</span><span>{formatDateShort(app.created_at)}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0 space-y-1">
                        <p className="text-sm font-bold" style={{ color: T.head }}>{formatCurrency(app.requested_amount)}</p>
                        <Pill status={app.status} />
                      </div>
                    </div>
                  ))}
                  {apps.length > 5 && (
                    <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${T.border}` }}>
                      <p className="text-xs" style={{ color: T.muted }}>+{apps.length - 5} more applications</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>

          {/* How It Works — Processing Timeline */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-6">
              <SectionTitle>How Your Application Is Processed</SectionTitle>
              <div className="space-y-0">
                {[
                  { step: '01', title: 'Application Submitted',     desc: 'Your application is received and assigned a unique reference number.',         icon: ClipboardList, color: '#2563EB', bg: '#EFF6FF', time: 'Immediate' },
                  { step: '02', title: 'Initial Review',            desc: 'Our team verifies your identity, eligibility, and document completeness.',      icon: Shield,        color: '#D97706', bg: '#FFFBEB', time: '1–2 business days' },
                  { step: '03', title: 'Program Assessment',        desc: 'Application is matched to the best-fit grant program and evaluated.',           icon: BarChart3,     color: '#7C3AED', bg: '#F5F3FF', time: '2–5 business days' },
                  { step: '04', title: 'Approval Decision',         desc: 'Final decision is made and you are notified via email and portal.',              icon: Award,         color: '#16A34A', bg: '#F0FDF4', time: '1–2 business days' },
                  { step: '05', title: 'Disbursement',              desc: 'Approved funds are transferred directly to your verified bank account via ACH.', icon: Banknote,      color: '#DB2777', bg: '#FDF2F8', time: '1–3 business days' },
                ].map(({ step, title, desc, icon: Icon, color, bg, time }, i, arr) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon size={15} style={{ color }} />
                      </div>
                      {i < arr.length - 1 && <div className="w-px flex-1 my-1.5" style={{ background: T.border }} />}
                    </div>
                    <div className="pb-5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-black tracking-widest" style={{ color }}>{step}</span>
                        <span className="text-sm font-bold" style={{ color: T.head }}>{title}</span>
                      </div>
                      <p className="text-xs leading-relaxed mb-1" style={{ color: T.body }}>{desc}</p>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>⏱ {time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Disbursement History */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
            <Card>
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                <h2 className="text-sm font-bold" style={{ color: T.head }}>Disbursement History</h2>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                  {received > 0 ? formatCurrency(received) + ' Total' : 'No Disbursements Yet'}
                </span>
              </div>
              {apps.filter(a => a.status === 'disbursed').length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <Banknote size={28} className="mx-auto mb-2" style={{ color: T.muted }} />
                  <p className="text-sm font-semibold mb-0.5" style={{ color: T.head }}>No disbursements yet</p>
                  <p className="text-xs" style={{ color: T.muted }}>Once your application is approved and funded, payment history will appear here.</p>
                </div>
              ) : (
                <div>
                  {apps.filter(a => a.status === 'disbursed').map((app, i, arr) => (
                    <div key={app.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/70"
                      style={{ borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#F5F3FF' }}>
                        <Banknote size={15} style={{ color: '#7C3AED' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: T.head }}>{getGrantProgramLabel(app.grant_program)}</p>
                        <p className="text-xs font-mono" style={{ color: T.muted }}>#{app.app_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black" style={{ color: '#16A34A' }}>+{formatCurrency(app.approved_amount || 0)}</p>
                        <p className="text-[10px]" style={{ color: T.muted }}>Disbursed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Tips to improve approval */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}>
                  <Star size={15} style={{ color: '#D97706' }} />
                </div>
                <h2 className="text-sm font-bold" style={{ color: T.head }}>Tips to Improve Your Approval Chances</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { tip: 'Provide a detailed purpose statement of at least 200 words explaining your specific need.' },
                  { tip: 'Upload all required documents upfront — incomplete applications take 2× longer to process.' },
                  { tip: 'Choose the grant program that most closely matches your stated need for the highest match score.' },
                  { tip: 'Ensure your bank account information is accurate — disbursement failures cause significant delays.' },
                  { tip: 'Keep your contact information current so our team can reach you quickly with questions.' },
                  { tip: 'Apply for one program at a time — duplicate applications for the same need may be flagged.' },
                ].map(({ tip }, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.border}` }}>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: '#FEF3C7' }}>
                      <span className="text-[8px] font-black" style={{ color: '#D97706' }}>{i + 1}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: T.body }}>{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT 1/3 */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}
          className="space-y-4">

          {/* Application score / eligibility */}
          <Card className="p-5 overflow-hidden relative">
            <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full pointer-events-none" style={{ background: '#F0FDF4' }} />
            <div className="relative">
              <h2 className="text-sm font-bold mb-1" style={{ color: T.head }}>Eligibility Score</h2>
              <p className="text-xs mb-4" style={{ color: T.muted }}>Based on your profile completeness</p>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-black" style={{ color: T.head }}>72</span>
                <div className="mb-1.5">
                  <span className="text-sm font-bold" style={{ color: '#D97706' }}>/100</span>
                  <p className="text-[10px] font-semibold" style={{ color: '#D97706' }}>Good — Room to improve</p>
                </div>
              </div>
              <div className="h-2 rounded-full mb-4" style={{ background: T.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: '72%', background: 'linear-gradient(90deg, #16A34A, #D97706)' }} />
              </div>
              {[
                { label: 'Profile Complete',   done: true },
                { label: 'ID Verified',        done: true },
                { label: 'Address Confirmed',  done: true },
                { label: 'Documents Uploaded', done: false },
                { label: 'Bank Verified',      done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: `1px solid ${T.border}` }}>
                  <span className="text-xs" style={{ color: T.body }}>{label}</span>
                  {done
                    ? <CheckCircle2 size={14} style={{ color: T.green }} />
                    : <XCircle size={14} style={{ color: '#DC2626' }} />
                  }
                </div>
              ))}
              <Link to="/settings"
                className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                Complete Profile <ChevronRight size={11} />
              </Link>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <SectionTitle>Quick Actions</SectionTitle>
            <div className="space-y-2">
              {[
                { icon: Plus,         label: 'Apply for a Grant',    sub: 'Start a new application',    to: '/apply',         color: T.green,   bg: T.greenLt },
                { icon: MessageSquare,label: 'AI Grant Assistant',   sub: 'Chat with AI support 24/7',  to: '/apply/chat',    color: '#2563EB', bg: '#EFF6FF' },
                { icon: Bell,         label: 'Notifications',        sub: 'View your updates',          to: '/notifications', color: '#7C3AED', bg: '#F5F3FF' },
                { icon: Shield,       label: 'Verify a Receipt',     sub: 'Authenticate payments',      to: '/verify',        color: '#D97706', bg: '#FFFBEB' },
                { icon: RefreshCw,    label: 'My Applications',       sub: 'Track all your applications', to: '/applications',  color: '#DB2777', bg: '#FDF2F8' },
              ].map((a) => (
                <Link key={a.label} to={a.to}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                  style={{ background: T.bg, border: `1px solid ${T.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = a.bg; e.currentTarget.style.borderColor = 'transparent' }}
                  onMouseLeave={e => { e.currentTarget.style.background = T.bg; e.currentTarget.style.borderColor = T.border }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: a.bg }}>
                    <a.icon size={15} style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: T.head }}>{a.label}</p>
                    <p className="text-[10px]" style={{ color: T.muted }}>{a.sub}</p>
                  </div>
                  <ChevronRight size={12} style={{ color: T.muted }} />
                </Link>
              ))}
            </div>
          </Card>

          {/* Document Checklist */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold" style={{ color: T.head }}>Document Checklist</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: '#FEF3C7', color: '#92400E' }}>{docsComplete}/{docsTotal} Done</span>
            </div>
            <div className="h-1.5 rounded-full mb-4" style={{ background: T.border }}>
              <div className="h-full rounded-full" style={{ width: `${(docsComplete / docsTotal) * 100}%`, background: 'linear-gradient(90deg,#16A34A,#22C55E)' }} />
            </div>
            <div className="space-y-2">
              {[
                { label: 'Government-issued photo ID', done: true,  required: true },
                { label: 'Proof of current address',   done: true,  required: true },
                { label: 'Proof of need / emergency',  done: false, required: true },
                { label: 'Bank account info (ACH)',    done: false, required: true },
                { label: 'Income verification',        done: false, required: false },
              ].map(({ label, done, required }) => (
                <div key={label} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0"
                    style={{ background: done ? T.green : T.border }}>
                    {done && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <span className="text-xs flex-1 leading-tight" style={{ color: done ? T.head : T.muted }}>{label}</span>
                  {required && !done && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#DC2626' }}>Required</span>
                  )}
                </div>
              ))}
            </div>
            <Link to="/apply"
              className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
              <Upload size={12} /> Upload Documents
            </Link>
          </Card>

          {/* Platform Trust Stats */}
          <Card className="p-5" style={{ background: T.navy }}>
            <div className="flex items-center gap-2 mb-4">
              <Megaphone size={14} style={{ color: '#4ADE80' }} />
              <h2 className="text-sm font-bold text-white">Platform Statistics</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: '$28.4M',  label: 'Total Disbursed',    color: '#4ADE80' },
                { value: '2,840+',  label: 'Grants Funded',      color: '#60A5FA' },
                { value: '78%',     label: 'Approval Rate',      color: '#FBBF24' },
                { value: '7 Days',  label: 'Avg Processing',     color: '#F472B6' },
              ].map(({ value, label, color }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-lg font-black" style={{ color }}>{value}</p>
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Lock size={10} />
              All data is encrypted and secured
            </div>
          </Card>

          {/* Grant Support */}
          <Card className="p-5">
            <h2 className="text-sm font-bold mb-3" style={{ color: T.head }}>Grant Support Team</h2>
            {[
              { icon: Phone, label: '(702) 274-7227',             sub: 'Mon–Fri · 9AM–6PM EST',    href: 'tel:7022747227',                      color: T.green,   bg: T.greenLt },
              { icon: Mail,  label: 'grants@riseaxiscapital.com', sub: 'Response within 24 hours', href: 'mailto:grants@riseaxiscapital.com',    color: '#2563EB', bg: '#EFF6FF' },
            ].map(({ icon: Icon, label, sub, href, color, bg }) => (
              <a key={label} href={href}
                className="flex items-center gap-3 p-3 rounded-xl mb-2 transition-all last:mb-0"
                style={{ background: T.bg }}
                onMouseEnter={e => e.currentTarget.style.background = bg}
                onMouseLeave={e => e.currentTarget.style.background = T.bg}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: T.head }}>{label}</p>
                  <p className="text-[10px]" style={{ color: T.muted }}>{sub}</p>
                </div>
              </a>
            ))}
          </Card>
        </motion.div>
      </div>

      {/* ══ 5. GRANT PROGRAMS ════════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: T.head }}>Available Grant Programs</h2>
          <Link to="/programs" className="flex items-center gap-1 text-xs font-semibold" style={{ color: T.green }}>
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Shield,        label: 'Emergency',  range: '$5K–$10K',  color: '#DC2626', bg: '#FEF2F2', days: '3–5 days' },
            { icon: GraduationCap, label: 'Education',  range: '$8K–$15K',  color: '#2563EB', bg: '#EFF6FF', days: '7–10 days' },
            { icon: HeartPulse,    label: 'Medical',    range: '$10K–$25K', color: '#DB2777', bg: '#FDF2F8', days: '5–7 days' },
            { icon: Users,         label: 'Community',  range: '$15K–$25K', color: '#16A34A', bg: '#F0FDF4', days: '10–14 days' },
            { icon: Briefcase,     label: 'Business',   range: '$5K–$50K',  color: '#7C3AED', bg: '#F5F3FF', days: '10–15 days' },
            { icon: Building2,     label: 'Other',      range: 'Custom',    color: '#D97706', bg: '#FFFBEB', days: '7–14 days' },
          ].map((p, i) => (
            <motion.div key={p.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 + i * 0.04 }}
              whileHover={{ y: -3, boxShadow: T.lift }}>
              <Link to="/apply"
                className="flex flex-col items-center text-center p-4 rounded-2xl transition-all duration-200 h-full"
                style={{ background: T.white, boxShadow: T.card }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3" style={{ background: p.bg }}>
                  <p.icon size={19} style={{ color: p.color }} />
                </div>
                <p className="text-xs font-bold mb-0.5" style={{ color: T.head }}>{p.label}</p>
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: p.color }}>{p.range}</p>
                <p className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>{p.days}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══ 6. RESOURCES / FAQ ═══════════════════════════════ */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: T.head }}>Resources & FAQs</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: BookOpen,   title: 'Grant Application Guide',         desc: 'Step-by-step walkthrough of the full application process, from eligibility to disbursement.',    color: '#2563EB', bg: '#EFF6FF', tag: 'Guide' },
            { icon: HelpCircle, title: 'Frequently Asked Questions',      desc: 'Answers to the most common questions about eligibility, processing times, and fund usage.',      color: '#7C3AED', bg: '#F5F3FF', tag: 'FAQ' },
            { icon: FileText,   title: 'Required Documents Checklist',    desc: 'A complete list of all documents required across all six grant programs we offer.',              color: '#D97706', bg: '#FFFBEB', tag: 'Checklist' },
            { icon: TrendingUp, title: 'Improve Your Approval Rate',      desc: 'Expert tips on how to strengthen your application, write a compelling purpose statement.',       color: '#16A34A', bg: '#F0FDF4', tag: 'Tips' },
            { icon: Banknote,   title: 'Understanding Disbursements',     desc: 'How ACH transfers work, processing windows, and what to do if you have an issue.',              color: '#DB2777', bg: '#FDF2F8', tag: 'Finance' },
            { icon: Shield,     title: 'Privacy & Data Security',         desc: 'How your personal data and financial information is protected under our security policy.',       color: '#0F172A', bg: '#F1F5F9', tag: 'Security' },
          ].map(({ icon: Icon, title, desc, color, bg, tag }) => (
            <div key={title}
              className="flex flex-col p-5 rounded-2xl transition-all cursor-pointer group"
              style={{ background: T.white, boxShadow: T.card }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = T.lift)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = T.card)}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                  style={{ background: bg, color }}>{tag}</span>
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: T.head }}>{title}</h3>
              <p className="text-xs leading-relaxed flex-1" style={{ color: T.body }}>{desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs font-semibold transition-colors" style={{ color }}>
                Read more <ArrowUpRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══ 7. COMPLIANCE & LEGAL FOOTER ═════════════════════ */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.32 }}>
        <div className="rounded-2xl p-6" style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} style={{ color: T.green }} />
            <h2 className="text-sm font-bold" style={{ color: T.head }}>Compliance & Legal Disclosures</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { label: '501(c)(3) Nonprofit', value: 'Registered', color: T.green },
              { label: 'EIN',                 value: '27-0964813', color: T.head },
              { label: 'IRS Compliance',      value: 'Confirmed',  color: T.green },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <CheckCircle2 size={13} style={{ color: T.green }} />
                <span className="text-xs" style={{ color: T.body }}>{label}:</span>
                <span className="text-xs font-bold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: T.muted }}>
            RiseAxis Capital is a 501(c)(3) nonprofit organization located at 3040 Idaho Ave NW, Washington, DC 20016.
            All grant funding is subject to eligibility verification. Grants exceeding $600 in a calendar year may be reported
            to the Internal Revenue Service via Form 1099-MISC. By participating in our grant programs, you agree to our
            Terms of Service, Privacy Policy, and Acceptable Use Policy. Providing false information on a grant application
            is a federal offense subject to civil and criminal penalties under 18 U.S.C. § 1001.
          </p>
        </div>
      </motion.div>

    </div>
  )
}
