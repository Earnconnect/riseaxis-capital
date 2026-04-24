import { motion } from 'framer-motion'
import { Accessibility, CheckCircle2, Mail, Phone } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
      {children}
    </motion.div>
  )
}

const STANDARDS = [
  { title: 'WCAG 2.1 Level AA', desc: 'Our website is designed to conform with Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA, the internationally recognized standard for web accessibility.' },
  { title: 'Section 508 Compliance', desc: 'As an organization receiving federal funding, we are committed to Section 508 of the Rehabilitation Act, ensuring electronic information is accessible to people with disabilities.' },
  { title: 'ADA Title III', desc: 'Our digital services comply with Title III of the Americans with Disabilities Act, which prohibits discrimination against individuals with disabilities in places of public accommodation.' },
]

const FEATURES = [
  { title: 'Keyboard Navigation', desc: 'All interactive elements are fully accessible via keyboard. Tab order is logical and visible focus indicators are present throughout.' },
  { title: 'Screen Reader Support', desc: 'The site is tested with NVDA, JAWS, and VoiceOver. ARIA labels, landmarks, and live regions are used throughout for clear screen reader communication.' },
  { title: 'Sufficient Color Contrast', desc: 'All text meets WCAG 4.5:1 contrast ratio requirements. Color is never used as the sole means of conveying information.' },
  { title: 'Resizable Text', desc: 'Text can be resized up to 200% without loss of content or functionality using browser zoom features.' },
  { title: 'Alternative Text', desc: 'All meaningful images include descriptive alt text. Decorative images are marked as presentational.' },
  { title: 'Form Accessibility', desc: 'All form fields have associated labels, error messages are programmatically associated with inputs, and required fields are clearly indicated.' },
  { title: 'No Reliance on Sensory Characteristics', desc: 'Instructions do not rely solely on shape, size, color, or location. Content is understandable without visual cues.' },
  { title: 'Captions & Transcripts', desc: 'Any video or audio content includes captions and transcripts where applicable.' },
]

export default function AccessibilityPage() {
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
              <Accessibility className="w-3.5 h-3.5" style={{ color: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Accessibility Statement
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Accessibility Commitment
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              RiseAxis Capital is committed to ensuring equal access to our grant programs and digital services for people of all abilities. This page describes our accessibility standards and how to request assistance.
            </p>
            <p className="text-sm mt-4" style={{ color: G.muted }}>Last updated: January 15, 2025</p>
          </motion.div>
        </div>
      </section>

      {/* Our commitment */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-4" style={{ color: G.heading }}>Our Commitment</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>
              We believe that everyone deserves equal access to financial assistance programs, regardless of ability. RiseAxis Capital is dedicated to providing a website experience that is accessible to individuals with visual, auditory, motor, and cognitive disabilities.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: G.body }}>
              We continually evaluate and improve our digital services to ensure compliance with applicable accessibility standards and to provide a positive experience for all users.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Standards */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Applicable Standards</h2>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STANDARDS.map((s, i) => (
              <FadeUp key={s.title} delay={i * 0.07}>
                <div className="rounded-2xl p-7 h-full" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-1.5 h-8 rounded-full mb-5" style={{ background: G.green }} />
                  <div className="text-sm font-bold mb-3" style={{ color: G.heading }}>{s.title}</div>
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility features */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-8" style={{ color: G.heading }}>Accessibility Features</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.05}>
                <div className="flex gap-4 p-6 rounded-2xl" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: G.green }} />
                  <div>
                    <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>{f.title}</div>
                    <p className="text-sm leading-relaxed" style={{ color: G.body }}>{f.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Known issues */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-4" style={{ color: G.heading }}>Known Limitations</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: G.body }}>
              While we strive for full compliance, some areas of our website may not yet fully meet WCAG 2.1 Level AA standards. We are actively working to address the following known limitations:
            </p>
            <div className="space-y-3">
              {[
                'Some PDF documents may not be fully accessible to screen readers. Text alternatives are being created.',
                'Older embedded content from third-party services may have limited accessibility. We are working with vendors to improve this.',
                'Complex data tables in the admin portal may not convey all relationships to screen reader users in all browsers.',
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-4 rounded-xl" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: '#D97706' }} />
                  <p className="text-sm leading-relaxed" style={{ color: G.body }}>{item}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Request assistance */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-8" style={{ background: G.navy }}>
              <h2 className="text-xl font-bold text-white mb-3">Request Accessibility Assistance</h2>
              <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                If you experience any difficulty accessing our website or need information in an alternative format, please contact us. We are committed to providing reasonable accommodations and will respond within 2 business days.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <a href="mailto:accessibility@riseaxiscapital.com"
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Mail className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-0.5">Email</div>
                    <div className="text-sm font-semibold text-white">accessibility@riseaxiscapital.com</div>
                  </div>
                </a>
                <a href="tel:7022747227"
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Phone className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-0.5">Phone</div>
                    <div className="text-sm font-semibold text-white">(702) 274-7227</div>
                  </div>
                </a>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                When contacting us, please describe the specific accessibility issue you encountered so we can provide the most appropriate assistance.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Feedback */}
      <section className="py-10" style={{ background: G.page }}>
        <div className="max-w-4xl mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-5" style={{ background: G.white, border: `1px solid ${G.border}` }}>
              <p className="text-sm leading-relaxed" style={{ color: G.body }}>
                <strong style={{ color: G.heading }}>Feedback:</strong> We welcome your feedback on the accessibility of riseaxiscapital.com. If you encounter any accessibility barriers or have suggestions for improvement, please contact us at{' '}
                <a href="mailto:accessibility@riseaxiscapital.com" className="underline" style={{ color: G.green }}>
                  accessibility@riseaxiscapital.com
                </a>
                . We take all feedback seriously and will work to continuously improve.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
