import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, ExternalLink, ChevronDown,
  Phone, Mail, MessageSquare, ArrowRight, BookOpen,
} from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

type Category = 'All' | 'Application Guides' | 'Document Checklists' | 'Financial Tools' | 'IRS & Legal' | 'External Links'
const CATEGORIES: Category[] = ['All', 'Application Guides', 'Document Checklists', 'Financial Tools', 'IRS & Legal', 'External Links']

const RESOURCES = [
  {
    category: 'Application Guides' as Category,
    icon: BookOpen,
    title: 'Grant Application Guide (2025 Edition)',
    desc: 'Step-by-step walkthrough of all 5 application stages, common mistakes to avoid, and eligibility tips from our Grants Manager.',
    meta: 'PDF · 2.4 MB',
    type: 'download',
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
    content: `RiseAxis Capital — Grant Application Guide (2025 Edition)\nEIN: 27-0964813 · 3040 Idaho Ave NW, Washington, DC 20016\n\nThis guide walks you through the 5-step online application process.\n\nStep 1: Grant Program Selection\nChoose the program that best matches your financial need.\n\nStep 2: Personal Identity & Contact\nProvide accurate legal name, address, and contact information.\n\nStep 3: Government ID & Address Verification\nUpload a government-issued photo ID and proof of current address.\n\nStep 4: Financial Disclosure\nComplete the household or business financial disclosure form.\n\nStep 5: Bank Information & Supporting Documents\nProvide ACH bank details and upload required documents.\n\nTips for a Strong Application:\n- Be specific about your need and how the grant will help\n- Upload clear, legible document scans\n- Double-check all financial figures before submitting\n- Submit early — review queues fill up\n\nRiseAxis Capital does not charge application fees. Report fraud to grants@riseaxiscapital.com`,
    filename: 'RiseAxis_Application_Guide_2025.txt',
  },
  {
    category: 'Application Guides' as Category,
    icon: BookOpen,
    title: 'Application Tips for First-Time Applicants',
    desc: 'Written by our Grants Manager: the top 10 reasons applications get delayed and how to avoid each one.',
    meta: 'PDF · 1.1 MB',
    type: 'download',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    content: `RiseAxis Capital — Application Tips for First-Time Applicants\nEIN: 27-0964813\n\nTop 10 Reasons Applications Are Delayed:\n\n1. Incomplete identity documents\n2. Illegible or expired ID uploads\n3. Bank account name doesn't match application name\n4. Missing or unsigned financial disclosure\n5. Insufficient explanation of financial need\n6. Unsupported document formats (use PDF or JPG)\n7. Incorrect program selection for your need type\n8. Missing proof of current address\n9. Email address typos causing notification failures\n10. Not responding to reviewer follow-up requests within 5 days\n\nPro Tips:\n- Keep file sizes under 10MB per document\n- Use your legal name exactly as it appears on your government ID\n- Check your spam folder for our emails\n\nQuestions? Contact grants@riseaxiscapital.com`,
    filename: 'RiseAxis_FirstTime_Tips.txt',
  },
  {
    category: 'Document Checklists' as Category,
    icon: FileText,
    title: 'Document Checklist: Emergency Assistance',
    desc: 'Complete list of required and supplementary documents for Emergency Assistance grant applications.',
    meta: 'PDF · 380 KB',
    type: 'download',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
    content: `RiseAxis Capital — Emergency Assistance Document Checklist\nEIN: 27-0964813\n\nREQUIRED DOCUMENTS:\n□ Government-issued photo ID (driver's license, passport, or state ID)\n□ Proof of current U.S. address (utility bill, lease, or bank statement)\n□ Proof of emergency circumstance (eviction notice, utility shutoff notice, hospital bill, etc.)\n□ U.S. bank account information (account & routing number)\n\nSUPPLEMENTARY (if applicable):\n□ Lease agreement (for housing instability claims)\n□ Insurance denial letter (for medical/property claims)\n□ FEMA denial letter (for disaster-related claims)\n□ Employer termination letter (for sudden income loss)\n□ Doctor's letter (for medical emergency claims)\n\nFORMAT REQUIREMENTS:\n- Accepted formats: PDF, JPG, PNG\n- Maximum file size: 10MB per document\n- Documents must be current (within 90 days)\n\nAward Range: $5,000 – $10,000\nProcessing Time: 3–5 business days`,
    filename: 'RiseAxis_Emergency_Checklist.txt',
  },
  {
    category: 'Document Checklists' as Category,
    icon: FileText,
    title: 'Document Checklist: Business Funding',
    desc: 'Business documentation requirements, financial statement templates, and business plan outline for Business Funding applicants.',
    meta: 'PDF · 410 KB',
    type: 'download',
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
    content: `RiseAxis Capital — Business Funding Document Checklist\nEIN: 27-0964813\n\nREQUIRED DOCUMENTS:\n□ Government-issued photo ID (owner/operator)\n□ Business registration documents (Articles of Incorporation, LLC Operating Agreement, or DBA filing)\n□ Business plan with financial projections (12-month minimum)\n□ Financial statements for last 2 years (P&L, balance sheet)\n□ U.S. business bank account information\n\nSUPPLEMENTARY (if applicable):\n□ EIN confirmation letter (IRS Form SS-4)\n□ Business license (city/county)\n□ Federal tax returns (Schedule C or 1120-S)\n□ Invoices or contracts showing business activity\n□ Lease agreement for business location\n\nELIGIBILITY NOTES:\n- Business must be registered in the United States\n- Owner must be U.S. resident 18+\n- Startups under 3 years qualify with business plan\n\nAward Range: $5,000 – $50,000\nProcessing Time: 10–15 business days`,
    filename: 'RiseAxis_Business_Checklist.txt',
  },
  {
    category: 'Financial Tools' as Category,
    icon: FileText,
    title: 'Household Budget Template',
    desc: 'Pre-formatted spreadsheet template for the Financial Disclosure step of your grant application. Works in Excel and Google Sheets.',
    meta: 'XLSX · 118 KB',
    type: 'download',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    content: `RiseAxis Capital — Household Budget Template\nEIN: 27-0964813\n\nMONTHLY INCOME:\nPrimary Employment: $______\nSecondary Income: $______\nBenefits/Assistance: $______\nOther Income: $______\nTOTAL INCOME: $______\n\nMONTHLY EXPENSES:\nRent/Mortgage: $______\nUtilities: $______\nFood/Groceries: $______\nTransportation: $______\nHealth Insurance: $______\nOut-of-Pocket Medical: $______\nChild Care: $______\nLoan Payments: $______\nPhone/Internet: $______\nOther: $______\nTOTAL EXPENSES: $______\n\nNET MONTHLY (Income - Expenses): $______\n\nCurrent Savings: $______\nPrimary Financial Hardship Description:\n[Describe your situation and how the grant will help]\n\nThis template is for reference. All financial information submitted is confidential.`,
    filename: 'RiseAxis_Budget_Template.txt',
  },
  {
    category: 'IRS & Legal' as Category,
    icon: FileText,
    title: 'Grant Award Tax Guide (IRS 1099-MISC)',
    desc: 'Plain-language explanation of how grant income is reported, when a 1099-MISC is issued, and what to expect at tax time.',
    meta: 'PDF · 890 KB',
    type: 'download',
    color: '#0F172A', bg: '#F1F5F9', border: '#CBD5E1',
    content: `RiseAxis Capital — Grant Award Tax Guide\nEIN: 27-0964813\n\nDO I OWE TAXES ON MY GRANT?\nGrant income is generally taxable as ordinary income unless it qualifies for an exclusion. Consult a qualified tax professional for advice specific to your situation.\n\nWHEN WILL I RECEIVE A 1099-MISC?\nIRS regulations require us to issue Form 1099-MISC to any grant recipient who receives $600 or more in a calendar year. You will receive this form by January 31 of the following tax year.\n\nHOW IS IT REPORTED?\n- Box 3 "Other Income" on Form 1099-MISC\n- Report on Schedule 1, Line 8 of your Form 1040\n\nWHAT IF I DON'T RECEIVE MY 1099?\nContact grants@riseaxiscapital.com by February 15. We can reissue digitally.\n\nANTI-FRAUD NOTICE:\nRiseAxis Capital will never ask you to pay taxes before receiving your grant. This is a common scam. Report any such request immediately.\n\nFor personalized tax advice, consult a CPA or enrolled agent. IRS Free File is available at irs.gov/freefile for eligible taxpayers.`,
    filename: 'RiseAxis_Tax_Guide_1099.txt',
  },
  {
    category: 'External Links' as Category,
    icon: ExternalLink,
    title: 'IRS.gov — Tax-Exempt Organizations',
    desc: 'Official IRS page on 501(c)(3) nonprofit organizations, exempt status, and annual reporting requirements.',
    meta: 'External · irs.gov',
    type: 'external',
    url: 'https://www.irs.gov/charities-non-profits',
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
    content: '', filename: '',
  },
  {
    category: 'External Links' as Category,
    icon: ExternalLink,
    title: 'Benefits.gov — Federal Benefits Finder',
    desc: "The federal government's official portal to find and apply for additional assistance programs, benefits, and grants.",
    meta: 'External · benefits.gov',
    type: 'external',
    url: 'https://www.benefits.gov',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
    content: '', filename: '',
  },
]

