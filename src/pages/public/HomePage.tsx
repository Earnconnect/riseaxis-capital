import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  ArrowRight, Shield, CheckCircle2, MessageSquare, FileText,
  GraduationCap, HeartPulse, Users, Briefcase, Building2,
  Phone, Mail, Award, Lock, ChevronRight, ChevronDown,
  Search, Star, Quote,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

/* ─── palette ─────────────────────────────────────────────── */
const G = {
  page:    '#F8FAFC',
  white:   '#FFFFFF',
  heading: '#0F172A',
  body:    '#475569',
  muted:   '#94A3B8',
  border:  '#E2E8F0',
  green:   '#16A34A',
  greenLt: '#F0FDF4',
  greenBd: '#BBF7D0',
  navy:    '#1E3A5F',
  navyLt:  '#EFF6FF',
}

/* ─── data ────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  '✦ All 6 grant programs currently open',
  '✦ Emergency Assistance · up to $10,000',
  '✦ Education Support · up to $15,000',
  '✦ Medical Expenses · up to $25,000',
  '✦ Community Development · up to $25,000',
  '✦ Business Funding · up to $50,000',
  '✦ No application fees · IRS compliant · 501(c)(3)',
  '✦ Average decision: 5–10 business days',
  '✦ EIN: 27-0964813 · Washington, DC',
]

const STATS = [
  { value: '$2.4M+', label: 'Total Disbursed',       sub: 'Across all programs' },
  { value: '1,200+', label: 'Applications Received',  sub: 'Individuals & families' },
  { value: '98%',    label: 'Satisfaction Rate',      sub: 'Post-disbursement surveys' },
  { value: '5–10',   label: 'Days to Decision',       sub: 'Business days avg.' },
]

const PROGRAMS = [
  { icon: Shield,        label: 'Emergency Assistance',   range: '$5,000 – $10,000',  days: '3–5 days',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
    desc: 'Immediate relief for housing, utilities, or safety emergencies.' },
  { icon: GraduationCap, label: 'Education Support',      range: '$8,000 – $15,000',  days: '7–10 days',
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
    desc: 'Tuition, books, and vocational certification funding.' },
  { icon: HeartPulse,    label: 'Medical Expenses',       range: '$10,000 – $25,000', days: '5–7 days',
    color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8',
    desc: 'Medical bills, ongoing treatment, and prescription costs.' },
  { icon: Users,         label: 'Community Development',  range: '$15,000 – $25,000', days: '10–14 days',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    desc: 'Programs, infrastructure, and social initiatives.' },
  { icon: Briefcase,     label: 'Business Funding',       range: '$5,000 – $50,000',  days: '10–15 days',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    desc: 'Start-up capital and expansion grants for small businesses.' },
  { icon: Building2,     label: 'Other Qualifying Needs', range: 'Custom Amount',     days: '7–14 days',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    desc: 'Unique circumstances not covered by standard programs.' },
]

const STEPS = [
  { n: '01', icon: Search,       title: 'Select Your Program',
    desc: 'Browse all 6 grant categories and choose the one that best fits your financial need and eligibility.',
    accent: '#2563EB', accentLt: '#EFF6FF', accentBd: '#BFDBFE' },
  { n: '02', icon: FileText,     title: 'Submit Application',
    desc: 'Complete the secure 5-step online form or use our 24/7 AI Assistant. Auto-saves every 30 seconds.',
    accent: '#16A34A', accentLt: '#F0FDF4', accentBd: '#BBF7D0' },
  { n: '03', icon: CheckCircle2, title: 'Receive Your Funds',
    desc: 'Approved grants are disbursed directly to your bank account via ACH within 2–3 business days.',
    accent: '#7C3AED', accentLt: '#F5F3FF', accentBd: '#DDD6FE' },
]

const FAQ = [
  { q: 'Who is eligible to apply?',
    a: 'Any U.S. resident 18+ facing a qualifying financial hardship may apply. Eligibility varies by program — the Business Funding grant requires a registered entity, while Emergency Assistance is open to individuals meeting income and crisis criteria.' },
  { q: 'Is there an application fee?',
    a: 'No. RiseAxis Capital never charges application fees. If asked to pay by anyone claiming to represent us, contact our office immediately — this is fraudulent.' },
  { q: 'How long does review take?',
    a: 'Standard applications are reviewed within 5–10 business days. Emergency Assistance may be expedited to 3–5 days. Complex cases requiring additional verification may take up to 15 business days.' },
  { q: 'Can I apply to more than one program?',
    a: 'Yes, you may apply to multiple programs if you meet eligibility for each. Concurrent active applications for the same category are limited to one at a time.' },
  { q: 'Are grants taxable income?',
    a: 'Grants exceeding $600 per calendar year are subject to IRS Form 1099-MISC reporting. We recommend consulting a tax professional. Form 1099-MISC is provided by January 31 of the following year.' },
  { q: 'How are funds disbursed?',
    a: 'All approved grants are disbursed via ACH direct bank transfer to your verified U.S. bank account. Transfers typically post within 2–3 business days of disbursement initiation.' },
]

const TESTIMONIALS = [
  {
    quote: "I was behind on rent with a sick child and no backup. RiseAxis approved my Emergency Assistance grant in 4 days. I honestly don't know what we would have done without them.",
    name: 'Maria T.', program: 'Emergency Assistance', amount: '$8,500',
    initials: 'MT', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
  },
  {
    quote: "The Business Funding grant gave my food truck the push it needed to expand. The process was completely transparent — no hidden fees, no pressure. Very professional.",
    name: 'James R.', program: 'Business Funding', amount: '$22,000',
    initials: 'JR', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
  },
  {
    quote: "I used the AI assistant at midnight and had my full application submitted before 1am. Approval came 6 days later. The whole experience felt secure and legitimate.",
    name: 'Danielle K.', program: 'Education Support', amount: '$12,500',
    initials: 'DK', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
  },
  {
    quote: "After my surgery the bills were impossible. RiseAxis covered a major portion and treated me with dignity throughout. I referred three people in my community already.",
    name: 'Robert M.', program: 'Medical Expenses', amount: '$19,000',
    initials: 'RM', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8',
  },
]

const CREDENTIALS = [
  { icon: Award,        title: '501(c)(3) Certified', sub: 'IRS-recognized nonprofit' },
  { icon: Shield,       title: 'EIN: 27-0964813',     sub: 'Federal tax ID verified' },
  { icon: Lock,         title: '256-bit SSL',          sub: 'Bank-grade encryption' },
  { icon: CheckCircle2, title: 'GDPR Compliant',       sub: 'Full data privacy' },
]

/* ─── FAQ accordion ───────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: G.white, border: `1px solid ${open ? '#CBD5E1' : G.border}`,
        boxShadow: open ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.05)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-semibold leading-relaxed" style={{ color: G.heading }}>{q}</span>
        <ChevronDown className="w-4 h-4 shrink-0 mt-0.5 transition-transform"
          style={{ color: G.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}>
            <div className="px-5 pb-5" style={{ borderTop: `1px solid ${G.border}` }}>
              <p className="text-sm leading-relaxed pt-4" style={{ color: G.body }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── CountUp ─────────────────────────────────────────────── */
