import { motion } from 'framer-motion'
import { Shield, Download, FileText, CheckCircle2, Mail } from 'lucide-react'

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

const DOCUMENTS = [
  { title: 'IRS Form 990', sub: 'Fiscal Year 2024', icon: FileText, note: 'Annual return of organization exempt from income tax' },
  { title: 'Articles of Incorporation', sub: 'Filed 2019 · D.C.', icon: FileText, note: 'Original charter establishing the nonprofit corporation' },
  { title: 'Conflict of Interest Policy', sub: 'Revised Jan 2025', icon: Shield, note: 'Board and staff conflict of interest disclosure policy' },
  { title: 'Whistleblower Policy', sub: 'Adopted Mar 2023', icon: Shield, note: 'Protections for reporting financial or ethical misconduct' },
]

const MEETINGS = [
  { quarter: 'Q1 2025', date: 'March 14, 2025',  location: 'Virtual via Zoom', status: 'Completed' },
  { quarter: 'Q2 2025', date: 'June 13, 2025',   location: 'Virtual via Zoom', status: 'Completed' },
  { quarter: 'Q3 2025', date: 'September 12, 2025', location: 'Virtual via Zoom', status: 'Completed' },
  { quarter: 'Q4 2025', date: 'December 5, 2025', location: 'Virtual via Zoom', status: 'Scheduled' },
]

const STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','MD','MA','MI','MN','MS','MO','MT','NE','NV','NJ',
  'NM','NY','NC','OH','OR','PA','TN','TX','VA','WA','WI',
]

const POLICIES = [
  {
    title: 'Conflict of Interest Policy',
    color: '#2563EB',
    summary: 'All board members, officers, and key employees must annually disclose any actual or potential conflicts of interest. Interested parties recuse themselves from related decisions.',
  },
  {
    title: 'Whistleblower Protection',
    color: '#16A34A',
    summary: 'Any person may report suspected violations of law, financial irregularities, or ethical misconduct without fear of retaliation. Reports are investigated by the Audit Committee.',
  },
  {
    title: 'Non-Discrimination Policy',
    color: '#7C3AED',
    summary: 'RiseAxis Capital does not discriminate on the basis of race, color, religion, sex, national origin, age, disability, or any other protected characteristic in its grant programs.',
  },
]

function simulateDownload(filename: string) {
  const content = `RiseAxis Capital — ${filename}\n\nThis document is available upon request.\nContact governance@riseaxiscapital.com for the complete version.\n\nEIN: 27-0964813\n501(c)(3) Certified Nonprofit`
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.replace(/\s+/g, '_') + '.txt'
  a.click()
  URL.revokeObjectURL(url)
}

