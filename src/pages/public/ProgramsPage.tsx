import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, GraduationCap, HeartPulse, Users, Briefcase,
  Building2, ArrowRight, CheckCircle2, FileText, MessageSquare,
  ChevronRight, ChevronLeft,
} from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const programs = [
  {
    id: 'emergency', icon: Shield, photo: 'housing.webp',
    title: 'Emergency Assistance Grant', range: '$5,000 – $10,000',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', accentBg: '#FEE2E2',
    description: 'Immediate financial relief for individuals and families facing urgent crises that threaten housing, utilities, or immediate safety.',
    eligibility: ['Housing instability or risk of eviction', 'Utility disconnection notices', 'Natural disaster impact', 'Sudden loss of primary income', 'Emergency medical bills under $10,000'],
    timeline: '3–5 business days',
    requirements: ['Proof of emergency circumstance', 'Government-issued photo ID', 'Proof of current address', 'U.S. bank account information'],
  },
  {
    id: 'education', icon: GraduationCap, photo: 'classroom.webp',
    title: 'Education Support Grant', range: '$8,000 – $15,000',
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', accentBg: '#DBEAFE',
    description: 'Funding for tuition, certification programs, books, and education-related expenses for eligible learners at all levels.',
    eligibility: ['Enrolled in accredited institution', 'Pursuing vocational certification', 'Continuing education programs', 'Professional development courses', 'Graduate-level studies'],
    timeline: '7–10 business days',
    requirements: ['Enrollment verification letter', 'Tuition invoices or cost estimates', 'Government-issued photo ID', 'Academic records or transcripts'],
  },
  {
    id: 'medical', icon: HeartPulse, photo: 'healthcare.webp',
    title: 'Medical Expenses Grant', range: '$10,000 – $25,000',
    color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8', accentBg: '#FCE7F3',
    description: 'Coverage for medical bills, ongoing treatments, prescriptions, and healthcare costs for uninsured or underinsured individuals.',
    eligibility: ['Outstanding hospital or medical bills', 'Ongoing cancer or chronic illness treatment', 'Prescription medication costs', 'Medical equipment and devices', 'Mental health treatment programs'],
    timeline: '5–7 business days',
    requirements: ['Medical invoices or outstanding bills', 'Healthcare provider documentation', 'Government-issued photo ID', 'Insurance information (if applicable)'],
  },
  {
    id: 'community', icon: Users, photo: 'volunteers.webp',
    title: 'Community Development Grant', range: '$15,000 – $25,000',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', accentBg: '#DCFCE7',
    description: 'Funding for organizations and individuals driving positive community change through programs, facilities, and social initiatives.',
    eligibility: ['Nonprofit and community organizations', 'Local infrastructure improvement', 'Youth development programs', 'Senior care and services', 'Neighborhood revitalization projects'],
    timeline: '10–14 business days',
    requirements: ['Project proposal and detailed budget', 'Organization documentation', 'Community impact statement', 'Leadership identification'],
  },
  {
    id: 'business', icon: Briefcase, photo: 'business.webp',
    title: 'Business Funding Grant', range: '$5,000 – $50,000',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', accentBg: '#EDE9FE',
    description: 'Start-up capital, operational grants, and expansion funding for small businesses and entrepreneurs in qualifying industries.',
    eligibility: ['Small businesses (under 500 employees)', 'Startups under 3 years old', 'Minority and women-owned businesses', 'Businesses in underserved communities', 'Social enterprise and cooperative models'],
    timeline: '10–15 business days',
    requirements: ['Business plan and financial projections', 'Financial statements (last 2 years)', 'Business registration documents', 'Owner government-issued ID'],
  },
  {
    id: 'other', icon: Building2, photo: 'general.webp',
    title: 'Other Qualifying Needs', range: 'Custom Amount',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', accentBg: '#FEF3C7',
    description: 'Tailored grants for unique financial circumstances not specifically covered by our standard program categories.',
    eligibility: ['Unique financial circumstances', 'Disaster relief not covered by FEMA', 'Legal aid and court-related costs', 'Transitional housing assistance', 'Disability-related accommodations'],
    timeline: '7–14 business days',
    requirements: ['Detailed written explanation of need', 'Supporting documentation or evidence', 'Government-issued photo ID', 'Financial disclosure statement'],
  },
]

