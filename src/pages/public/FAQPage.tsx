import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Phone, Mail, MessageSquare } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

type Category = 'All' | 'Eligibility' | 'Application Process' | 'Funding & Disbursement' | 'Account & Portal' | 'Legal & Compliance'

const FAQS: { q: string; a: string; cat: Category }[] = [
  // Eligibility
  {
    cat: 'Eligibility',
    q: 'Are non-U.S. citizens eligible to apply?',
    a: 'Applicants must be lawful permanent residents or U.S. citizens with a valid Social Security Number. Non-immigrant visa holders (F-1, H-1B, etc.) are not currently eligible. DACA recipients may qualify for certain programs — contact us for a case-by-case review.',
  },
  {
    cat: 'Eligibility',
    q: 'Can businesses or organizations apply?',
    a: 'Yes. The Business Funding Grant and Community Development Grant specifically accept applications from small businesses, nonprofits, and community organizations. Individual programs (Emergency, Education, Medical) are intended for individuals and households only.',
  },
  {
    cat: 'Eligibility',
    q: 'Is there an income limit to qualify?',
    a: 'Income limits vary by program. As a general guideline, household income must be at or below 300% of the federal poverty level for most individual programs. Business and community grants do not have income limits. Exact thresholds are verified during the review process.',
  },
  {
    cat: 'Eligibility',
    q: 'Does a prior grant disqualify me from applying again?',
    a: 'No — prior recipients may reapply. However, a 12-month waiting period applies before re-applying to the same program. Applications for a different program may be submitted immediately after your prior grant is closed. Multiple concurrent applications are not permitted.',
  },
  // Application Process
  {
    cat: 'Application Process',
    q: 'How long does the review process take?',
    a: 'Review times vary by program: Emergency Assistance (3–5 business days), Education and Medical (5–10 business days), Community Development and Business Funding (10–15 business days). Complex applications requiring additional documentation may take longer.',
  },
  {
    cat: 'Application Process',
    q: 'Can I edit my application after submitting?',
    a: 'Once submitted, applications enter the review queue and cannot be edited directly. If you need to update information or upload additional documents, contact our grants team at grants@riseaxiscapital.com within 48 hours of submission. After 48 hours, changes require a formal amendment request.',
  },
  {
    cat: 'Application Process',
    q: 'What documents are required to apply?',
    a: 'Required documents depend on the program. All applications require a government-issued photo ID and proof of U.S. residency. Additional documents include proof of need (medical bills, tuition invoices, eviction notices), bank account information for disbursement, and income verification. Your application portal will list all required items.',
  },
  {
    cat: 'Application Process',
    q: 'What is the application reference number format?',
    a: 'Reference numbers follow the format APP-NEP-YYYY-XXXXXX (e.g., APP-NEP-2025-004821). You receive this number immediately after submission via email and on your dashboard. Use it to track your application at riseaxiscapital.com/track or in your account portal.',
  },
  {
    cat: 'Application Process',
    q: 'What happens if my application is denied?',
    a: 'If your application is denied, you will receive a written explanation via email within 2 business days of the decision. You may request a review by emailing appeals@riseaxiscapital.com within 30 days of denial. Reapplication is permitted after 90 days unless the denial was due to fraud or false information.',
  },
  // Funding & Disbursement
  {
    cat: 'Funding & Disbursement',
    q: 'How are grant funds disbursed?',
    a: 'Approved grants are disbursed via ACH direct deposit to your verified U.S. bank account, typically within 1–3 business days of approval. Wire transfers are available for amounts over $25,000. We do not issue checks, prepaid cards, cryptocurrency, or money orders.',
  },
  {
    cat: 'Funding & Disbursement',
    q: 'What can grant funds be used for?',
    a: 'Funds must be used for the stated purpose in your application. Emergency grants cover rent, utilities, and immediate household expenses. Education grants cover tuition, books, and school fees. Medical grants cover healthcare provider bills and prescriptions. Misuse of funds is a violation of your grant agreement and federal law.',
  },
  {
    cat: 'Funding & Disbursement',
    q: 'Are grant funds taxable income?',
    a: 'Grants used for qualified educational expenses are generally tax-free under IRC § 117. All other grants — including emergency, medical, and business grants — are taxable income. Grants exceeding $600 in a calendar year require a Form 1099-MISC, which will be issued by January 31 of the following year.',
  },
  {
    cat: 'Funding & Disbursement',
    q: 'Can I receive a grant and apply for government assistance at the same time?',
    a: 'Yes, in most cases. Receiving a grant from RiseAxis Capital does not automatically disqualify you from federal or state assistance programs. However, some programs (like certain Medicaid thresholds or SNAP benefits) may count grant income in their eligibility calculations. We recommend consulting a benefits counselor.',
  },
  // Account & Portal
  {
    cat: 'Account & Portal',
    q: 'How do I reset my password?',
    a: 'Go to riseaxiscapital.com/forgot-password and enter your registered email address. You will receive a password reset link valid for 60 minutes. If you do not receive the email, check your spam folder or contact support at grants@riseaxiscapital.com.',
  },
  {
    cat: 'Account & Portal',
    q: 'Can I have more than one account?',
    a: 'No. Each applicant is permitted exactly one account, verified by Social Security Number and government-issued ID. Duplicate accounts are a violation of our terms of service and will result in all associated applications being permanently disqualified.',
  },
  {
    cat: 'Account & Portal',
    q: 'How do I check my application status without logging in?',
    a: 'Visit riseaxiscapital.com/track and enter your application reference number (format: APP-NEP-YYYY-XXXXXX). You will see your current status stage without needing to log in. Full application details, documents, and reviewer notes are only visible inside your secure account portal.',
  },
  // Legal & Compliance
  {
    cat: 'Legal & Compliance',
    q: 'Is this a loan that must be repaid?',
    a: 'No. All funds disbursed through RiseAxis Capital are grants, not loans. There is no repayment obligation as long as funds are used for their stated purpose and all program conditions are met. Grants obtained through misrepresentation may be subject to recovery.',
  },
  {
    cat: 'Legal & Compliance',
    q: 'What happens if I provide false information on my application?',
    a: 'Providing false or misleading information is a federal offense under 18 U.S.C. § 1001 and may result in criminal prosecution, grant recovery, permanent disqualification from all future programs, and referral to the Department of Justice. We conduct identity and document verification on all applications.',
  },
  {
    cat: 'Legal & Compliance',
    q: 'Is my personal data shared with third parties?',
    a: 'Your data is never sold. We share data only as required: with identity verification partners (to confirm your identity), with banking partners (to process disbursements), and with the IRS (for 1099 reporting). Full details are in our Privacy Policy at riseaxiscapital.com/privacy.',
  },
  {
    cat: 'Legal & Compliance',
    q: 'Is RiseAxis Capital affiliated with any government agency?',
    a: 'No. RiseAxis Capital is an independent 501(c)(3) nonprofit organization, not a government agency. We receive some funding from federal grant programs but operate independently. We do not represent FEMA, HUD, the SBA, or any other government body. Any communication claiming otherwise should be reported to us immediately.',
  },
]

