import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, BookOpen, Info, Phone, ShieldCheck, FileText,
  BarChart2, Newspaper, Briefcase, Library, HelpCircle,
  Scale, Handshake, Heart, AlertOctagon, Accessibility,
  Map, Users, LogIn, UserPlus, Lock, LayoutDashboard,
  FilePlus, Bell, Settings, User, Wallet, MessageSquare,
  CheckCircle, ExternalLink,
} from 'lucide-react'

const G = {
  navy:   '#0F172A',
  page:   '#F8FAFC',
  white:  '#FFFFFF',
  green:  '#16A34A',
  border: '#E2E8F0',
}

const FadeUp = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45, delay }}
  >
    {children}
  </motion.div>
)

interface SitemapLink {
  to: string
  label: string
  icon: React.ElementType
  description: string
}

interface SitemapSection {
  title: string
  color: string
  links: SitemapLink[]
  protected?: boolean
}

const SECTIONS: SitemapSection[] = [
  {
    title: 'Main Pages',
    color: G.green,
    links: [
      { to: '/',         label: 'Home',              icon: Home,         description: 'Overview, programs, stats & newsletter' },
      { to: '/programs', label: 'Grant Programs',    icon: BookOpen,     description: 'All 6 programs, eligibility quiz & comparison' },
      { to: '/about',    label: 'About Us',          icon: Info,         description: 'Mission, team & board of directors' },
      { to: '/contact',  label: 'Contact',           icon: Phone,        description: 'Phone, email & contact form' },
      { to: '/stories',  label: 'Success Stories',   icon: CheckCircle,  description: 'Real grant recipient testimonials' },
    ],
  },
  {
    title: 'Resources & Tools',
    color: '#7C3AED',
    links: [
      { to: '/track',       label: 'Track Application', icon: Map,         description: 'Look up any application by reference number' },
      { to: '/verify',      label: 'Verify Receipt',    icon: ShieldCheck, description: 'Confirm authenticity of a payment receipt' },
      { to: '/apply/chat',  label: 'AI Assistant',      icon: MessageSquare, description: 'AI-powered grant guidance chatbot' },
      { to: '/faq',         label: 'FAQ',               icon: HelpCircle,  description: '20+ questions across 5 categories' },
      { to: '/resources',   label: 'Resource Center',   icon: Library,     description: 'Downloadable guides and toolkits' },
    ],
  },
  {
    title: 'Transparency & Governance',
    color: '#0891B2',
    links: [
      { to: '/governance', label: 'Governance',       icon: Scale,          description: 'Form 990, board meetings & audit reports' },
      { to: '/impact',     label: 'Impact Report',    icon: BarChart2,      description: 'Disbursement stats and program outcomes' },
      { to: '/partners',   label: 'Partners',         icon: Handshake,      description: 'Foundation, federal & corporate partners' },
      { to: '/donate',     label: 'Donate',           icon: Heart,          description: 'Support the mission as a contributor' },
      { to: '/news',       label: 'News & Media',     icon: Newspaper,      description: 'Press releases and program announcements' },
    ],
  },
  {
    title: 'Organization',
    color: '#D97706',
    links: [
      { to: '/careers',        label: 'Careers',         icon: Briefcase,    description: 'Open positions and how to apply' },
      { to: '/fraud-warning',  label: 'Fraud Warning',   icon: AlertOctagon, description: 'How to spot and report scams' },
      { to: '/accessibility',  label: 'Accessibility',   icon: Accessibility,description: 'WCAG 2.1 AA compliance statement' },
      { to: '/privacy',        label: 'Privacy Policy',  icon: ShieldCheck,  description: 'Data collection and usage policy' },
      { to: '/terms',          label: 'Terms of Service',icon: FileText,     description: 'Platform terms and conditions' },
    ],
  },
  {
    title: 'Account & Portal',
    color: '#DC2626',
    protected: true,
    links: [
      { to: '/login',        label: 'Sign In',           icon: LogIn,          description: 'Log into your applicant account' },
      { to: '/register',     label: 'Create Account',    icon: UserPlus,       description: 'Register as a new applicant' },
      { to: '/forgot-password', label: 'Reset Password', icon: Lock,           description: 'Request a password reset email' },
      { to: '/dashboard',    label: 'Dashboard',         icon: LayoutDashboard,description: 'Your application overview (login required)' },
      { to: '/apply',        label: 'Apply Online',      icon: FilePlus,       description: 'Start or resume a grant application' },
      { to: '/applications', label: 'My Applications',   icon: FileText,       description: 'View status and details of all submissions' },
      { to: '/wallet',       label: 'Wallet',            icon: Wallet,         description: 'Approved funds and withdrawal history' },
      { to: '/notifications',label: 'Notifications',     icon: Bell,           description: 'Status updates and admin messages' },
      { to: '/profile',      label: 'Profile',           icon: User,           description: 'Personal information and completeness' },
      { to: '/settings',     label: 'Settings',          icon: Settings,       description: 'Notification preferences and password' },
    ],
  },
]

const colorMap: Record<string, string> = {
  [G.green]:  '#F0FDF4',
  '#7C3AED':  '#F5F3FF',
  '#0891B2':  '#ECFEFF',
  '#D97706':  '#FFFBEB',
  '#DC2626':  '#FEF2F2',
}

export default function SitemapPage() {
  const totalLinks = SECTIONS.reduce((acc, s) => acc + s.links.length, 0)

  return (
    <div style={{ background: G.white }}>

      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${G.navy} 0%, #1E3A5F 100%)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 pt-28 pb-16 relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 mb-6"
              style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.25)' }}>
              <Map size={11} /> Site Navigation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Sitemap</h1>
            <p className="text-white/50 max-w-lg">
              Every page on the RiseAxis Capital platform — {totalLinks} links across {SECTIONS.length} categories.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Sections */}
      <section style={{ background: G.page }} className="py-16">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {SECTIONS.map((section, si) => (
              <FadeUp key={section.title} delay={si * 0.07}>
                <div className="rounded-2xl overflow-hidden" style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>

                  {/* Section header */}
                  <div className="px-5 py-4 flex items-center justify-between" style={{ background: colorMap[section.color] || '#F8FAFC', borderBottom: `1px solid ${G.border}` }}>
                    <h2 className="font-bold text-sm" style={{ color: G.navy }}>{section.title}</h2>
                    <div className="flex items-center gap-2">
                      {section.protected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                          Auth Required
                        </span>
                      )}
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: `${section.color}15`, color: section.color, border: `1px solid ${section.color}25` }}>
                        {section.links.length} pages
                      </span>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="divide-y" style={{ borderColor: G.border }}>
                    {section.links.map(link => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center gap-3 px-5 py-3.5 group transition-colors hover:bg-slate-50"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                            style={{ background: `${section.color}10` }}>
                            <Icon size={13} style={{ color: section.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold transition-colors group-hover:text-green-600" style={{ color: G.navy }}>
                              {link.label}
                            </div>
                            <div className="text-xs truncate" style={{ color: '#94A3B8' }}>{link.description}</div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono" style={{ color: '#CBD5E1' }}>{link.to}</span>
                            <ExternalLink size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: G.green }} />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom note */}
      <section style={{ background: G.white, borderTop: `1px solid ${G.border}` }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
          <p className="text-xs text-center" style={{ color: '#94A3B8' }}>
            Can't find what you're looking for?{' '}
            <Link to="/contact" className="underline hover:text-slate-600" style={{ color: G.green }}>Contact us</Link>{' '}
            or try our{' '}
            <Link to="/faq" className="underline hover:text-slate-600" style={{ color: G.green }}>FAQ page</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
