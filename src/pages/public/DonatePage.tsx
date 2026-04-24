import { motion } from 'framer-motion'
import { Heart, CheckCircle2, Mail, Phone, Shield, Award, Users, DollarSign } from 'lucide-react'

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

const GIVING_LEVELS = [
  { amount: '$25', label: 'Friend', color: '#2563EB', desc: 'Covers application processing costs for one individual applicant.' },
  { amount: '$100', label: 'Supporter', color: '#16A34A', desc: 'Funds a partial emergency assistance grant for a family in crisis.' },
  { amount: '$500', label: 'Champion', color: '#7C3AED', desc: 'Fully funds an education support grant for one eligible student.' },
  { amount: '$1,000', label: 'Benefactor', color: '#D97706', desc: 'Sponsors a medical expenses grant for an uninsured individual.' },
  { amount: '$5,000', label: 'Patron', color: '#DC2626', desc: 'Funds a full business development grant for an emerging entrepreneur.' },
  { amount: 'Custom', label: 'Your Amount', color: '#0F172A', desc: 'Any contribution makes a meaningful difference in our community.' },
]

const IMPACT = [
  { icon: Users, stat: '1,200+', label: 'Recipients Served', sub: 'Since 2019' },
  { icon: DollarSign, stat: '$2.4M', label: 'Disbursed in Grants', sub: 'Across 34 states' },
  { icon: Award, stat: '94%', label: 'Fundraising Efficiency', sub: 'Of every dollar goes to grants' },
  { icon: Shield, stat: '0%', label: 'Application Fees', sub: 'Free to all applicants' },
]

export default function DonatePage() {
  return (
    <div style={{ background: G.page }} className="pt-16">

      {/* Hero */}
      <section className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #FFF0F0 50%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,38,38,0.06), transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative max-w-[1440px] mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
                Support Our Mission
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Help Us Fund More Grants
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: G.body }}>
              Every dollar you donate goes directly to funding grants for individuals, families, and communities who need it most. RiseAxis Capital is a 501(c)(3) nonprofit — your gift is fully tax-deductible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="py-14" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {IMPACT.map(s => (
                <div key={s.label} className="rounded-2xl p-6 text-center"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <s.icon className="w-5 h-5" style={{ color: G.green }} />
                  </div>
                  <div className="text-2xl font-bold mb-0.5" style={{ color: G.heading }}>{s.stat}</div>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: G.body }}>{s.label}</div>
                  <div className="text-[11px]" style={{ color: G.muted }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Giving levels */}
      <section className="py-16" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <h2 className="text-2xl font-bold mb-2" style={{ color: G.heading }}>Giving Levels</h2>
            <p className="text-sm mb-8" style={{ color: G.muted }}>
              Select a giving level below. We'll follow up with instructions to complete your gift via check, wire, or donor-advised fund.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GIVING_LEVELS.map((level, i) => (
              <FadeUp key={level.label} delay={i * 0.06}>
                <div className="rounded-2xl p-7 h-full flex flex-col transition-all hover:-translate-y-1"
                  style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div className="text-3xl font-black mb-1" style={{ color: level.color }}>{level.amount}</div>
                  <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: level.color }}>{level.label}</div>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: G.body }}>{level.desc}</p>
                  <a href="mailto:donate@riseaxiscapital.com?subject=Donation Inquiry"
                    className="mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-110"
                    style={{ background: level.color }}>
                    Give {level.amount} <Heart className="w-4 h-4" />
                  </a>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* How to donate */}
      <section className="py-16" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <h2 className="text-2xl font-bold mb-6" style={{ color: G.heading }}>Ways to Give</h2>
              <div className="space-y-5">
                {[
                  { title: 'Check or Money Order', desc: 'Make payable to "RiseAxis Capital" and mail to 3040 Idaho Ave NW, Washington, DC 20016. Please include your name and email for acknowledgment.', color: '#2563EB' },
                  { title: 'Wire Transfer', desc: 'Contact our development office at donate@riseaxiscapital.com for wire transfer instructions. Preferred for gifts of $5,000 or more.', color: '#16A34A' },
                  { title: 'Donor-Advised Fund (DAF)', desc: 'Recommend a grant to EIN 27-0964813. We accept DAF distributions from all major sponsoring organizations including Fidelity Charitable, Schwab Charitable, and Vanguard Charitable.', color: '#7C3AED' },
                  { title: 'Corporate Matching', desc: 'Many employers match employee donations dollar-for-dollar. Contact your HR department about matching gift eligibility and submit our EIN (27-0964813) when completing your request.', color: '#D97706' },
                ].map(w => (
                  <div key={w.title} className="flex gap-4">
                    <div className="w-1.5 rounded-full shrink-0 mt-1" style={{ background: w.color, minHeight: '20px' }} />
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: G.heading }}>{w.title}</div>
                      <p className="text-sm leading-relaxed" style={{ color: G.body }}>{w.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="rounded-2xl p-8" style={{ background: G.navy }}>
                <div className="text-[11px] font-bold uppercase tracking-widest mb-4 text-green-400">Tax Deductibility</div>
                <h3 className="text-xl font-bold text-white mb-4">Your gift is 100% tax-deductible</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  RiseAxis Capital is a 501(c)(3) organization recognized by the IRS. All contributions are tax-deductible to the fullest extent allowed by law. You will receive an official acknowledgment letter within 5 business days of your gift.
                </p>
                <div className="space-y-3 mb-6">
                  {[
                    'Official acknowledgment letter provided',
                    'EIN: 27-0964813 for your records',
                    'Annual impact report sent to major donors',
                    'No goods or services provided in exchange',
                  ].map(b => (
                    <div key={b} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> {b}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  <a href="mailto:donate@riseaxiscapital.com"
                    className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Mail className="w-4 h-4 text-green-400" /> donate@riseaxiscapital.com
                  </a>
                  <a href="tel:7022747227"
                    className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <Phone className="w-4 h-4 text-green-400" /> (702) 274-7227
                  </a>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Compliance note */}
      <section className="py-10" style={{ background: G.page }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <p className="text-[11px] leading-relaxed text-yellow-700">
                <strong>Charitable Solicitation Disclosures:</strong> RiseAxis Capital (EIN: 27-0964813) is registered to solicit charitable contributions in states where required. Copies of our financial statements are available upon request by contacting governance@riseaxiscapital.com. Contributions are used for general operations and grant programs. No goods or services are provided in exchange for contributions. RiseAxis Capital complies with all applicable federal and state charitable solicitation laws.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  )
}
