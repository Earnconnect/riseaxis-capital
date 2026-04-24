import { motion } from 'framer-motion'
import { AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Phone, Mail, ExternalLink } from 'lucide-react'

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

const RED_FLAGS = [
  'Asks you to pay a fee to receive or process a grant',
  'Contacts you via social media (Facebook, Instagram, WhatsApp, Telegram)',
  'Requests gift cards, wire transfers to personal accounts, or cryptocurrency',
  'Guarantees grant approval without reviewing your application',
  'Claims to be a "government agent" offering grants for a small processing fee',
  'Sends unsolicited emails or texts offering grants you never applied for',
  'Uses a Gmail, Yahoo, or Outlook address instead of @riseaxiscapital.com',
  'Asks for your SSN, bank login credentials, or passwords over the phone',
  'Pressures you to act immediately or keep the grant secret',
  'Sends you a fake "approval check" and asks you to wire back a portion',
]

const REAL_FACTS = [
  { fact: 'We NEVER charge fees', detail: 'Applying for a grant is completely free. We never require payment to process, expedite, or release funds.' },
  { fact: 'We NEVER contact via social media', detail: 'All official communications come from @riseaxiscapital.com email addresses or (702) 274-7227.' },
  { fact: 'We NEVER ask for gift cards', detail: 'Legitimate grant disbursements are made only via ACH direct deposit to your verified U.S. bank account.' },
  { fact: 'Approval is never guaranteed', detail: 'Every application is reviewed individually. Any claim of guaranteed approval is a scam.' },
]

export default function FraudWarningPage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #FFF5F5 60%, #FFFBEB 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-600">
                Fraud Prevention
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Protect Yourself from Scams
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              RiseAxis Capital is the target of impersonation scams. Fraudsters pose as our organization to steal money and personal information. Know the warning signs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Alert banner */}
      <section className="py-8" style={{ background: '#DC2626' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-6 h-6 text-white shrink-0" />
            <p className="text-sm font-semibold text-white leading-relaxed">
              <strong>Official warning:</strong> RiseAxis Capital will NEVER ask you to pay money to receive a grant. Anyone requesting payment is NOT affiliated with us. Report fraud immediately to the FTC at reportfraud.ftc.gov.
            </p>
          </div>
        </div>
      </section>

      {/* What we never do vs. what is real */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeUp>
              <div className="rounded-2xl p-8 h-full" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#FEE2E2' }}>
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-red-700">Red Flags — Signs of a Scam</h2>
                </div>
                <div className="space-y-3">
                  {RED_FLAGS.map((flag, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span className="text-sm leading-relaxed text-red-800">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="rounded-2xl p-8 h-full" style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DCFCE7' }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: G.green }} />
                  </div>
                  <h2 className="text-lg font-bold" style={{ color: '#14532D' }}>How the Real Process Works</h2>
                </div>
                <div className="space-y-5">
                  {REAL_FACTS.map((f, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: G.green }} />
                      <div>
                        <div className="text-sm font-bold mb-0.5" style={{ color: '#14532D' }}>{f.fact}</div>
                        <div className="text-sm leading-relaxed" style={{ color: '#166534' }}>{f.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Official contact verification */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Verify You're Talking to Us</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>
              All official RiseAxis Capital communications come exclusively through these channels.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: Mail, title: 'Email', value: '@riseaxiscapital.com', sub: 'All staff emails end in @riseaxiscapital.com. Never Gmail, Yahoo, or Hotmail.', color: '#2563EB' },
              { icon: Phone, title: 'Phone', value: '(702) 274-7227', sub: 'Our only official phone number. We will never text you from a personal number.', color: G.green },
              { icon: CheckCircle2, title: 'Website', value: 'riseaxiscapital.com', sub: 'Our only website. Look for HTTPS and the padlock. We have no other domains.', color: '#7C3AED' },
            ].map((c, i) => (
              <FadeUp key={c.title} delay={i * 0.08}>
                <div className="rounded-2xl p-7" style={{ background: G.white, border: `1px solid ${G.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${c.color}15`, border: `1px solid ${c.color}30` }}>
                    <c.icon className="w-5 h-5" style={{ color: c.color }} />
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: G.muted }}>{c.title}</div>
                  <div className="text-sm font-bold mb-2" style={{ color: c.color }}>{c.value}</div>
                  <p className="text-xs leading-relaxed" style={{ color: G.body }}>{c.sub}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Report fraud */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FadeUp>
              <div className="rounded-2xl p-8" style={{ background: G.navy }}>
                <h2 className="text-xl font-bold text-white mb-3">Report a Suspected Scam</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  If you believe you have been contacted by someone impersonating RiseAxis Capital, report it immediately. Your report helps us protect others.
                </p>
                <div className="space-y-3">
                  <a href="mailto:fraud@riseaxiscapital.com"
                    className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Mail className="w-5 h-5 text-green-400 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">Report to us</div>
                      <div className="text-xs text-white/40">fraud@riseaxiscapital.com</div>
                    </div>
                  </a>
                  <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ExternalLink className="w-5 h-5 text-green-400 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">Report to the FTC</div>
                      <div className="text-xs text-white/40">reportfraud.ftc.gov</div>
                    </div>
                  </a>
                  <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl transition-colors hover:bg-white/10"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <ExternalLink className="w-5 h-5 text-green-400 shrink-0" />
                    <div>
                      <div className="text-sm font-semibold text-white">Report to the FBI IC3</div>
                      <div className="text-xs text-white/40">ic3.gov — Internet Crime Complaint Center</div>
                    </div>
                  </a>
                </div>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="rounded-2xl p-8 h-full" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                <h2 className="text-xl font-bold mb-3" style={{ color: G.heading }}>If You Were Scammed</h2>
                <p className="text-sm leading-relaxed mb-5" style={{ color: G.body }}>
                  If you sent money or shared personal information with a scammer posing as RiseAxis Capital, take these steps immediately:
                </p>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Contact your bank', desc: 'Report the transaction and request a chargeback or wire recall if possible.' },
                    { step: '2', title: 'Change your passwords', desc: 'If you shared account credentials, change them immediately and enable two-factor authentication.' },
                    { step: '3', title: 'Monitor your credit', desc: 'Place a fraud alert with the three major credit bureaus: Equifax, Experian, and TransUnion.' },
                    { step: '4', title: 'File a police report', desc: 'Contact your local police department and file an official report for your records.' },
                  ].map(s => (
                    <div key={s.step} className="flex gap-4">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                        style={{ background: G.navy }}>
                        {s.step}
                      </div>
                      <div>
                        <div className="text-sm font-bold mb-0.5" style={{ color: G.heading }}>{s.title}</div>
                        <p className="text-xs leading-relaxed" style={{ color: G.body }}>{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Legal note */}
      <section className="py-10" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-[11px] leading-relaxed text-yellow-700">
                <strong>Legal Notice:</strong> Impersonating a nonprofit organization for financial gain is a federal crime under 18 U.S.C. § 1343 (wire fraud) and 18 U.S.C. § 1341 (mail fraud), punishable by up to 20 years in federal prison. Providing false information to obtain a grant is also a federal offense under 18 U.S.C. § 1001. RiseAxis Capital actively cooperates with federal law enforcement investigations.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
