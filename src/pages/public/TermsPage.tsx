import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  amber: '#D97706', amberLt: '#FFFBEB', amberBd: '#FDE68A',
}

const SECTIONS = [
  {
    id: 'eligibility',
    title: '1. Eligibility and Application',
    content: [
      {
        subtitle: 'Who May Apply',
        text: 'Grant programs offered by Rise Axis Capital are available to U.S. residents who meet the specific eligibility criteria for each program. General requirements include: proof of U.S. residency or citizenship, demonstrated financial need (income at or below 250% of the federal poverty line), and documentation supporting the stated hardship.',
      },
      {
        subtitle: 'Application Accuracy',
        text: 'By submitting an application, you certify that all information provided is true, accurate, and complete to the best of your knowledge. Providing false or misleading information, including fraudulent documentation, will result in immediate disqualification, recovery of any disbursed funds, and may subject you to civil or criminal liability under federal fraud statutes.',
      },
      {
        subtitle: 'One Application Per Household',
        text: 'Each household (defined as individuals sharing a primary residence) may submit only one active application per grant program per calendar year. Duplicate applications will be automatically disqualified.',
      },
    ],
  },
  {
    id: 'grant-decisions',
    title: '2. Grant Decisions and Disbursements',
    content: [
      {
        subtitle: 'No Guarantee of Award',
        text: 'Submission of an application does not guarantee a grant award. All decisions are made at the sole discretion of Rise Axis Capital\'s review committee based on eligibility, available funds, and program priorities. We reserve the right to approve, deny, or defer any application without obligation to provide detailed reasoning.',
      },
      {
        subtitle: 'Disbursement Method',
        text: 'Approved grants are disbursed via ACH bank transfer to the verified bank account on file. Rise Axis Capital does not send grant funds via wire transfer, cryptocurrency, gift cards, or money orders. Any request to receive funds via these methods should be treated as fraudulent and reported to us immediately.',
      },
      {
        subtitle: 'Fund Usage',
        text: 'Grant funds are intended for the specific purpose stated in the application (e.g., housing, utilities, medical expenses). By accepting a grant, you agree to use funds solely for the declared purpose. We reserve the right to request proof of expenditure within 90 days of disbursement.',
      },
    ],
  },
  {
    id: 'responsibilities',
    title: '3. Applicant Responsibilities',
    content: [
      {
        subtitle: 'Document Accuracy',
        text: 'You are responsible for submitting authentic, unaltered documents. Digitally altered, fabricated, or borrowed documents are grounds for permanent disqualification from all Rise Axis Capital programs and referral to appropriate law enforcement authorities.',
      },
      {
        subtitle: 'Change in Circumstances',
        text: 'If your financial situation materially changes between application and disbursement — such as employment, inheritance, or insurance settlement — you are obligated to notify us immediately at grants@riseaxiscapital.com. Failure to do so may constitute misrepresentation.',
      },
      {
        subtitle: 'Account Security',
        text: 'You are responsible for maintaining the confidentiality of your portal login credentials. You must notify us immediately if you suspect unauthorized access to your account. Rise Axis Capital will never ask for your password via email or phone.',
      },
    ],
  },
  {
    id: 'prohibited-conduct',
    title: '4. Prohibited Conduct',
    content: [
      {
        subtitle: 'Fraud and Misrepresentation',
        text: 'The following actions are strictly prohibited and will result in permanent disqualification and potential legal action: submitting applications on behalf of ineligible individuals, creating fictitious households or dependents, submitting multiple applications under different identities, and colluding with others to manipulate eligibility determinations.',
      },
      {
        subtitle: 'Platform Misuse',
        text: 'You agree not to use our platform to: attempt to gain unauthorized access to administrative systems, scrape or harvest data from our platform, interfere with other applicants\' accounts, or upload malicious files or code.',
      },
    ],
  },
  {
    id: 'intellectual-property',
    title: '5. Intellectual Property',
    content: [
      {
        subtitle: 'Platform Ownership',
        text: 'All content on the Rise Axis Capital platform — including text, graphics, logos, program descriptions, and software — is the property of Rise Axis Capital and is protected by U.S. copyright law. Unauthorized reproduction or distribution is prohibited.',
      },
      {
        subtitle: 'Your Content',
        text: 'By uploading documents and information to our platform, you grant Rise Axis Capital a limited license to process, store, and use that content solely for grant administration purposes. You retain ownership of all documents you submit.',
      },
    ],
  },
  {
    id: 'disclaimers',
    title: '6. Disclaimers and Limitations',
    content: [
      {
        subtitle: 'No Legal or Financial Advice',
        text: 'Nothing on this platform constitutes legal, financial, or tax advice. Grant recipients should consult qualified professionals regarding any tax implications of grant awards. Rise Axis Capital is not liable for decisions made based on information provided on this platform.',
      },
      {
        subtitle: 'Service Availability',
        text: 'We strive to maintain 99.9% platform uptime but do not guarantee uninterrupted access. Planned maintenance, security updates, or unforeseen technical issues may temporarily affect availability. We are not liable for losses resulting from platform downtime.',
      },
      {
        subtitle: 'Limitation of Liability',
        text: 'To the maximum extent permitted by law, Rise Axis Capital\'s total liability to any applicant shall not exceed the amount of the grant award actually disbursed to that individual. We are not liable for indirect, incidental, or consequential damages.',
      },
    ],
  },
  {
    id: 'governing-law',
    title: '7. Governing Law',
    content: [
      {
        subtitle: 'Jurisdiction',
        text: 'These Terms are governed by the laws of the District of Columbia, without regard to conflict of law principles. Any disputes shall be resolved exclusively in the federal or state courts located in Washington, DC. By using our platform, you consent to personal jurisdiction in those courts.',
      },
      {
        subtitle: 'Changes to Terms',
        text: 'We may update these Terms periodically. Material changes will be communicated via email to registered applicants at least 14 days before taking effect. Continued use of the platform after the effective date constitutes acceptance of the updated Terms.',
      },
    ],
  },
  {
    id: 'contact',
    title: '8. Contact and Disputes',
    content: [
      {
        subtitle: 'Dispute Resolution',
        text: 'Before initiating any legal action, you agree to first contact Rise Axis Capital at grants@riseaxiscapital.com to seek an informal resolution. We will respond within 10 business days and work in good faith to address your concern.',
      },
    ],
  },
]