const CATEGORIES: Category[] = ['All', 'Eligibility', 'Application Process', 'Funding & Disbursement', 'Account & Portal', 'Legal & Compliance']

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${G.border}`, background: G.white }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left gap-4">
        <span className="text-sm font-semibold" style={{ color: G.heading }}>{q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-200"
          style={{ color: G.muted, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}>
            <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: G.body, borderTop: `1px solid ${G.border}`, paddingTop: '16px' }}>
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQPage() {
  const [active, setActive] = useState<Category>('All')
  const filtered = active === 'All' ? FAQS : FAQS.filter(f => f.cat === active)

  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 60%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Help Center
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Frequently Asked Questions
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              Answers to the most common questions about eligibility, the application process, funding, and your account.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Body */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                style={active === cat
                  ? { background: G.navy, color: '#FFFFFF' }
                  : { background: G.page, color: G.body, border: `1px solid ${G.border}` }}>
                {cat}
                {cat !== 'All' && (
                  <span className="ml-1.5 opacity-60">
                    ({FAQS.filter(f => f.cat === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3">
                {filtered.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <div className="rounded-2xl p-8" style={{ background: G.navy }}>
            <div className="text-center mb-8">
              <div className="text-xl font-bold text-white mb-2">Still have questions?</div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Our grants team is available Monday–Friday, 9 AM–5 PM Eastern Time.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:7022747227"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                <Phone className="w-4 h-4" /> (702) 274-7227
              </a>
              <a href="mailto:grants@riseaxiscapital.com"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
                <Mail className="w-4 h-4" /> grants@riseaxiscapital.com
              </a>
              <Link to="/apply/chat"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
                <MessageSquare className="w-4 h-4" /> Ask AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