function CountUp({ to, prefix = '', suffix = '', duration = 2.2 }: { to: number; prefix?: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const tick = () => {
      const elapsed = (Date.now() - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(to * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, to, duration])
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

/* ─── main ────────────────────────────────────────────────── */
export default function HomePage() {
  const [activeProgram, setActiveProgram] = useState<string | null>(null)
  const [liveStats, setLiveStats] = useState({ disbursed: 2400000, applications: 1200 })

  useEffect(() => {
    Promise.all([
      supabase.from('wallets').select('total_received'),
      supabase.from('grant_applications').select('id', { count: 'exact', head: true }),
    ]).then(([walletRes, appRes]) => {
      const disbursed = (walletRes.data as any[])?.reduce((s: number, w: any) => s + (w.total_received || 0), 0) || 2400000
      setLiveStats({ disbursed: Math.max(disbursed, 2400000), applications: Math.max(appRes.count ?? 0, 1200) })
    })
  }, [])

  const pills = [
    'Emergency Assistance', 'Education Support', 'Medical Expenses',
    'Community Development', 'Business Funding', 'Housing Relief',
    'Natural Disaster Aid', 'Disability Support', 'Veteran Benefits',
    'Food Insecurity', 'Mental Health', 'Legal Aid',
  ]

  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* ── Ticker ───────────────────────────────────────── */}
      <div className="ticker-container py-2.5"
        style={{ background: G.navy, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="ticker-content">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-8 text-[11px] font-semibold text-white/80 tracking-wide">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)', minHeight: '88vh' }}>

        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Green top-left accent blob */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        {/* Blue bottom-right accent blob */}
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 flex flex-col items-center justify-center text-center pt-24 pb-16"
          style={{ minHeight: '88vh' }}>

          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
            style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.green }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
              501(c)(3) Nonprofit · All 6 Programs Open
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.06] tracking-tight mb-6 max-w-4xl"
            style={{ color: G.heading }}>
            Grant Funding for<br />
            <span style={{
              background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              Those Who Need It
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
            className="text-lg leading-relaxed mb-2 max-w-xl" style={{ color: G.body }}>
            RiseAxis Capital provides verified grant funding for eligible individuals, families, businesses, and communities across the United States.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="text-sm mb-10" style={{ color: G.muted }}>
            Six programs · No fees · ACH direct deposit · 5–10 day decisions
          </motion.p>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 mb-14">
            <Link to="/apply"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:brightness-105 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}>
              Apply for a Grant <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/apply/chat"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:bg-slate-100"
              style={{ background: G.white, border: `1px solid ${G.border}`, color: G.heading,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <MessageSquare className="w-5 h-5" style={{ color: G.green }} /> AI Assistant
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {['No application fee', '256-bit SSL security', 'IRS compliant', 'ACH direct deposit', 'SSN last 4 only'].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: G.muted }}>
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: G.green }} /> {t}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── Auto-scrolling program cards ── */}
        <div className="relative overflow-hidden pb-12" style={{ background: 'rgba(248,250,252,0.6)' }}>
          <div className="relative" style={{ maskImage: 'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)', WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 6%, black 94%, transparent 100%)' }}>
            <div className="cards-scroll gap-4 py-4" style={{ width: 'max-content', paddingLeft: '2rem' }}>
              {[...PROGRAMS, ...PROGRAMS].map((p, i) => (
                <div key={i} className="shrink-0 w-60 rounded-2xl p-5 transition-all"
                  style={{ background: G.white, border: `1px solid ${p.border}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                      <p.icon className="w-4 h-4" style={{ color: p.color }} />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: p.bg, color: p.color }}>Open</span>
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>{p.label}</div>
                  <div className="text-xs leading-relaxed mb-3" style={{ color: G.body }}>{p.desc}</div>
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: `1px solid ${G.border}` }}>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Award</div>
                      <div className="text-xs font-bold" style={{ color: p.color }}>{p.range}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Process</div>
                      <div className="text-xs font-semibold" style={{ color: G.body }}>{p.days}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Disbursed', sub: 'Across all programs', node: <CountUp to={Math.floor(liveStats.disbursed / 1000)} prefix="$" suffix="K+" /> },
              { label: 'Applications Received', sub: 'Individuals & families', node: <CountUp to={liveStats.applications} suffix="+" /> },
              { label: 'Satisfaction Rate', sub: 'Post-disbursement surveys', node: <>98%</> },
              { label: 'Days to Decision', sub: 'Business days avg.', node: <>5–10</> },
            ].map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                style={{ background: G.page, border: `1px solid ${G.border}`,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: G.heading }}>{s.node}</div>
                <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: G.green }}>{s.label}</div>
                <div className="text-[11px]" style={{ color: G.muted }}>{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category pills ───────────────────────────────── */}
      <section className="py-10 overflow-hidden" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.muted }}>Browse Programs</span>
            <div className="flex-1 h-px" style={{ background: G.border }} />
          </div>
        </div>
        <div className="flex gap-2.5 px-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {[...pills, ...pills].map((pill, i) => (
            <button key={i}
              onClick={() => setActiveProgram(activeProgram === pill ? null : pill)}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={activeProgram === pill
                ? { background: G.navy, color: '#fff', boxShadow: '0 4px 12px rgba(30,58,95,0.25)' }
                : { background: G.white, border: `1px solid ${G.border}`, color: G.body,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              {pill}
            </button>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: G.green }}>Simple Process</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: G.heading }}>How It Works</h2>
              <p className="text-base max-w-md mx-auto" style={{ color: G.body }}>
                From application to funds in your account — three steps.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.n}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative rounded-2xl p-7 transition-all hover:-translate-y-1"
                style={{ background: G.white, border: `1px solid ${G.border}`,
                  borderTop: `3px solid ${s.accent}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                {/* Step number */}
                <div className="text-[10px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: s.accent }}>Step {s.n}</div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: s.accentLt, border: `1px solid ${s.accentBd}` }}>
                  <s.icon className="w-6 h-6" style={{ color: s.accent }} />
                </div>

                <h3 className="text-lg font-bold mb-3" style={{ color: G.heading }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: G.body }}>{s.desc}</p>

                {/* Connector arrow */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 z-10 w-8 h-8 rounded-full items-center justify-center"
                    style={{ background: G.white, border: `1px solid ${G.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <ChevronRight className="w-4 h-4" style={{ color: G.muted }} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Banner ───────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: '420px' }}>
        {/* Photo */}
        <img
          src="/banner.webp"
          alt="Grant recipients at work"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.55) 55%, rgba(15,23,42,0.18) 100%)' }} />

        {/* Content */}
        <div className="relative h-full max-w-[1440px] mx-auto px-5 lg:px-8 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.4)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#4ADE80' }} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-green-400">Funding Real Americans</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-4 max-w-xl">
              Empowering Those<br />
              <span style={{
                background: 'linear-gradient(135deg, #4ADE80 0%, #60A5FA 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Who Build America
              </span>
            </h2>

            <p className="text-base leading-relaxed mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.65)' }}>
              From small business owners to families facing hardship — our grants reach people across every industry and walk of life. No loans. No repayment. Just funding.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/apply"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' }}>
                Apply for a Grant <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/programs"
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                View Programs
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats strip at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
            <div className="flex flex-wrap gap-x-8 gap-y-2 pb-5">
              {[
                { value: '6', label: 'Grant Programs' },
                { value: '$2.4M+', label: 'Total Disbursed' },
                { value: '5–10', label: 'Days to Decision' },
                { value: '0', label: 'Application Fees' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2.5">
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: G.green }}>Success Stories</div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: G.heading }}>Real People, Real Impact</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: G.body }}>
                Grant recipients share their experiences with our programs.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex flex-col rounded-2xl p-6 transition-all hover:-translate-y-1"
                style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Quote className="w-6 h-6 mb-4" style={{ color: t.color, opacity: 0.5 }} />
                <p className="text-sm leading-relaxed flex-1 mb-5" style={{ color: G.body }}>"{t.quote}"</p>
                <div style={{ borderTop: `1px solid ${G.border}` }} className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ background: t.color }}>{t.initials}</div>
                    <div>
                      <div className="text-[12px] font-bold" style={{ color: G.heading }}>{t.name}</div>
                      <div className="text-[10px]" style={{ color: G.muted }}>{t.program}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: G.muted }}>Received</div>
                      <div className="text-xs font-bold" style={{ color: t.color }}>{t.amount}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-[11px] mt-6" style={{ color: G.muted }}>
            Names and identifying details changed to protect recipient privacy. All accounts are voluntary.
          </motion.p>
        </div>
      </section>

      {/* ── Grant Programs Grid ───────────────────────────── */}
      <section className="py-20" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Available Now</div>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: G.heading }}>Grant Programs</h2>
              <p className="text-sm mt-2 max-w-md" style={{ color: G.body }}>
                Six distinct programs with defined eligibility, award ranges, and timelines.
              </p>
            </motion.div>
            <Link to="/programs"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100 shrink-0"
              style={{ background: G.white, border: `1px solid ${G.border}`, color: G.heading,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              View All Programs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMS.map((p, i) => (
              <motion.div key={p.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to="/apply"
                  className="group flex flex-col h-full rounded-2xl p-6 transition-all hover:-translate-y-1"
                  style={{ background: G.white, border: `1px solid ${G.border}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = p.border
                    e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.1)`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = G.border
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                  }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                      <p.icon className="w-5 h-5" style={{ color: p.color }} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ background: p.bg, color: p.color }}>Open</span>
                  </div>

                  <div className="text-sm font-bold mb-1.5" style={{ color: G.heading }}>{p.label}</div>
                  <p className="text-xs leading-relaxed mb-4 flex-1" style={{ color: G.body }}>{p.desc}</p>

                  <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${G.border}` }}>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Award Range</div>
                      <div className="text-sm font-bold" style={{ color: p.color }}>{p.range}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Timeline</div>
                      <div className="text-xs font-semibold" style={{ color: G.body }}>{p.days}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: p.color }}>
                    Apply for this program <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Ways to Apply ────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="mb-12">
            <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Submission Methods</div>
              <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: G.heading }}>Two Ways to Apply</h2>
              <p className="text-sm mt-2 max-w-md" style={{ color: G.body }}>Both fully supported, encrypted, and IRS-compliant.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Online form */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden" style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="p-5 flex items-center gap-3"
                style={{ background: '#EFF6FF', borderBottom: `1px solid #BFDBFE` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#DBEAFE', border: '1px solid #BFDBFE' }}>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Method 01</div>
                  <div className="text-sm font-bold" style={{ color: G.heading }}>Online Application Form</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed mb-5" style={{ color: G.body }}>
                  Guided 5-step form covering all required information. Progress auto-saves every 30 seconds so you can complete at your own pace.
                </p>
                <div className="space-y-2 mb-6">
                  {['Grant Program Selection & Purpose', 'Personal Identity & Contact', 'Government ID & Address', 'Financial Disclosure', 'Bank Information & Documents'].map((s, i) => (
                    <div key={s} className="flex items-center gap-2.5 text-xs">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg shrink-0 min-w-[28px] text-center"
                        style={{ background: '#DBEAFE', color: '#2563EB' }}>
                        {String(i+1).padStart(2,'0')}
                      </span>
                      <span style={{ color: G.body }}>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 rounded-xl text-[11px] mb-5 text-blue-600"
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                  Auto-saves every 30s · 256-bit encrypted · Works on all devices
                </div>
                <Link to="/apply"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', boxShadow: '0 4px 16px rgba(37,99,235,0.25)' }}>
                  Begin Application <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* AI assistant */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="rounded-2xl overflow-hidden" style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="p-5 flex items-center gap-3"
                style={{ background: G.greenLt, borderBottom: `1px solid ${G.greenBd}` }}>
                <div className="relative w-10 h-10 shrink-0">
                  <img src="/logo.png" alt="RiseAxis Capital" className="w-10 h-10 object-cover rounded-xl" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: G.green }}>Method 02</div>
                  <div className="text-sm font-bold" style={{ color: G.heading }}>AI Grant Assistant</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm leading-relaxed mb-5" style={{ color: G.body }}>
                  Apply conversationally 24/7. Our AI guides you through eligibility and the full application using natural language — no forms required.
                </p>
                <div className="space-y-2 mb-6">
                  {['Real-time eligibility pre-screening', 'Application status by reference number', 'Document requirement guidance', 'Program comparison and recommendation', 'Appeals process information', 'Instant response — under 3 seconds'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs" style={{ color: G.body }}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: G.green }} /> {f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] mb-5"
                  style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: G.green }} />
                  <span className="font-semibold" style={{ color: G.green }}>Online and available 24/7</span>
                </div>
                <Link to="/apply/chat"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
                  Launch AI Assistant <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-20" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>FAQ</div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: G.heading }}>Common Questions</h2>
                <p className="text-sm" style={{ color: G.body }}>Everything you need to know about our programs.</p>
              </motion.div>
            </div>

            <div className="space-y-3">
              {FAQ.map((item, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                  <FAQItem q={item.q} a={item.a} />
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="mt-8 p-6 rounded-2xl text-center"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <p className="text-sm mb-4" style={{ color: G.body }}>Still have questions? Reach our grant support team directly.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:7022747227"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50"
                  style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}>
                  <Phone className="w-4 h-4" style={{ color: G.green }} /> (702) 274-7227
                </a>
                <a href="mailto:grants@riseaxiscapital.com"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-50"
                  style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}>
                  <Mail className="w-4 h-4" style={{ color: G.green }} /> Email Support
                </a>
                <Link to="/apply/chat"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
                  <MessageSquare className="w-4 h-4" /> Ask AI Assistant
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Credentials ──────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.muted }}>Trust & Compliance</div>
            <h2 className="text-2xl font-bold" style={{ color: G.heading }}>Official Credentials</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {CREDENTIALS.map((c, i) => (
              <motion.div key={c.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl transition-all hover:-translate-y-1"
                style={{ background: G.page, border: `1px solid ${G.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                  <c.icon className="w-5 h-5" style={{ color: G.green }} />
                </div>
                <div className="text-sm font-bold mb-0.5" style={{ color: G.heading }}>{c.title}</div>
                <div className="text-[11px]" style={{ color: G.muted }}>{c.sub}</div>
              </motion.div>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: G.page, border: `1px solid ${G.border}` }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: G.body }}>Legal Notice — IRS Compliance</div>
                <p className="text-[11px] leading-relaxed" style={{ color: G.muted }}>
                  RiseAxis Capital is a federally registered 501(c)(3) nonprofit (EIN: 27-0964813) in Washington, DC. All grants comply with federal regulations. Recipients receiving more than $600/year receive IRS Form 1099-MISC by January 31.
                </p>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: G.body }}>Anti-Fraud Statement</div>
                <p className="text-[11px] leading-relaxed" style={{ color: G.muted }}>
                  RiseAxis Capital will NEVER request payment to process a grant. We do not contact applicants via social media or ask for gift cards. Providing false information is a federal offense under 18 U.S.C. § 1001.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden" style={{ background: G.navy }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Green accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(22,163,74,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <Star className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-green-400">Apply Today — Completely Free</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Ready to Submit<br />Your Application?
            </h2>
            <p className="text-base mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Our grant review team processes every submission within 5–10 business days. No fees, no hidden requirements. Approved funds go directly to your bank.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link to="/apply"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all hover:scale-[1.02] hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
                Apply for a Grant <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register"
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                Create Free Account
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {['No application fee', 'Secure & encrypted', 'IRS compliant', 'Direct bank deposit'].map(t => (
                <span key={t} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <CheckCircle2 className="w-3 h-3 text-green-500" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
