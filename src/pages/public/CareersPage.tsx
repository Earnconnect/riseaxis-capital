import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, CheckCircle2, Briefcase, Users, GraduationCap,
  Heart, MapPin, Clock, DollarSign, Globe,
} from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const VOLUNTEER_ROLES = [
  {
    icon: Briefcase,
    title: 'Application Reviewer Volunteer',
    desc: 'Help our team process and pre-screen incoming grant applications. Full training provided by our Grants Manager. Ideal for individuals with nonprofit, financial, or administrative backgrounds.',
    tags: ['Remote', '5–8 hrs/week', 'Training Provided'],
    color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
  },
  {
    icon: Users,
    title: 'Community Outreach Ambassador',
    desc: 'Represent RiseAxis Capital at community events, churches, libraries, and social service offices. Help spread awareness of our grant programs to underserved communities.',
    tags: ['Local/Remote', 'Flexible Hours', 'Travel Reimbursed'],
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
  },
  {
    icon: GraduationCap,
    title: 'Financial Literacy Workshop Facilitator',
    desc: 'Lead virtual or in-person workshops on personal finance, grant writing, and nonprofit resources for underserved communities. Materials and curriculum provided.',
    tags: ['Virtual/In-Person', '4 hrs/event', 'Certificate Issued'],
    color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
  },
]

const INTERNSHIP_TRACKS = [
  {
    title: 'Public Policy & Nonprofit Management',
    desc: 'Work directly with the Executive Director on policy compliance, grant reporting, and organizational governance. Ideal for students in nonprofit administration or public administration programs.',
  },
  {
    title: 'Community Finance & Economics',
    desc: 'Support our financial team in analyzing disbursement trends, preparing financial disclosures, and researching community financial impact data.',
  },
  {
    title: 'Communications & Outreach',
    desc: 'Assist with media relations, social content, community engagement campaigns, and applicant communications. Experience in communications or social work preferred.',
  },
]

const CULTURE_PHOTOS = [
  { src: '/volunteers.webp', label: 'Community-First Culture', sub: 'Purpose-driven work that matters' },
  { src: '/mission.webp',    label: 'Collaborative Team',      sub: 'Remote-friendly and inclusive' },
  { src: '/banner.webp',     label: 'Real-World Impact',       sub: 'See the results of your work' },
]

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay, duration: 0.5 }}>
      {children}
    </motion.div>
  )
}