export default function GovernancePage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 60%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.08), transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <Shield className="w-3 h-3" style={{ color: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                IRS-Certified Nonprofit
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Governance & Transparency
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              RiseAxis Capital operates with full transparency. Explore our governing documents, financial disclosures, board meeting records, and compliance policies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Financial Overview */}
      <section className="py-14" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Disbursed', value: '$2.4M', sub: 'FY2019–2025', color: G.green },
                { label: 'Operating Overhead', value: '12%', sub: 'Below 15% industry benchmark', color: '#2563EB' },
                { label: 'Fundraising Efficiency', value: '94%', sub: 'Of donated funds reach recipients', color: '#7C3AED' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-7 text-center"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="text-4xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-sm font-semibold mb-1" style={{ color: G.heading }}>{s.label}</div>
                  <div className="text-xs" style={{ color: G.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Key Documents */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Key Governing Documents</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>Available upon request. Click any document to download a summary sheet.</p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DOCUMENTS.map((doc, i) => (
              <FadeUp key={doc.title} delay={i * 0.07}>
                <div className="rounded-2xl p-6 h-full flex flex-col"
                  style={{ background: G.navy, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)' }}>
                    <doc.icon className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{doc.title}</div>
                  <div className="text-[11px] mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{doc.sub}</div>
                  <p className="text-xs leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{doc.note}</p>
                  <button
                    onClick={() => simulateDownload(doc.title)}
                    className="mt-5 flex items-center gap-2 text-xs font-semibold text-green-400 hover:text-green-300 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download Summary
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Board Meetings */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Board Meeting Schedule</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>The Board of Directors meets quarterly. Minutes available upon written request.</p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: G.navy }}>
                    {['Quarter', 'Date', 'Location', 'Status'].map(h => (
                      <th key={h} className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/60">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEETINGS.map((m, i) => (
                    <tr key={m.quarter} style={{ background: i % 2 === 0 ? G.white : G.page, borderTop: `1px solid ${G.border}` }}>
                      <td className="px-6 py-4 font-semibold" style={{ color: G.heading }}>{m.quarter}</td>
                      <td className="px-6 py-4" style={{ color: G.body }}>{m.date}</td>
                      <td className="px-6 py-4" style={{ color: G.body }}>{m.location}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={m.status === 'Completed'
                            ? { background: G.greenLt, color: G.green, border: `1px solid ${G.greenBd}` }
                            : { background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
                          {m.status === 'Completed' && <CheckCircle2 className="w-3 h-3" />}
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Audit & Compliance */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Audit & Compliance</h2>
          </FadeUp>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeUp delay={0.05}>
              <div className="rounded-2xl p-8 h-full" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: G.green }} />
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: G.heading }}>Independent Audit — FY2024</div>
                    <div className="text-xs" style={{ color: G.muted }}>Conducted by BDO USA LLP</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>
                  Our financial statements for fiscal year 2024 were audited by BDO USA LLP, a nationally recognized public accounting firm. The audit found <strong>no material weaknesses</strong> and confirmed that our financial statements present fairly, in all material respects, the financial position of the organization.
                </p>
                <div className="rounded-xl px-4 py-3 text-xs font-semibold"
                  style={{ background: G.greenLt, color: G.green, border: `1px solid ${G.greenBd}` }}>
                  ✓ Clean audit opinion issued — November 2024
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="rounded-2xl p-8 h-full" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                <div className="text-sm font-bold mb-2" style={{ color: G.heading }}>State Charity Registrations</div>
                <p className="text-xs mb-5" style={{ color: G.muted }}>
                  Registered to solicit charitable contributions in {STATES.length} states and the District of Columbia.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STATES.map(s => (
                    <span key={s} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                      style={{ background: G.page, color: G.body, border: `1px solid ${G.border}` }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Ethics Policies */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Ethics & Conduct Policies</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>Full policy documents available upon written request to governance@riseaxiscapital.com</p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {POLICIES.map((p, i) => (
              <FadeUp key={p.title} delay={i * 0.07}>
                <div className="rounded-2xl p-7 h-full" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-1.5 h-8 rounded-full mb-5" style={{ background: p.color }} />
                  <div className="text-sm font-bold mb-3" style={{ color: G.heading }}>{p.title}</div>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: G.body }}>{p.summary}</p>
                  <button
                    onClick={() => simulateDownload(p.title)}
                    className="text-xs font-semibold flex items-center gap-1.5 hover:opacity-70 transition-opacity"
                    style={{ color: p.color }}>
                    <Download className="w-3 h-3" /> Full Policy PDF
                  </button>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Records Request */}
      <section className="py-14" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-6"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)' }}>
                  <Mail className="w-5 h-5 text-yellow-500" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>Request Governance Records</div>
                  <p className="text-xs leading-relaxed" style={{ color: G.body }}>
                    To request Form 990, board meeting minutes, audited financial statements, or any other governance records, email{' '}
                    <a href="mailto:governance@riseaxiscapital.com" className="font-semibold underline" style={{ color: '#D97706' }}>
                      governance@riseaxiscapital.com
                    </a>
                    . Requests are typically fulfilled within 5 business days. Grants over $600 are reported to the IRS per 26 U.S.C. § 6041.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
