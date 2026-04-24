import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

const FOUNDATIONS = [
  {
    initials: 'RWJ', name: 'Robert Wood Johnson Foundation', focus: 'Health & Wellbeing', year: 2021,
    desc: 'Supporting our Medical Expenses Grant program to expand access to healthcare for uninsured individuals nationwide.',
    color: '#2563EB',
  },
  {
    initials: 'AEC', name: 'Annie E. Casey Foundation', focus: 'Children & Families', year: 2020,
    desc: 'Partnering on Emergency Assistance and Education Support programs for at-risk youth and low-income families.',
    color: '#DC2626',
  },
  {
    initials: 'WKK', name: 'W.K. Kellogg Foundation', focus: 'Community Wellbeing', year: 2022,
    desc: 'Funding our Community Development Grant program in underserved rural and urban communities across 12 states.',
    color: '#D97706',
  },
  {
    initials: 'FF', name: 'Ford Foundation', focus: 'Economic Justice', year: 2021,
    desc: 'Supporting our Business Funding Grant program with a focus on minority-owned and women-led small businesses.',
    color: '#7C3AED',
  },
]

const FEDERAL = [
  {
    initials: 'HUD', name: 'U.S. Dept. of Housing & Urban Development', focus: 'Housing Stability',
    desc: 'Program alignment: Emergency Assistance Grant. Coordinated relief for individuals at risk of homelessness.',
    color: '#1E40AF',
  },
  {
    initials: 'HHS', name: 'U.S. Dept. of Health & Human Services', focus: 'Medical & Family Services',
    desc: 'Program alignment: Medical Expenses Grant. Supplementary funding for uninsured and underinsured healthcare recipients.',
    color: '#0F766E',
  },
  {
    initials: 'USDA', name: 'USDA Rural Development', focus: 'Rural Communities',
    desc: 'Program alignment: Community Development Grant. Infrastructure and development support for qualifying rural applicants.',
    color: '#15803D',
  },
]

const CORPORATE = [
  {
    initials: 'WF', name: 'Wells Fargo Foundation', tier: 'Gold', focus: 'Financial Inclusion',
    desc: 'Providing operational support and financial literacy resources for Business Funding Grant applicants.',
    color: '#DC2626', tierColor: '#D97706',
  },
  {
    initials: 'JP', name: 'JPMorgan Chase & Co.', tier: 'Gold', focus: 'Workforce Development',
    desc: 'Sponsoring our Education Support Grant to improve workforce readiness and economic mobility.',
    color: '#1D4ED8', tierColor: '#D97706',
  },
  {
    initials: 'MS', name: 'Microsoft Philanthropies', tier: 'Silver', focus: 'Digital Equity',
    desc: 'Supporting technology access initiatives within our Community Development and Resource programs.',
    color: '#0369A1', tierColor: '#94A3B8',
  },
]

export default function PartnersPage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 60%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.07), transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Coalition of Funders
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Our Partners & Funders
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              Funded by a coalition of federal agencies, private foundations, and corporate partners who share our commitment to accessible, equitable grant funding.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact Strip */}
      <section className="py-12" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Funding Partners', value: '10+', color: G.green },
                { label: 'Federal Agencies', value: '3', color: '#2563EB' },
                { label: 'Private Foundations', value: '4', color: '#7C3AED' },
                { label: 'Corporate Sponsors', value: '3', color: '#D97706' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-6 text-center"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-semibold uppercase tracking-widest" style={{ color: G.muted }}>{s.label}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Foundation Partners */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                Foundation
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Private Foundation Partners</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FOUNDATIONS.map((f, i) => (
              <FadeUp key={f.name} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full flex flex-col"
                  style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold mb-4 shrink-0"
                    style={{ background: f.color }}>
                    {f.initials}
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>{f.name}</div>
                  <div className="text-[11px] font-semibold mb-3 uppercase tracking-wider" style={{ color: f.color }}>
                    {f.focus} · Since {f.year}
                  </div>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: G.body }}>{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Federal Agency Partners */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                Federal
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Federal Agency Partnerships</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEDERAL.map((f, i) => (
              <FadeUp key={f.name} delay={i * 0.07}>
                <div className="rounded-2xl overflow-hidden h-full"
                  style={{ border: `1px solid ${G.border}` }}>
                  <div className="px-6 py-4 flex items-center gap-3"
                    style={{ background: f.color }}>
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {f.initials}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">{f.name}</div>
                      <div className="text-[10px] text-white/60">{f.focus}</div>
                    </div>
                  </div>
                  <div className="p-6" style={{ background: G.white }}>
                    <p className="text-sm leading-relaxed" style={{ color: G.body }}>{f.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Sponsors */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
                style={{ background: '#FFF7ED', color: '#D97706', border: '1px solid #FED7AA' }}>
                Corporate
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Corporate Sponsors</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CORPORATE.map((c, i) => (
              <FadeUp key={c.name} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full flex flex-col"
                  style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: c.color }}>
                      {c.initials}
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                      style={{ background: c.tier === 'Gold' ? '#FEF3C7' : '#F1F5F9', color: c.tierColor }}>
                      {c.tier} Sponsor
                    </span>
                  </div>
                  <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>{c.name}</div>
                  <div className="text-[11px] font-semibold mb-3 uppercase tracking-wider" style={{ color: c.color }}>{c.focus}</div>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: G.body }}>{c.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="py-14" style={{ background: G.navy }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8 text-center">
          <FadeUp>
            <div className="text-4xl text-white/20 font-serif mb-4">"</div>
            <p className="text-lg font-medium leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.75)' }}>
              RiseAxis Capital has demonstrated exceptional grant stewardship and community impact. Their transparent reporting and efficient disbursement model make them one of the most trusted partners in our philanthropic portfolio.
            </p>
            <div className="text-sm font-semibold text-white/50">— Program Officer, Private Foundation Partner</div>
          </FadeUp>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-10" style={{ background: G.navy }}>
              <div className="max-w-2xl">
                <div className="text-[11px] font-bold uppercase tracking-widest mb-3 text-green-400">Partner With Us</div>
                <h2 className="text-2xl font-bold text-white mb-4">Become a Funding Partner</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Join our coalition of mission-aligned funders. We offer named program sponsorships, co-branded impact reports, and direct alignment with our most impactful grant programs.
                </p>
                <ul className="space-y-2 mb-8">
                  {[
                    'Named sponsorship of specific grant programs',
                    'Quarterly impact reports with disbursement data',
                    'Co-branded outreach to your target communities',
                  ].map(p => (
                    <li key={p} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="mailto:partnerships@riseaxiscapital.com"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
                    <Mail className="w-4 h-4" /> partnerships@riseaxiscapital.com
                  </a>
                  <a href="tel:7022747227"
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                    <Phone className="w-4 h-4" /> (702) 274-7227
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
