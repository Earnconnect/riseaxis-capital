import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, GraduationCap, HeartPulse, Users, Briefcase,
  Building2, ArrowRight, CheckCircle2, FileText, MessageSquare,
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

      {/* ── Programs list ─── */}
      <section className="pb-20 pt-8">
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
