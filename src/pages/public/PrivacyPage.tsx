import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, ChevronRight } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const SECTIONS = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Identification Information',
        text: 'We collect information you voluntarily provide when applying for grants or contacting us, including: full name, date of birth, Social Security Number (SSN) or Individual Taxpayer Identification Number (ITIN), mailing address, email address, and phone number.',
      },
      {
        subtitle: 'Financial Information',
        text: 'To determine grant eligibility and process disbursements, we may collect bank account details, proof of income or financial hardship documentation, tax returns or W-2 forms, and information about household size and expenses.',
      },
      {
        subtitle: 'Technical Information',
        text: 'When you visit our website, we automatically collect IP address, browser type and version, pages visited and time spent, referring URLs, and device identifiers.',
      },
    ],
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    content: [
      {
        subtitle: 'Grant Administration',
        text: 'Your personal and financial information is used solely to process grant applications, verify eligibility, communicate decisions, and disburse approved funds. We do not sell, rent, or trade your information to third parties.',
      },
      {
        subtitle: 'Communications',
        text: 'We use your contact information to send application status updates, disbursement notifications, follow-up surveys, and important program announcements. You may opt out of non-essential communications at any time.',
      },
      {
        subtitle: 'Legal Compliance',
        text: 'As a 501(c)(3) organization, we may be required to retain certain records for IRS reporting, federal grant compliance, and audit purposes. We comply with all applicable federal and state laws governing nonprofit financial records.',
      },
    ],
  },
  {
    id: 'data-sharing',
    title: '3. Data Sharing and Disclosure',
    content: [
      {
        subtitle: 'We Do Not Sell Your Data',
        text: 'Rise Axis Capital never sells, rents, or shares your personal information with marketers, advertisers, or data brokers for commercial purposes.',
      },
      {
        subtitle: 'Limited Sharing',
        text: 'We may share information with trusted service providers who assist in operating our platform (e.g., payment processors, cloud storage) under strict confidentiality agreements, government agencies when required by law, and with your explicit written consent.',
      },
      {
        subtitle: 'Aggregated Data',
        text: 'We may publish anonymized, aggregated statistics about our grant programs (e.g., total families served, average disbursement amount) that cannot be used to identify any individual.',
      },
    ],
  },
  {
    id: 'data-security',
    title: '4. Data Security',
    content: [
      {
        subtitle: 'Security Measures',
        text: 'We implement industry-standard security practices including 256-bit AES encryption for stored data, TLS 1.3 for data in transit, multi-factor authentication for staff accounts, and regular third-party security audits.',
      },
      {
        subtitle: 'Data Retention',
        text: 'We retain your application records for 7 years following your last interaction with our programs, consistent with IRS nonprofit recordkeeping requirements. Financial transaction records are retained for 10 years.',
      },
      {
        subtitle: 'Breach Notification',
        text: 'In the unlikely event of a data breach affecting your information, we will notify you within 72 hours of discovery, consistent with applicable state data breach notification laws.',
      },
    ],
  },
  {
    id: 'your-rights',
    title: '5. Your Rights',
    content: [
      {
        subtitle: 'Access and Correction',
        text: 'You have the right to request a copy of the personal information we hold about you and to correct any inaccuracies. Submit requests to grants@riseaxiscapital.com with the subject line "Data Access Request."',
      },
      {
        subtitle: 'Deletion',
        text: 'You may request deletion of your personal information, subject to our legal retention obligations. Deletion requests will be processed within 30 days. Note that deleting your data will close any pending applications.',
      },
      {
        subtitle: 'California Residents',
        text: 'California residents have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information is collected, the right to opt out of sale (we do not sell data), and the right to non-discrimination for exercising privacy rights.',
      },
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies and Tracking',
    content: [
      {
        subtitle: 'Essential Cookies',
        text: 'We use strictly necessary cookies to maintain your session state and security tokens. These cannot be disabled as they are essential to the platform functioning correctly.',
      },
      {
        subtitle: 'Analytics',
        text: 'With your consent, we use privacy-respecting analytics to understand how applicants navigate our platform so we can improve the grant application experience. No personally identifiable information is shared with analytics providers.',
      },
    ],
  },
  {
    id: 'contact',
    title: '7. Contact Us',
    content: [
      {
        subtitle: 'Privacy Officer',
        text: 'For privacy-related questions, data requests, or concerns, contact our Privacy Officer at grants@riseaxiscapital.com or by mail at Rise Axis Capital, 3040 Idaho Ave NW, Washington, DC 20016. We respond to all privacy inquiries within 5 business days.',
      },
    ],
  },
]

const TOC = SECTIONS.map(s => ({ id: s.id, title: s.title }))

export default function PrivacyPage() {
  return (
    <div style={{ background: G.page }}>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-14 text-center"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
            <Shield size={12} style={{ color: G.green }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
              Privacy Policy
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: G.heading }}>
            Your Privacy Matters
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            className="text-base leading-relaxed" style={{ color: G.body }}>
            We are committed to protecting the personal information of every applicant and family we serve.
            This policy explains how we collect, use, and safeguard your data.
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
            {/* Intro box */}
            <div className="rounded-2xl p-6" style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <div className="flex items-start gap-3">
                <Shield size={18} style={{ color: G.green }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: G.green }}>Our Privacy Commitment</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#166534' }}>
                    Rise Axis Capital is a 501(c)(3) nonprofit organization (EIN 27-0964813).
                    We handle sensitive financial and personal data on behalf of vulnerable families.
                    We treat that responsibility with the highest level of care and never monetize your information.
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
              <Link to="/terms"
                className="text-xs font-semibold underline hover:text-slate-700 transition-colors"
                style={{ color: G.body }}>
                View Terms of Service →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
