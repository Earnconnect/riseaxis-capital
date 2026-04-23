import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Award, Users, Heart, CheckCircle2, ArrowRight,
  GraduationCap, HeartPulse, Briefcase, Building2,
  Star, Globe, Phone,
} from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const STATS = [
  { value: '$2.4M+',   label: 'Grants Disbursed',       icon: Award,   color: '#16A34A', bg: '#F0FDF4' },
  { value: '1,200+',   label: 'Families Helped',         icon: Users,   color: '#2563EB', bg: '#EFF6FF' },
  { value: '98%',      label: 'Satisfaction Rate',       icon: Star,    color: '#D97706', bg: '#FFFBEB' },
  { value: '6',        label: 'Active Programs',         icon: Globe,   color: '#7C3AED', bg: '#F5F3FF' },
]

const PROGRAMS = [
  { icon: Shield,        label: 'Emergency Assistance',   color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
    desc: 'Rapid response funding for housing, utilities, and safety emergencies up to $10,000.' },
  { icon: GraduationCap, label: 'Education Support',      color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
    desc: 'Tuition, books, and vocational training for eligible students up to $15,000.' },
  { icon: HeartPulse,    label: 'Medical Expenses',       color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8',
    desc: 'Medical bills, treatment, and prescription coverage up to $25,000.' },
  { icon: Users,         label: 'Community Development',  color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    desc: 'Infrastructure and social initiative grants for community organizations up to $25,000.' },
  { icon: Briefcase,     label: 'Business Funding',       color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    desc: 'Capital and expansion grants for small businesses and entrepreneurs up to $50,000.' },
  { icon: Building2,     label: 'Other Qualifying Needs', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    desc: 'Flexible funding for unique hardships not covered by our standard programs.' },
]

const TEAM_VALUES = [
  { icon: Heart,        title: 'Compassion',    desc: 'Every application is reviewed with care for the human story behind it.' },
  { icon: Shield,       title: 'Integrity',     desc: 'Transparent processes, honest communication, and ethical stewardship of funds.' },
  { icon: CheckCircle2, title: 'Accountability', desc: 'Rigorous compliance with IRS, GDPR, and federal nonprofit regulations.' },
  { icon: Star,         title: 'Speed',         desc: 'Decisions within 5–10 business days because financial hardship can\'t wait.' },
]

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  )
}

export default function AboutPage() {
  return (
    <div style={{ background: G.page }}>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                  501(c)(3) Nonprofit · EIN 27-0964813
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight mb-6"
                style={{ color: G.heading }}>
                Funding the Future of<br />
                <span style={{
                  background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  Every American Family
                </span>
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: G.body }}>
                RiseAxis Capital is a Washington, D.C.–based 501(c)(3) nonprofit dedicated to closing the financial gap for
                individuals, families, businesses, and communities across the United States. Since 2019, we've delivered
                millions in direct grant funding — no loans, no fees, no repayment.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/apply"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.28)' }}>
                  Apply for Funding <ArrowRight size={16} />
                </Link>
                <Link to="/contact"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all hover:bg-slate-100"
                  style={{ background: G.white, border: `1px solid ${G.border}`, color: G.heading, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  Contact Us
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.07}>
                <div className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: s.bg }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: G.heading }}>{s.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: G.muted }}>{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <FadeUp>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: G.green }}>Our Mission</div>
                <h2 className="text-3xl font-bold tracking-tight mb-5" style={{ color: G.heading }}>
                  Breaking Down Financial Barriers Since 2019
                </h2>
                <p className="text-base leading-relaxed mb-5" style={{ color: G.body }}>
                  We believe that a single financial setback shouldn't determine a person's future. RiseAxis Capital
                  was founded to bridge the gap between need and opportunity — providing direct, unrestricted grant
                  funding to Americans facing genuine hardship.
                </p>
                <p className="text-base leading-relaxed mb-8" style={{ color: G.body }}>
                  Unlike loans, our grants never require repayment. Every dollar we disburse goes directly to
                  recipients via ACH bank transfer, typically within 2–3 business days of approval.
                </p>
                <div className="space-y-3">
                  {[
                    'No application fees — ever',
                    'ACH direct deposit to your bank',
                    'IRS 1099-MISC compliance for grants over $600',
                    'Review decisions within 5–10 business days',
                    'Six specialized programs for diverse needs',
                  ].map(item => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={16} style={{ color: G.green, flexShrink: 0 }} />
                      <span className="text-sm" style={{ color: G.body }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-3xl p-8"
                style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <img src="/logo.png" alt="RiseAxis Capital" className="w-10 h-10 object-cover rounded-xl" />
                  <div>
                    <div className="font-bold text-white">RiseAxis Capital</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest">Funding Program</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Legal Name',    value: 'RiseAxis Capital Funding Program' },
                    { label: 'EIN',           value: '27-0964813' },
                    { label: 'Status',        value: '501(c)(3) Nonprofit' },
                    { label: 'Founded',       value: '2019' },
                    { label: 'Jurisdiction',  value: 'Washington, DC' },
                    { label: 'Disbursement',  value: 'ACH Direct Transfer' },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2.5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <span className="text-xs font-medium text-white/40">{row.label}</span>
                      <span className="text-sm font-semibold text-white">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Our Values</div>
              <h2 className="text-3xl font-bold tracking-tight" style={{ color: G.heading }}>What Guides Everything We Do</h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM_VALUES.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.08}>
                <div className="rounded-2xl p-6 h-full transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <v.icon size={18} style={{ color: G.green }} />
                  </div>
                  <h3 className="text-base font-bold mb-2" style={{ color: G.heading }}>{v.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programs ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Grant Programs</div>
              <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ color: G.heading }}>Six Ways We Can Help</h2>
              <p className="text-base max-w-xl mx-auto" style={{ color: G.body }}>
                Every program is designed for a specific type of need, with tailored eligibility, documentation requirements, and funding ranges.
              </p>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROGRAMS.map((p, i) => (
              <FadeUp key={p.label} delay={i * 0.06}>
                <div className="rounded-2xl p-5 h-full transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: G.white, border: `1px solid ${p.border}` }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                      <p.icon size={16} style={{ color: p.color }} />
                    </div>
                    <h3 className="text-sm font-bold leading-tight pt-1" style={{ color: G.heading }}>{p.label}</h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{p.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2}>
            <div className="text-center mt-10">
              <Link to="/programs"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.25)' }}>
                View Full Program Details <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────── */}
      <section className="py-16 mx-5 lg:mx-8 mb-16 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
        <div className="max-w-3xl mx-auto px-8 text-center">
          <FadeUp>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Apply?</h2>
            <p className="text-white/60 text-base leading-relaxed mb-8">
              Start your free application today. No fees, no obligations — just straightforward funding for those who qualify.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/apply"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' }}>
                Apply for a Grant <ArrowRight size={16} />
              </Link>
              <a href="tel:7022747227"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}>
                <Phone size={16} /> (702) 274-7227
              </a>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