const TOC = SECTIONS.map(s => ({ id: s.id, title: s.title }))

export default function TermsPage() {
  return (
    <div style={{ background: G.page }}>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-14 text-center"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #FFFBEB 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: G.amberLt, border: `1px solid ${G.amberBd}` }}>
            <FileText size={12} style={{ color: G.amber }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.amber }}>
              Terms of Service
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: G.heading }}>
            Terms of Service
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            className="text-base leading-relaxed" style={{ color: G.body }}>
            Please read these Terms carefully before applying for or accepting any grant from Rise Axis Capital.
            By using our platform, you agree to be bound by these Terms.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }}
            className="text-xs mt-4" style={{ color: G.muted }}>
            Last updated: January 1, 2025 · Effective: January 1, 2025
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Table of Contents */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl p-5"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>Contents</p>
              <nav className="space-y-1">
                {TOC.map(item => (
                  <a key={item.id} href={`#${item.id}`}
                    className="flex items-center gap-1.5 py-1.5 text-xs font-medium rounded-lg px-2 transition-colors hover:bg-slate-50"
                    style={{ color: G.body }}>
                    <ChevronRight size={10} style={{ color: G.muted }} />
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">
            {/* Important notice */}
            <div className="rounded-2xl p-6" style={{ background: G.amberLt, border: `1px solid ${G.amberBd}` }}>
              <div className="flex items-start gap-3">
                <FileText size={18} style={{ color: G.amber }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: G.amber }}>Important Notice</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#92400E' }}>
                    These Terms constitute a legally binding agreement between you and Rise Axis Capital (EIN 27-0964813),
                    a 501(c)(3) nonprofit organization headquartered in Washington, DC.
                    If you do not agree to these Terms, do not use our platform or apply for grants.
                  </p>
                </div>
              </div>
            </div>

            {SECTIONS.map((section, i) => (
              <motion.section key={section.id} id={section.id}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <h2 className="text-xl font-bold mb-5 pb-3"
                  style={{ color: G.heading, borderBottom: `2px solid ${G.border}` }}>
                  {section.title}
                </h2>
                <div className="space-y-5">
                  {section.content.map(block => (
                    <div key={block.subtitle} className="rounded-2xl p-5"
                      style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                      <h3 className="text-sm font-bold mb-2" style={{ color: G.heading }}>{block.subtitle}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: G.body }}>{block.text}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}

            {/* Footer nav */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
              style={{ borderTop: `1px solid ${G.border}` }}>
              <p className="text-xs" style={{ color: G.muted }}>
                Questions? Email{' '}
                <a href="mailto:grants@riseaxiscapital.com" className="underline hover:text-slate-600"
                  style={{ color: G.muted }}>
                  grants@riseaxiscapital.com
                </a>
              </p>
              <Link to="/privacy"
                className="text-xs font-semibold underline hover:text-slate-700 transition-colors"
                style={{ color: G.body }}>
                ← View Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
