import { Link } from 'react-router-dom'
import { Shield, Phone, Mail, MapPin } from 'lucide-react'

const PROGRAMS = [
  { label: 'Emergency Assistance',  to: '/programs#emergency' },
  { label: 'Education Support',     to: '/programs#education' },
  { label: 'Medical Expenses',      to: '/programs#medical' },
  { label: 'Community Development', to: '/programs#community' },
  { label: 'Business Funding',      to: '/programs#business' },
]

const QUICK_LINKS = [
  { label: 'About Us',       to: '/about' },
  { label: 'Contact',        to: '/contact' },
  { label: 'Apply Online',   to: '/apply' },
  { label: 'AI Assistant',   to: '/apply/chat' },
  { label: 'Verify Receipt', to: '/verify' },
  { label: 'Sign In',        to: '/login' },
]

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/logo.png" alt="RiseAxis Capital" className="w-8 h-8 object-cover rounded-xl" />
              <div>
                <div className="text-sm font-bold text-white">RiseAxis Capital</div>
                <div className="text-[9px] text-white/30 uppercase tracking-widest">Grant Funding Program</div>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed mb-5">
              Empowering individuals, families, and communities through accessible grant funding. A 501(c)(3) certified nonprofit organization.
            </p>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="tel:7022747227" className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors">
                <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span>(702) 274-7227</span>
              </a>
              <a href="mailto:grants@riseaxiscapital.com" className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors">
                <Mail className="w-3.5 h-3.5 text-green-500 shrink-0" />
                <span>grants@riseaxiscapital.com</span>
              </a>
              <div className="flex items-start gap-2 text-white/35">
                <MapPin className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                <span>3040 Idaho Ave NW<br />Washington, DC 20016</span>
              </div>
            </div>
          </div>

          {/* Grant Programs */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-4">Grant Programs</h4>
            <ul className="space-y-2.5">
              {PROGRAMS.map(p => (
                <li key={p.label}>
                  <Link to={p.to} className="text-sm text-white/35 hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-green-500 rounded-full shrink-0" />
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(l => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-white/35 hover:text-white transition-colors flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-green-500 rounded-full shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Compliance */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-green-500 mb-4">Official Credentials</h4>
            <div className="space-y-3">
              {[
                { label: '501(c)(3) Certified', sub: 'IRS-recognized nonprofit' },
                { label: 'EIN: 27-0964813',     sub: 'Federal tax ID number' },
                { label: '256-bit SSL',          sub: 'Bank-grade encryption' },
                { label: 'GDPR Compliant',       sub: 'Data privacy protected' },
              ].map(c => (
                <div key={c.label} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.2)' }}>
                    <Shield className="w-3 h-3 text-green-500" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white/70">{c.label}</div>
                    <div className="text-[11px] text-white/25">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-3 rounded-xl"
              style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
              <p className="text-[10px] text-yellow-400/50 leading-relaxed">
                Grants over $600 are subject to IRS 1099-MISC reporting. Providing false information is a federal offense under 18 U.S.C. § 1001.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-white/20">
            © {new Date().getFullYear()} RiseAxis Capital Funding Program. All rights reserved. A 501(c)(3) nonprofit.
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link to="/contact" className="hover:text-white/50 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
