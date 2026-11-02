import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, ShieldCheck, Zap, TrendingUp, BadgeCheck, Clock, Phone,
  Pencil, X, Copy, Check, ExternalLink, Settings2, ChevronRight,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import PreApprovalEditor from '@/components/preapproval/PreApprovalEditor'
import {
  type PreApprovalConfig, configFromSearch, configToSearch, buildPreApprovalUrl, formatMoney,
} from '@/lib/preapproval'

/* ── Palette: light, premium fintech ─────────────────────────────────────── */
const P = {
  page: '#F7F9FB', white: '#FFFFFF',
  heading: '#0B1220', body: '#475569', muted: '#94A3B8', border: '#E6EAF0',
  green: '#10B981', greenDk: '#059669', greenLt: '#ECFDF5',
  black: '#0B0F19',
}

const EASE = [0.22, 1, 0.36, 1] as const

/* ── Header ─────────────────────────────────────────────────────────────── */
function Header({ cfg }: { cfg: PreApprovalConfig }) {
  return (
    <header className="sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${P.border}` }}>
      <div className="max-w-[1180px] mx-auto px-5 lg:px-8 h-[68px] flex items-center justify-between gap-6">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
          <span className="text-[16px] font-extrabold tracking-tight" style={{ color: P.heading }}>{cfg.brand}</span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-semibold" style={{ color: P.body }}>
          {['Home', 'How It Works', 'Funding Options', 'Contact'].map(l => (
            <a key={l} href="#top" className="hover:text-black transition-colors">{l}</a>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {cfg.phone && (
            <a href={`tel:${cfg.phone.replace(/[^\d+]/g, '')}`}
              className="hidden lg:flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: P.heading }}>
              <Phone size={14} style={{ color: P.greenDk }} /> {cfg.phone}
            </a>
          )}
          <div className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-full text-[11.5px] font-bold"
            style={{ background: P.greenLt, color: P.greenDk, border: '1px solid #A7F3D0' }}>
            <Lock size={12} /> Secure Application
          </div>
          <div className="hidden xl:flex items-center gap-1.5 px-3 h-8 rounded-full text-[11.5px] font-bold"
            style={{ background: '#F1F5F9', color: P.body, border: `1px solid ${P.border}` }}>
            <ShieldCheck size={12} /> No Hard Credit Check
          </div>
        </div>
      </div>
    </header>
  )
}

/* ── The pre-approval modal (hero element) ───────────────────────────────── */
function PreApprovalModal({ cfg }: { cfg: PreApprovalConfig }) {
  const external = /^https?:\/\//i.test(cfg.ctaUrl)
  const btnClass = 'block w-full h-[60px] rounded-full text-[17px] font-semibold text-white text-center leading-[60px] transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30'
  const btnStyle = { background: P.black, boxShadow: '0 10px 24px -8px rgba(11,15,25,0.55)' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
      className="w-full max-w-[600px] mx-auto rounded-[22px] overflow-hidden"
      style={{
        background: P.white,
        boxShadow: '0 30px 70px -20px rgba(2,6,23,0.28), 0 8px 24px -10px rgba(2,6,23,0.12), 0 0 0 1px rgba(2,6,23,0.04)',
      }}
      role="dialog" aria-labelledby="preapproval-title">
      {/* Green bar */}
      <div className="px-8 py-4 text-center text-white text-[19px] font-semibold tracking-tight"
        style={{ background: `linear-gradient(180deg, ${P.green}, ${P.greenDk})` }}>
        Congratulations{cfg.name ? `, ${cfg.name}` : ','}
      </div>

      <div className="px-7 sm:px-10 pt-8 pb-9">
        {cfg.company && (
          <div className="text-[13px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: P.muted }}>
            for {cfg.company}
          </div>
        )}
        <h2 id="preapproval-title" className="font-extrabold tracking-tight leading-none mb-7"
          style={{ color: P.heading, fontSize: 'clamp(26px, 4.6vw, 40px)' }}>
          Pre-approval:{' '}
          <span style={{ whiteSpace: 'nowrap' }}>{formatMoney(cfg.amount)}</span>
        </h2>

        {external
          ? <a href={cfg.ctaUrl} className={btnClass} style={btnStyle}>{cfg.cta}</a>
          : <Link to={cfg.ctaUrl || '/register'} className={btnClass} style={btnStyle}>{cfg.cta}</Link>}

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[12px]" style={{ color: P.muted }}>
          <Lock size={12} /> 256-bit encrypted · No obligation · No impact to credit score
        </div>
      </div>
    </motion.div>
  )
}

/* ── Admin edit drawer ───────────────────────────────────────────────────── */
function EditDrawer({ cfg, onChange, onClose }: {
  cfg: PreApprovalConfig
  onChange: (c: PreApprovalConfig) => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url = buildPreApprovalUrl(cfg)

  async function copy() {
    try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(2,6,23,0.35)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[420px] flex flex-col"
        style={{ background: P.white, boxShadow: '-20px 0 60px -20px rgba(2,6,23,0.35)' }}>
        <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2">
            <Settings2 size={16} style={{ color: P.greenDk }} />
            <div>
              <div className="text-[14px] font-bold" style={{ color: P.heading }}>Edit this page</div>
              <div className="text-[11px]" style={{ color: P.muted }}>Changes apply instantly and update the link</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100" aria-label="Close">
            <X size={16} style={{ color: P.body }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <PreApprovalEditor value={cfg} onChange={onChange} compact />
        </div>

        <div className="px-5 py-4 space-y-2.5 shrink-0" style={{ borderTop: `1px solid ${P.border}`, background: '#FAFBFC' }}>
          <div className="text-[11px] font-mono break-all px-3 py-2 rounded-lg" style={{ background: '#F1F5F9', color: P.body }}>
            {url}
          </div>
          <div className="flex gap-2">
            <button onClick={copy}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
              style={{ background: P.black }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy share link'}
            </button>
            <Link to="/admin/preapproval" className="h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-1.5"
              style={{ border: `1px solid ${P.border}`, color: P.heading, background: P.white }}>
              Builder <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function PreApprovalPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)

  const cfg = useMemo(() => configFromSearch(location.search), [location.search])

  function update(next: PreApprovalConfig) {
    navigate({ pathname: location.pathname, search: configToSearch(next) }, { replace: true })
  }

  // Unlisted page: keep search engines out and set a clean tab title.
  useEffect(() => {
    const prev = document.title
    document.title = `Pre-approval: ${formatMoney(cfg.amount)} · ${cfg.brand}`
    const meta = document.createElement('meta')
    meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.title = prev; meta.remove() }
  }, [cfg.amount, cfg.brand])

  const subText = cfg.sub.replace('{max}', formatMoney(cfg.max))

  const trust = [
    { icon: ShieldCheck, label: 'No Hard Credit Check',    sub: 'Soft pull only' },
    { icon: Zap,         label: `Funding in ${cfg.hours}`, sub: 'After final approval' },
    { icon: TrendingUp,  label: `Up to ${formatMoney(cfg.max)}`, sub: 'Scales with revenue' },
    { icon: BadgeCheck,  label: 'Based on Revenue, Not Credit', sub: 'Qualify on cash flow' },
  ]

  const steps = [
    { n: '01', title: 'Finish your application', text: 'Takes about 5 minutes. Tell us about your business and connect your revenue.' },
    { n: '02', title: 'Receive your final offer', text: 'A funding specialist confirms terms, usually the same business day.' },
    { n: '03', title: 'Get funded', text: `Accept, sign electronically, and funds arrive in ${cfg.hours.toLowerCase()}.` },
  ]

  return (
    <div id="top" className="min-h-screen" style={{ background: P.page, color: P.body, fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif' }}>
      <Header cfg={cfg} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* soft background wash */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: 'radial-gradient(900px 420px at 50% -10%, rgba(16,185,129,0.12), transparent 70%), linear-gradient(180deg, #FFFFFF 0%, #F7F9FB 100%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.35]" aria-hidden
          style={{ backgroundImage: 'radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)', backgroundSize: '26px 26px', maskImage: 'linear-gradient(180deg, black, transparent 80%)' }} />

        <div className="relative max-w-[1180px] mx-auto px-5 lg:px-8 pt-14 sm:pt-20 pb-16 sm:pb-24">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
            className="text-center max-w-[760px] mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 h-8 rounded-full text-[12px] font-bold mb-5"
              style={{ background: P.greenLt, color: P.greenDk, border: '1px solid #A7F3D0' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: P.green }} />
              Your pre-approval is ready
            </div>
            <h1 className="font-extrabold tracking-[-0.02em] leading-[1.05] mb-4"
              style={{ color: P.heading, fontSize: 'clamp(36px, 6vw, 62px)' }}>
              {cfg.headline}
            </h1>
            <p className="text-[16px] sm:text-[18px] leading-relaxed max-w-[620px] mx-auto" style={{ color: P.body }}>
              {subText}
            </p>
          </motion.div>

          <PreApprovalModal cfg={cfg} />

          {/* Trust row */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-[1000px] mx-auto">
            {trust.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: P.white, border: `1px solid ${P.border}`, boxShadow: '0 1px 2px rgba(2,6,23,0.04)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: P.greenLt, color: P.greenDk }}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold leading-tight" style={{ color: P.heading }}>{label}</div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: P.muted }}>{sub}</div>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-[13px]" style={{ color: P.muted }}>
            <div className="flex -space-x-2">
              {['#0EA5E9', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'].map((c, i) => (
                <span key={i} className="w-7 h-7 rounded-full ring-2 ring-white" style={{ background: c, opacity: 0.85 }} />
              ))}
            </div>
            <span>Trusted by <strong style={{ color: P.heading }}>{cfg.trusted} businesses</strong> nationwide</span>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-[1180px] mx-auto px-5 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: P.greenDk }}>How it works</div>
          <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-tight" style={{ color: P.heading }}>From pre-approval to funded in three steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {steps.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE, delay: 0.6 + i * 0.08 }}
              className="rounded-2xl p-6 transition-shadow hover:shadow-[0_12px_32px_-16px_rgba(2,6,23,0.25)]"
              style={{ background: P.white, border: `1px solid ${P.border}` }}>
              <div className="text-[12px] font-extrabold tracking-widest mb-4" style={{ color: P.greenDk }}>{s.n}</div>
              <div className="text-[17px] font-bold mb-2" style={{ color: P.heading }}>{s.title}</div>
              <p className="text-[14px] leading-relaxed" style={{ color: P.body }}>{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-[1180px] mx-auto px-5 lg:px-8 pb-20">
        <div className="rounded-[26px] px-6 sm:px-12 py-12 text-center relative overflow-hidden"
          style={{ background: P.black, color: '#fff' }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ background: 'radial-gradient(600px 260px at 50% 120%, rgba(16,185,129,0.35), transparent 70%)' }} />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: '#6EE7B7' }}>
              <Clock size={13} /> Offer valid for a limited time
            </div>
            <h3 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight mb-3">
              {formatMoney(cfg.amount)} is waiting{cfg.company ? ` for ${cfg.company}` : ''}
            </h3>
            <p className="text-[15px] mb-7 max-w-[520px] mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Complete your application now to lock in your pre-approved amount. No hard credit check, no obligation.
            </p>
            {/^https?:\/\//i.test(cfg.ctaUrl)
              ? <a href={cfg.ctaUrl} className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-semibold text-[15px] transition-all hover:brightness-110" style={{ background: P.green, color: '#fff' }}>{cfg.cta} <ChevronRight size={16} /></a>
              : <Link to={cfg.ctaUrl || '/register'} className="inline-flex items-center gap-2 h-12 px-7 rounded-full font-semibold text-[15px] transition-all hover:brightness-110" style={{ background: P.green, color: '#fff' }}>{cfg.cta} <ChevronRight size={16} /></Link>}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${P.border}`, background: P.white }}>
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px]" style={{ color: P.muted }}>
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-cover" />
            <span className="font-bold" style={{ color: P.heading }}>{cfg.brand}</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="hover:text-black">Privacy</Link>
            <Link to="/terms" className="hover:text-black">Terms</Link>
            <Link to="/contact" className="hover:text-black">Contact</Link>
          </div>
          <div className="text-center sm:text-right max-w-[420px]">
            Pre-approval is an estimate based on information provided and is not a commitment to fund. Final terms subject to review.
          </div>
        </div>
      </footer>

      {/* Admin controls */}
      {isAdmin && (
        <>
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            onClick={() => setEditing(true)}
            className="fixed bottom-5 right-5 z-30 h-12 pl-4 pr-5 rounded-full flex items-center gap-2 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: P.black, boxShadow: '0 14px 30px -10px rgba(2,6,23,0.6)' }}>
            <Pencil size={14} /> Edit page
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9.5px] uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.14)' }}>Admin</span>
          </motion.button>
          <AnimatePresence>
            {editing && <EditDrawer cfg={cfg} onChange={update} onClose={() => setEditing(false)} />}
          </AnimatePresence>
        </>
      )}

      {/* Builder shortcut hint for admins arriving at a bare /preapproval */}
      {isAdmin && !location.search && !editing && (
        <div className="fixed bottom-5 left-5 z-30 hidden md:flex items-center gap-2 text-[12px] px-3.5 h-10 rounded-full"
          style={{ background: P.white, border: `1px solid ${P.border}`, color: P.body, boxShadow: '0 8px 24px -12px rgba(2,6,23,0.3)' }}>
          Showing defaults · <Link to="/admin/preapproval" className="font-bold inline-flex items-center gap-1" style={{ color: P.greenDk }}>Open builder <ExternalLink size={12} /></Link>
        </div>
      )}
    </div>
  )
}