const QUESTIONS = [
  {
    q: 'What is your primary need?',
    options: [
      { label: 'Emergency Relief (rent, utilities, housing)', ids: ['emergency'] },
      { label: 'Education or Vocational Training', ids: ['education'] },
      { label: 'Medical or Healthcare Expenses', ids: ['medical'] },
      { label: 'Community or Organization Project', ids: ['community'] },
      { label: 'Business Start-up or Expansion', ids: ['business'] },
      { label: 'Other / Multiple Needs', ids: ['other', 'emergency', 'education'] },
    ],
  },
  {
    q: 'What is your household income range?',
    options: [
      { label: 'Under $30,000 per year', ids: ['emergency', 'education', 'medical', 'community', 'business', 'other'] },
      { label: '$30,000 – $60,000 per year', ids: ['education', 'medical', 'community', 'business', 'other'] },
      { label: '$60,000 – $100,000 per year', ids: ['community', 'business'] },
      { label: 'Over $100,000 per year', ids: [] },
    ],
  },
  {
    q: 'What is your U.S. residency status?',
    options: [
      { label: 'U.S. Citizen', ids: ['emergency', 'education', 'medical', 'community', 'business', 'other'] },
      { label: 'Lawful Permanent Resident (Green Card)', ids: ['emergency', 'education', 'medical', 'community', 'business', 'other'] },
      { label: 'Other / Non-Immigrant Visa', ids: [] },
    ],
  },
  {
    q: 'Have you received a grant from us before?',
    options: [
      { label: 'No, first-time applicant', ids: ['emergency', 'education', 'medical', 'community', 'business', 'other'] },
      { label: 'Yes, more than 12 months ago', ids: ['emergency', 'education', 'medical', 'community', 'business', 'other'] },
      { label: 'Yes, within the last 12 months', ids: [] },
    ],
  },
]

const COMPARE_ROWS = [
  { label: 'Max Grant Amount', values: ['$10,000', '$15,000', '$25,000', '$25,000', '$50,000', 'Custom'] },
  { label: 'Eligibility', values: ['Individuals & Families', 'Students & Learners', 'Uninsured / Underinsured', 'Nonprofits & Orgs', 'Small Businesses', 'Unique Circumstances'] },
  { label: 'Review Time', values: ['3–5 days', '7–10 days', '5–7 days', '10–14 days', '10–15 days', '7–14 days'] },
  { label: 'Disbursement', values: ['ACH Direct Deposit', 'ACH Direct Deposit', 'ACH Direct Deposit', 'ACH Direct Deposit', 'ACH Direct Deposit', 'ACH Direct Deposit'] },
  { label: 'Recurring Eligible', values: ['Yes (12 mo wait)', 'Yes (12 mo wait)', 'Yes (12 mo wait)', 'Yes (12 mo wait)', 'Yes (12 mo wait)', 'Case-by-case'] },
  { label: 'Income Limit', values: ['300% FPL', '300% FPL', '300% FPL', 'None', 'None', 'Reviewed'] },
]

function EligibilityQuiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [result, setResult] = useState<string[] | null>(null)
  const [direction, setDirection] = useState(1)

  function choose(optionIdx: number) {
    const newAnswers = [...answers.slice(0, step), optionIdx]
    setAnswers(newAnswers)
    if (step < QUESTIONS.length - 1) {
      setDirection(1)
      setStep(step + 1)
    } else {
      // Intersect all selected ids
      let matched = new Set(QUESTIONS[0].options[newAnswers[0]].ids)
      for (let i = 1; i < QUESTIONS.length; i++) {
        const ids = new Set(QUESTIONS[i].options[newAnswers[i]].ids)
        matched = new Set([...matched].filter(id => ids.has(id)))
      }
      setResult([...matched])
    }
  }

  function back() {
    if (step > 0) {
      setDirection(-1)
      setStep(step - 1)
      setAnswers(answers.slice(0, step - 1))
    }
  }

  function reset() {
    setStep(0)
    setAnswers([])
    setResult(null)
    setDirection(1)
  }

  const progress = ((step) / QUESTIONS.length) * 100

  return (
    <div className="py-16" style={{ background: G.white }}>
      <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="lg:w-2/5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>Eligibility Checker</span>
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: G.heading }}>Find Your Program</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>
              Answer 4 quick questions and we'll identify which grant programs you may be eligible for — before you start a full application.
            </p>
            <p className="text-xs" style={{ color: G.muted }}>
              This tool provides a preliminary match only. Final eligibility is determined during the full application review.
            </p>
          </div>
          <div className="lg:w-3/5 w-full">
            {result !== null ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl p-8" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                {result.length > 0 ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5" style={{ color: G.green }} />
                      <span className="text-sm font-bold" style={{ color: G.green }}>You may qualify for {result.length} program{result.length > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs mb-5" style={{ color: G.muted }}>Based on your answers. Submit a full application to confirm eligibility.</p>
                    <div className="space-y-3 mb-6">
                      {programs.filter(p => result.includes(p.id)).map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 rounded-xl"
                          style={{ background: G.white, border: `1px solid ${G.border}` }}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                              <p.icon className="w-4 h-4" style={{ color: p.color }} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold" style={{ color: G.heading }}>{p.title}</div>
                              <div className="text-xs" style={{ color: p.color }}>{p.range}</div>
                            </div>
                          </div>
                          <Link to="/apply"
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                            style={{ background: p.color }}>
                            Apply <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-3">🤔</div>
                    <div className="text-sm font-bold mb-2" style={{ color: G.heading }}>No automatic match found</div>
                    <p className="text-xs mb-5" style={{ color: G.muted }}>
                      Your answers didn't match our standard criteria, but you may still qualify. Contact us for a personal review.
                    </p>
                    <a href="mailto:grants@riseaxiscapital.com"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                      style={{ background: G.navy }}>
                      Contact Our Grants Team
                    </a>
                  </div>
                )}
                <button onClick={reset} className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: G.muted }}>
                  ← Start Over
                </button>
              </motion.div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                {/* Progress bar */}
                <div className="h-1.5 w-full" style={{ background: G.border }}>
                  <motion.div className="h-full rounded-full" style={{ background: G.green }}
                    animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
                </div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                      style={{ background: G.greenLt, color: G.green, border: `1px solid ${G.greenBd}` }}>
                      Question {step + 1} of {QUESTIONS.length}
                    </span>
                    <Link to="#programs" className="text-xs" style={{ color: G.muted }}>
                      Skip quiz ↓
                    </Link>
                  </div>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -30 }}
                      transition={{ duration: 0.2 }}>
                      <div className="text-base font-bold mb-5" style={{ color: G.heading }}>
                        {QUESTIONS[step].q}
                      </div>
                      <div className="space-y-2">
                        {QUESTIONS[step].options.map((opt, i) => (
                          <button key={i} onClick={() => choose(i)}
                            className="w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all hover:border-green-400 hover:bg-green-50"
                            style={{ background: G.white, border: `1px solid ${G.border}`, color: G.body }}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                  {step > 0 && (
                    <button onClick={back}
                      className="mt-5 flex items-center gap-1.5 text-xs font-semibold hover:opacity-70 transition-opacity"
                      style={{ color: G.muted }}>
                      <ChevronLeft className="w-3.5 h-3.5" /> Back
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProgramsPage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* ── Hero ─── */}
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
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                All Programs Currently Open
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Grant Funding Programs
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              Six distinct programs covering a wide range of financial needs. Each has defined eligibility criteria, award ranges, and processing timelines.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Eligibility Quiz ─── */}
      <EligibilityQuiz />

      {/* ── Programs list ─── */}
      <section id="programs" className="pb-20 pt-8">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 space-y-5">
          {programs.map((prog, i) => (
            <motion.div
              key={prog.id} id={prog.id}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{ background: G.white, border: `1px solid ${G.border}`,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
              }}>
              <div className="flex flex-col lg:flex-row">

                {/* Photo panel */}
                <div className="relative lg:w-64 shrink-0 overflow-hidden"
                  style={{ minHeight: '200px' }}>
                  <img src={`/${prog.photo}`} alt={prog.title}
                    className="absolute inset-0 w-full h-full object-cover object-center" />
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 100%)` }} />
                  <div className="absolute inset-0"
                    style={{ borderRight: `4px solid ${prog.color}` }} />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: prog.bg, border: `1px solid ${prog.border}` }}>
                        <prog.icon className="w-5 h-5" style={{ color: prog.color }} />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.9)', color: prog.color }}>Open</span>
                    </div>
                    <div className="text-sm font-bold text-white leading-tight">{prog.title}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: prog.color }}>{prog.range}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col lg:flex-row gap-8 flex-1 p-7 md:p-8">

                {/* Left — info */}
                <div className="lg:w-2/5">
                  <h2 className="text-xl font-bold mb-2" style={{ color: G.heading }}>{prog.title}</h2>
                  <div className="text-base font-bold mb-3" style={{ color: prog.color }}>{prog.range}</div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>{prog.description}</p>

                  <div className="flex items-center gap-2 text-xs mb-6">
                    <span className="font-bold uppercase tracking-wide" style={{ color: G.muted }}>Processing:</span>
                    <span className="font-semibold" style={{ color: prog.color }}>{prog.timeline}</span>
                  </div>

                  <Link to="/apply"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
                    style={{ background: `linear-gradient(135deg, ${prog.color}, ${prog.color}dd)`,
                      boxShadow: `0 4px 14px ${prog.color}33` }}>
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right — eligibility + requirements */}
                <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>
                      Eligibility Criteria
                    </div>
                    <ul className="space-y-2">
                      {prog.eligibility.map((e, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: G.body }}>
                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: prog.color }} />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>
                      Required Documents
                    </div>
                    <ul className="space-y-2">
                      {prog.requirements.map((r, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: G.body }}>
                          <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: prog.color }} />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                </div>{/* end Content */}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Comparison Table ─── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Compare All Programs</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>Side-by-side overview of all six grant programs to help you choose the right fit.</p>
          </motion.div>
          <div className="overflow-x-auto rounded-2xl" style={{ border: `1px solid ${G.border}` }}>
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: G.navy }}>
                  <th className="text-left px-5 py-4 text-xs font-bold uppercase tracking-widest text-white/50 w-40 sticky left-0"
                    style={{ background: G.navy }}>Program</th>
                  {programs.map(p => (
                    <th key={p.id} className="px-4 py-4 text-center min-w-[110px]">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <p.icon className="w-4 h-4" style={{ color: p.color }} />
                        </div>
                        <span className="text-[10px] font-bold text-white/70 leading-tight text-center">{p.title.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row, ri) => (
                  <tr key={row.label} style={{ background: ri % 2 === 0 ? G.white : G.page, borderTop: `1px solid ${G.border}` }}>
                    <td className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide sticky left-0"
                      style={{ color: G.muted, background: ri % 2 === 0 ? G.white : G.page }}>
                      {row.label}
                    </td>
                    {row.values.map((val, vi) => (
                      <td key={vi} className="px-4 py-3.5 text-center text-xs font-medium" style={{ color: G.body }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: G.page, borderTop: `1px solid ${G.border}` }}>
                  <td className="px-5 py-4 sticky left-0" style={{ background: G.page }} />
                  {programs.map(p => (
                    <td key={p.id} className="px-4 py-4 text-center">
                      <Link to="/apply"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white"
                        style={{ background: p.color }}>
                        Apply <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─── */}
      <section className="py-20 relative overflow-hidden" style={{ background: G.navy }}>
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(22,163,74,0.18), transparent 70%)', filter: 'blur(60px)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Not sure which program fits?</h2>
            <p className="mb-8 max-w-md mx-auto text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Our AI assistant can help you find the right grant program based on your specific situation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/apply"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 20px rgba(22,163,74,0.3)' }}>
                <FileText className="w-4 h-4" /> Start Online Application
              </Link>
              <Link to="/apply/chat"
                className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                <MessageSquare className="w-4 h-4" /> Chat with AI Assistant
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