const TIPS = [
  {
    q: 'What documents should I gather before starting my application?',
    a: 'At minimum, prepare a government-issued photo ID, proof of current address (utility bill or bank statement), documentation supporting your financial need (eviction notice, hospital bill, termination letter, etc.), and your U.S. bank account and routing numbers.',
  },
  {
    q: 'How do I write a strong grant purpose statement?',
    a: 'Be specific: state the exact dollar amount needed, what it will be used for, and the outcome you expect. Avoid vague language. A strong statement: "I need $3,500 to pay three months of overdue rent to prevent eviction on March 31st, after losing my job on January 15th." Reviewers appreciate clarity and honesty.',
  },
  {
    q: 'Can I submit my application without all documents?',
    a: 'Yes. You can submit a partial application and upload missing documents afterward through your applicant portal. However, your application will not move to active review until all required documents are received. We recommend gathering everything before submitting when possible.',
  },
  {
    q: 'My application was rejected. Can I reapply?',
    a: 'Yes. You may submit a new application for the same program after 90 days from the rejection date. If you believe your application was rejected in error, contact our Grants Manager at grants@riseaxiscapital.com within 30 days to request a reconsideration review.',
  },
  {
    q: 'What if my financial situation changes after I apply?',
    a: 'Contact our support team immediately at grants@riseaxiscapital.com or (702) 274-7227. Changes in circumstances — either improving or worsening — can affect your eligibility determination. We can update your file before a decision is issued.',
  },
  {
    q: 'How and when do I receive my IRS Form 1099-MISC?',
    a: 'If your total grant receipts exceed $600 in a calendar year, we issue Form 1099-MISC by January 31 of the following year. It will be sent to the email and mailing address on your account. Contact us if you have not received it by February 15.',
  },
]

