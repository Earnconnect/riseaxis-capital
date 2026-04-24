import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight, CheckCircle2, Quote, Award, Users, Star, Globe,
  TrendingUp, MapPin, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const PROGRAM_DATA = [
  { name: 'Emergency',  short: 'Emergency',  amount: 380000, color: '#DC2626' },
  { name: 'Education',  short: 'Education',  amount: 420000, color: '#2563EB' },
  { name: 'Medical',    short: 'Medical',    amount: 610000, color: '#DB2777' },
  { name: 'Community',  short: 'Community',  amount: 290000, color: '#16A34A' },
  { name: 'Business',   short: 'Business',   amount: 640000, color: '#7C3AED' },
  { name: 'Other',      short: 'Other',      amount: 60000,  color: '#D97706' },
]

const STATES = [
  'AL','AR','AZ','CA','CO','CT','DC','FL','GA','HI',
  'IA','IL','IN','KS','KY','LA','MD','MI','MN','MO',
  'MS','NC','NE','NJ','NM','NV','NY','OH','OK','OR',
  'PA','PR','TN','TX','VA','WA',
]

const TESTIMONIALS = [
  { quote: "I was behind on rent with a sick child and no backup. RiseAxis approved my Emergency Assistance grant in 4 days. I honestly don't know what we would have done without them.", name: 'Maria T.', program: 'Emergency Assistance', amount: '$8,500', initials: 'MT', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { quote: "The Business Funding grant gave my food truck the push it needed to expand. The process was completely transparent — no hidden fees, no pressure. Very professional.", name: 'James R.', program: 'Business Funding', amount: '$22,000', initials: 'JR', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  { quote: "I used the AI assistant at midnight and had my full application submitted before 1am. Approval came 6 days later. The whole experience felt secure and legitimate.", name: 'Danielle K.', program: 'Education Support', amount: '$12,500', initials: 'DK', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  { quote: "After my surgery the bills were impossible. RiseAxis covered a major portion and treated me with dignity throughout. I referred three people in my community already.", name: 'Robert M.', program: 'Medical Expenses', amount: '$19,000', initials: 'RM', color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8' },
  { quote: "The community development grant allowed our neighborhood association to install lighting and after-school programming. Three months later crime was down 40%.", name: 'Angela M.', program: 'Community Development', amount: '$22,000', initials: 'AM', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
]

const MILESTONES = [
  { date: 'January 2025', text: 'Launched redesigned digital application portal with AI-powered grant assistant.' },
  { date: 'March 2025',   text: 'Reached $1 million milestone in cumulative grant disbursements since inception.' },
  { date: 'May 2025',     text: 'Expanded Business Funding program maximum award to $50,000 for qualifying entities.' },
  { date: 'August 2025',  text: 'Formed outreach partnership with USDA Rural Development office for joint community engagement.' },
  { date: 'November 2025',text: 'Processed our 500th successful application, disbursing over $2.4M in total grants.' },
]

const FUND_SOURCES = [
  { name: 'Federal Grants',      value: 45, color: '#2563EB' },
  { name: 'Private Foundations', value: 30, color: '#16A34A' },
  { name: 'Corporate Partners',  value: 18, color: '#7C3AED' },
  { name: 'Individual Donors',   value: 7,  color: '#D97706' },
]

const FUND_ALLOCATION = [
  { name: 'Program Disbursements', value: 78, color: '#16A34A' },
  { name: 'Administrative',        value: 12, color: '#2563EB' },
  { name: 'Outreach & Compliance', value: 10, color: '#D97706' },
]

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  )
}

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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-sm shadow-lg" style={{ background: G.white, border: `1px solid ${G.border}` }}>
        <div className="font-bold mb-1" style={{ color: G.heading }}>{payload[0].payload.name}</div>
        <div style={{ color: G.green }}>${(payload[0].value / 1000).toFixed(0)}K disbursed</div>
      </div>
    )
  }
  return null
}

