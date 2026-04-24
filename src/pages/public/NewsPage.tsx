import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, Phone, ExternalLink } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const PRESS_RELEASES = [
  {
    category: 'Press Release',
    date: 'November 14, 2025',
    headline: 'RiseAxis Capital Awards $640,000 in Business Funding Grants to Small Businesses Across 12 States',
    excerpt: 'The nonprofit organization announces its largest single-quarter disbursement round, supporting 29 small businesses and entrepreneurs with capital grants ranging from $5,000 to $50,000.',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
  },
  {
    category: 'Announcement',
    date: 'September 3, 2025',
    headline: 'New AI-Powered Application Portal Reduces Processing Time by 40%, Announces RiseAxis Capital',
    excerpt: 'A redesigned digital grant portal featuring a 24/7 AI assistant has cut average application completion time from 47 minutes to under 28 minutes, with no change in approval standards.',
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
  },
  {
    category: 'Milestone',
    date: 'July 22, 2025',
    headline: 'RiseAxis Capital Surpasses $2 Million Milestone in Total Grant Disbursements',
    excerpt: 'Since its founding in 2019, the Washington, D.C.–based nonprofit has now disbursed over $2 million in direct grants to more than 1,000 individuals, families, and small businesses nationwide.',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
  },
  {
    category: 'Press Release',
    date: 'April 10, 2025',
    headline: 'Emergency Assistance Program Expands Following USDA Rural Development Outreach Partnership',
    excerpt: 'RiseAxis Capital has formalized a joint outreach initiative with USDA Rural Development to extend grant awareness into underserved rural communities, expanding the Emergency Assistance program\'s geographic reach.',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
  },
  {
    category: 'Report',
    date: 'February 1, 2025',
    headline: 'RiseAxis Capital Releases First Annual Transparency Report for Fiscal Year 2024',
    excerpt: 'The organization\'s inaugural annual report details program-by-program disbursement data, financial allocation breakdowns, and recipient outcome statistics, reinforcing its commitment to public accountability.',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
  },
]

const PUBLICATIONS = [
  'The Nonprofit Times',
  'Chronicle of Philanthropy',
  'Washington Business Journal',
  'Community Development Finance',
  'Federal Grants Wire',
  'Nonprofit Quarterly',
]

const QUOTES = [
  {
    quote: 'Our commitment to zero application fees sets us apart from the landscape of grant organizations. Every dollar raised goes back to people in genuine need.',
    name: 'Patricia W.',
    title: 'Executive Director',
  },
  {
    quote: 'Transparency and IRS compliance aren\'t bureaucratic hurdles — they are the foundation of trust with our applicants and the communities we serve.',
    name: 'David L.',
    title: 'Compliance Officer',
  },
  {
    quote: 'The AI assistant has opened access to applicants who previously found long form processes overwhelming. The impact on our application volume has been transformative.',
    name: 'Sandra H.',
    title: 'Grants Manager',
  },
]

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  )
}

export default function NewsPage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Official Press & Media
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              News & Media Center
            </h1>
            <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: G.body }}>
              Official press releases, announcements, and media coverage from RiseAxis Capital. For media inquiries, contact our press team directly.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── As Seen In ───────────────────────────────────── */}
      <section className="py-14" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ background: G.border }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.muted }}>
                Coverage & Recognition
              </span>
              <div className="h-px flex-1" style={{ background: G.border }} />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {PUBLICATIONS.map(pub => (
                <div key={pub} className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                  style={{ background: G.white, border: `1px solid ${G.border}`, color: G.body,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  {pub}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Press releases ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Latest</div>
              <h2 className="text-3xl font-bold" style={{ color: G.heading }}>Press Releases & Announcements</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRESS_RELEASES.map((pr, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <div className="flex flex-col h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: G.white, border: `1px solid ${G.border}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: pr.bg, color: pr.color }}>{pr.category}</span>
                    <span className="text-[11px]" style={{ color: G.muted }}>{pr.date}</span>
                  </div>
                  <h3 className="text-sm font-bold leading-snug mb-3 flex-1" style={{ color: G.heading }}>
                    {pr.headline}
                  </h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: G.body }}>{pr.excerpt}</p>
                  <a href="#"
                    onClick={e => e.preventDefault()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: pr.color }}>
                    Read Full Statement <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull quotes ──────────────────────────────────── */}
      <section className="py-20" style={{ background: G.navy }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(74,222,128,0.8)' }}>
                Leadership Statements
              </div>
              <h2 className="text-2xl font-bold text-white">From Our Leadership</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUOTES.map((q, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="flex flex-col h-full rounded-2xl p-7"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="text-5xl font-black mb-4 leading-none" style={{ color: '#16A34A' }}>"</div>
                  <p className="text-sm leading-relaxed flex-1 mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {q.quote}
                  </p>
                  <div>
                    <div className="text-xs font-bold text-green-400">{q.name}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{q.title}, RiseAxis Capital</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Media contact ────────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-8" style={{ background: G.page, border: `1px solid ${G.border}` }}>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>
                Media Inquiries
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Contact Our Press Team</h2>
              <p className="text-sm mb-6" style={{ color: G.body }}>
                We respond to all verified media inquiries within 1–2 business days. For urgent matters, call our press line directly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <a href="mailto:press@riseaxiscapital.com"
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white"
                  style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <Mail className="w-4 h-4" style={{ color: G.green }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Press Email</div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>press@riseaxiscapital.com</div>
                  </div>
                </a>
                <a href="tel:7022747227"
                  className="flex items-center gap-3 p-4 rounded-xl transition-all hover:bg-white"
                  style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <Phone className="w-4 h-4" style={{ color: G.green }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: G.muted }}>Press Line</div>
                    <div className="text-sm font-semibold" style={{ color: G.heading }}>(702) 274-7227 ext. 3</div>
                  </div>
                </a>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>We Handle Requests For</div>
              <div className="flex flex-wrap gap-2">
                {['Interview Requests', 'Press Kits & Assets', 'Photography Access', 'Speaking Engagements', 'Data & Statistics', 'Executive Bios'].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{ background: G.white, border: `1px solid ${G.border}`, color: G.body }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