export default function CareersPage() {
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
                Join Our Team
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 tracking-tight" style={{ color: G.heading }}>
              Build Meaningful Careers
            </h1>
            <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: G.body }}>
              We believe in the people who believe in our mission. Join a team of dedicated professionals driving real financial change across America.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ── Culture / Why us ─────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeUp>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: G.green }}>Our Culture</div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: G.heading }}>Why Work at RiseAxis Capital?</h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: G.body }}>
                We're a small, focused team that moves fast, cares deeply, and takes pride in the work we do. Every member of our staff directly contributes to outcomes that change lives.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  'Fully remote-friendly team with flexible schedules',
                  'Mission-driven culture with measurable impact metrics',
                  'Competitive nonprofit compensation + benefits package',
                  'Health coverage, dental, and 401(k) with employer match',
                  'Annual professional development budget per employee',
                  'Inclusive, diverse, and equitable workplace policies',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={15} style={{ color: G.green, flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: G.body }}>{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="rounded-3xl p-8" style={{ background: G.navy }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Organization at a Glance
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe,        label: 'States Served',   value: '36' },
                    { icon: Briefcase,    label: 'Programs Active', value: '6' },
                    { icon: Heart,        label: 'Founded',         value: '2019' },
                    { icon: Users,        label: 'Team Size',       value: '22' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl p-4 text-center"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <s.icon className="w-5 h-5 mx-auto mb-2 text-green-400" />
                      <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                      <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-6 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  501(c)(3) · EIN: 27-0964813 · Washington, DC
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Open positions ───────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="mb-10">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Employment</div>
              <h2 className="text-3xl font-bold" style={{ color: G.heading }}>Current Openings</h2>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div className="rounded-2xl p-14 text-center"
              style={{ background: G.white, border: `2px dashed ${G.border}` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: G.page, border: `1px solid ${G.border}` }}>
                <Briefcase className="w-8 h-8" style={{ color: G.muted }} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: G.heading }}>No Positions Currently Open</h3>
              <p className="text-sm leading-relaxed max-w-md mx-auto mb-6" style={{ color: G.body }}>
                We are not actively hiring at this time, but we welcome talented individuals who share our mission to join our talent pool for future opportunities.
              </p>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.25)' }}>
                Join Our Talent Pool <ArrowRight size={16} />
              </Link>
              <p className="text-xs mt-4" style={{ color: G.muted }}>Opens our contact form — select "Career Inquiry" as subject</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── Volunteer ────────────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Get Involved</div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: G.heading }}>Volunteer With Us</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: G.body }}>
                Our volunteers are essential to our mission. We offer structured roles with training, flexible schedules, and meaningful impact.
              </p>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VOLUNTEER_ROLES.map((role, i) => (
              <FadeUp key={role.title} delay={i * 0.08}>
                <div className="flex flex-col h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-md"
                  style={{ background: G.page, border: `1px solid ${G.border}` }}>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: role.bg, border: `1px solid ${role.border}` }}>
                    <role.icon size={20} style={{ color: role.color }} />
                  </div>
                  <h3 className="text-sm font-bold mb-3 leading-snug" style={{ color: G.heading }}>{role.title}</h3>
                  <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: G.body }}>{role.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {role.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                        style={{ background: role.bg, color: role.color }}>{tag}</span>
                    ))}
                  </div>
                  <Link to="/contact"
                    className="text-xs font-semibold flex items-center gap-1 hover:underline"
                    style={{ color: role.color }}>
                    Learn More <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Internship ───────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeUp>
              <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: G.green }}>Students</div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: G.heading }}>Internship Program</h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: G.body }}>
                RiseAxis Capital offers semester-long and summer internships for graduate students in nonprofit management, social work, public policy, and finance. Interns receive hands-on mentorship, real project ownership, and a letter of recommendation upon completion.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { icon: Clock,       label: 'Duration',          value: '12–16 Weeks' },
                  { icon: DollarSign,  label: 'Monthly Stipend',   value: '$1,200/mo' },
                  { icon: MapPin,      label: 'Format',            value: 'Fully Remote' },
                  { icon: Globe,       label: 'Open Window',       value: 'Jan & Aug' },
                ].map(d => (
                  <div key={d.label} className="rounded-xl p-4"
                    style={{ background: G.white, border: `1px solid ${G.border}` }}>
                    <d.icon className="w-4 h-4 mb-2" style={{ color: G.green }} />
                    <div className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: G.muted }}>{d.label}</div>
                    <div className="text-sm font-bold" style={{ color: G.heading }}>{d.value}</div>
                  </div>
                ))}
              </div>
              <Link to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all hover:brightness-105"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.25)' }}>
                Apply for Internship <ArrowRight size={16} />
              </Link>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="space-y-4">
                {INTERNSHIP_TRACKS.map((track, i) => (
                  <div key={i} className="rounded-2xl p-6"
                    style={{ background: G.white, border: `1px solid ${G.border}` }}>
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                        <span className="text-[11px] font-bold" style={{ color: G.green }}>{i + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold mb-2" style={{ color: G.heading }}>{track.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: G.body }}>{track.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Culture photos ───────────────────────────────── */}
      <section className="py-20" style={{ background: G.white }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <FadeUp>
            <div className="text-center mb-12">
              <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: G.green }}>Life at RiseAxis</div>
              <h2 className="text-3xl font-bold" style={{ color: G.heading }}>Our Culture in Action</h2>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CULTURE_PHOTOS.map((photo, i) => (
              <FadeUp key={photo.label} delay={i * 0.07}>
                <div className="relative rounded-3xl overflow-hidden group" style={{ height: '280px' }}>
                  <img src={photo.src} alt={photo.label}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.75) 100%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-base font-bold text-white mb-1">{photo.label}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{photo.sub}</div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