export default function ImpactPage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
                style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                  2025 Annual Impact Report
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-[1.08] tracking-tight" style={{ color: G.heading }}>
                Measuring the<br />
                <span style={{
                  background: 'linear-gradient(135deg, #16A34A 0%, #2563EB 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Difference We Make</span>
              </h1>
              <p className="text-base leading-relaxed mb-3" style={{ color: G.body }}>
                Every grant we issue represents a family stabilized, a business launched, or a student empowered. This report reflects our cumulative impact through December 31, 2025.
              </p>
              <p className="text-xs" style={{ color: G.muted }}>
                All statistics reflect cumulative program activity through December 31, 2025. Data verified by independent auditors.
              </p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-3xl p-8" style={{ background: G.navy }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  FY2025 Summary
                </div>
                {[
                  { label: 'Total Disbursed',    value: '$2.4M+' },
                  { label: 'Grant Recipients',   value: '1,200+' },
                  { label: 'Programs Active',    value: '6' },
                  { label: 'States Reached',     value: '36' },
                  { label: 'Avg Decision Time',  value: '7 Days' },
                  { label: 'Satisfaction Rate',  value: '98%' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                    <span className="text-base font-bold text-white">{row.value}</span>
                  </div>
                ))}
                <p className="text-[10px] mt-5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  501(c)(3) · EIN: 27-0964813 · Washington, DC
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award,  label: 'Total Disbursed',      sub: 'All programs',           to: 2400, prefix: '$', suffix: 'K+', color: '#16A34A', bg: '#F0FDF4' },
              { icon: Users,  label: 'Grant Recipients',      sub: 'Individuals & families', to: 1200, prefix: '',  suffix: '+',  color: '#2563EB', bg: '#EFF6FF' },
              { icon: Star,   label: 'Satisfaction Rate',     sub: 'Post-survey results',    to: 98,   prefix: '',  suffix: '%',  color: '#D97706', bg: '#FFFBEB' },
              { icon: Globe,  label: 'States Reached',        sub: 'Including DC & PR',      to: 36,   prefix: '',  suffix: '',   color: '#7C3AED', bg: '#F5F3FF' },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.07}>
                <div className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: s.bg }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: G.heading }}>
                    <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: s.color }}>{s.label}</div>
                  <div className="text-[11px]" style={{ color: G.muted }}>{s.sub}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Program distribution ─────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Breakdown</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Grants by Program</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: G.body }}>
                Total disbursements across all six grant programs in FY2025.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl p-6 mb-8" style={{ background: G.white, border: `1px solid ${G.border}` }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={PROGRAM_DATA} barCategoryGap="30%">
                  <XAxis dataKey="short" tick={{ fontSize: 12, fill: G.muted }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: G.muted }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {PROGRAM_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {PROGRAM_DATA.map(p => (
                <div key={p.name} className="rounded-xl p-4 text-center" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: p.color }} />
                  <div className="text-xs font-bold mb-1" style={{ color: G.heading }}>{p.name}</div>
                  <div className="text-sm font-bold" style={{ color: p.color }}>${(p.amount / 1000).toFixed(0)}K</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Geographic reach ─────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-10">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Geographic Impact</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Program Reach: 36 States</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: G.body }}>
                Applicants must be U.S. residents. Puerto Rico and Washington, D.C. residents are also eligible.
              </p>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl p-8" style={{ background: G.page, border: `1px solid ${G.border}` }}>
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="w-4 h-4" style={{ color: G.green }} />
                <span className="text-sm font-semibold" style={{ color: G.heading }}>States & territories with active recipients</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STATES.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}`, color: G.green }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Recipient Stories</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Real People, Real Impact</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 0.07}>
                <div className="flex flex-col rounded-2xl p-6 h-full transition-all hover:-translate-y-1"
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
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.2}>
            <p className="text-center text-[11px] mt-6" style={{ color: G.muted }}>
              Names and identifying details changed to protect recipient privacy. All accounts are voluntary.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Milestones ───────────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Year in Review</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>2025 Milestones</h2>
            </div>
          </FadeUp>

          <div className="relative pl-6">
            <div className="absolute left-0 top-2 bottom-2 w-0.5" style={{ background: G.border }} />
            {MILESTONES.map((m, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="relative mb-8 last:mb-0">
                  <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ background: G.greenLt, borderColor: G.green }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: G.green }} />
                    <span className="text-xs font-bold" style={{ color: G.green }}>{m.date}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{m.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Financial transparency ───────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Transparency</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Financial Accountability</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: G.body }}>
                We are committed to full financial transparency. Request our complete Form 990 at any time.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Fund Sources', data: FUND_SOURCES, note: 'Where our operating capital comes from.' },
              { title: 'Fund Allocation', data: FUND_ALLOCATION, note: '78 cents of every dollar goes directly to grant disbursements.' },
            ].map(card => (
              <FadeUp key={card.title}>
                <div className="rounded-2xl p-7" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: G.muted }}>Financial Data</div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: G.heading }}>{card.title}</h3>
                  <p className="text-xs mb-6" style={{ color: G.muted }}>{card.note}</p>
                  <div className="space-y-3">
                    {card.data.map(d => (
                      <div key={d.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: G.body }}>{d.name}</span>
                          <span className="font-bold" style={{ color: G.heading }}>{d.value}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: G.page }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} whileInView={{ width: `${d.value}%` }}
                            viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{ background: d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] mt-5" style={{ color: G.muted }}>
                    Request Form 990:{' '}
                    <a href="mailto:governance@riseaxiscapital.com" className="underline" style={{ color: G.green }}>
                      governance@riseaxiscapital.com
                    </a>
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-16 mx-5 lg:mx-8 mb-16 rounded-3xl"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
        <div className="max-w-3xl mx-auto px-8 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)' }}>
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-green-400">Join Our Impact</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Become a Success Story?</h2>
            <p className="text-white/60 text-base mb-8">
              Apply today and join the 1,200+ individuals and families we've helped across 36 states.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/apply"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' }}>
                Apply for a Grant <ArrowRight size={16} />
              </Link>
              <Link to="/programs"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
                View Programs <ArrowRight size={16} />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