const EXTERNAL_ORGS = [
  { name: 'IRS.gov', desc: 'Official tax information, free file, and 501(c)(3) lookup', url: 'https://www.irs.gov' },
  { name: 'Benefits.gov', desc: 'Federal government benefits and assistance finder', url: 'https://www.benefits.gov' },
  { name: 'HUD.gov Housing Assistance', desc: 'Housing assistance programs, rental help, and housing counselors', url: 'https://www.hud.gov' },
  { name: 'USDA Rural Development', desc: 'Rural community assistance programs and business grants', url: 'https://www.rd.usda.gov' },
  { name: 'SBA Small Business Resources', desc: 'Small business loans, grants, and free consulting (SCORE)', url: 'https://www.sba.gov' },
  { name: 'Candid / GuideStar', desc: 'Nonprofit transparency database — verify any charity before donating', url: 'https://candid.org' },
]

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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
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

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  )
}

function simulateDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const filtered = activeCategory === 'All'
    ? RESOURCES
    : RESOURCES.filter(r => r.category === activeCategory)

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
                Free Resources
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Resource Center
            </h1>
            <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: G.body }}>
              Guides, checklists, and tools to help you navigate the grant application process with confidence. All resources are free.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Resources ────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">

          {/* Category tabs */}
          <FadeUp>
            <div className="flex flex-wrap gap-2 mb-10">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                  style={activeCategory === cat
                    ? { background: G.heading, color: '#fff', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }
                    : { background: G.white, border: `1px solid ${G.border}`, color: G.body }}>
                  {cat}
                </button>
              ))}
            </div>
          </FadeUp>

          {/* Resource grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((res, i) => (
              <FadeUp key={res.title} delay={i * 0.05}>
                <div className="flex flex-col h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: G.white, border: `1px solid ${G.border}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: res.bg, border: `1px solid ${res.border}` }}>
                      <res.icon size={18} style={{ color: res.color }} />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full mt-1"
                      style={{ background: res.bg, color: res.color }}>{res.category}</span>
                  </div>
                  <h3 className="text-sm font-bold mb-2 leading-snug" style={{ color: G.heading }}>{res.title}</h3>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: G.body }}>{res.desc}</p>
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${G.border}` }}>
                    <span className="text-[11px] font-mono" style={{ color: G.muted }}>{res.meta}</span>
                    {res.type === 'download' ? (
                      <button onClick={() => simulateDownload(res.filename, res.content)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:brightness-105"
                        style={{ background: `linear-gradient(135deg, ${res.color}, ${res.color}cc)` }}>
                        <Download className="w-3 h-3" /> Download
                      </button>
                    ) : (
                      <a href={res.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:brightness-105 text-white"
                        style={{ background: `linear-gradient(135deg, ${res.color}, ${res.color}cc)` }}>
                        <ExternalLink className="w-3 h-3" /> Visit
                      </a>
                    )}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tips accordion ───────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Guidance</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Application Tips & FAQs</h2>
              <p className="text-sm" style={{ color: G.body }}>Common questions from applicants, answered by our Grants Manager.</p>
            </div>
          </FadeUp>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <FadeUp key={i} delay={i * 0.04}>
                <FAQItem q={tip.q} a={tip.a} />
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── External orgs ────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="mb-10">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Additional Help</div>
              <h2 className="text-3xl font-bold" style={{ color: G.heading }}>Trusted External Resources</h2>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl overflow-hidden" style={{ background: G.white, border: `1px solid ${G.border}` }}>
              {EXTERNAL_ORGS.map((org, i) => (
                <a key={org.name} href={org.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 px-6 py-5 transition-all hover:bg-slate-50 group"
                  style={{ borderBottom: i < EXTERNAL_ORGS.length - 1 ? `1px solid ${G.border}` : 'none' }}>
                  <ExternalLink className="w-4 h-4 shrink-0" style={{ color: G.green }} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-0.5" style={{ color: G.heading }}>{org.name}</div>
                    <div className="text-xs" style={{ color: G.muted }}>{org.desc}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: G.green }} />
                </a>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Contact CTA ──────────────────────────────────── */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-7 text-center"
              style={{ background: G.page, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: G.heading }}>Still have questions?</h3>
              <p className="text-sm mb-6" style={{ color: G.body }}>Reach our grant support team directly — we're here to help.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="tel:7022747227"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
                  style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}>
                  <Phone className="w-4 h-4" style={{ color: G.green }} /> (702) 274-7227
                </a>
                <a href="mailto:grants@riseaxiscapital.com"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
                  style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}>
                  <Mail className="w-4 h-4" style={{ color: G.green }} /> Email Support
                </a>
                <Link to="/apply/chat"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.2)' }}>
                  <MessageSquare className="w-4 h-4" /> Ask AI Assistant
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  )
}
