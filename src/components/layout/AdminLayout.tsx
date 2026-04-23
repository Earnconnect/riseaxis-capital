import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CreditCard, LogOut,
  Menu, X, ShieldCheck, ChevronDown,
  FileText, ExternalLink, HelpCircle, ChevronRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const NAV = [
  { to: '/admin',              icon: LayoutDashboard, label: 'Overview',      exact: true },
  { to: '/admin/applications', icon: FileText,         label: 'Applications',  exact: false },
  { to: '/admin/payments',     icon: CreditCard,       label: 'Payments',      exact: false },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin':              'Overview',
  '/admin/applications': 'Applications',
  '/admin/payments':     'Payments',
}

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    supabase
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPendingCount(count ?? 0))
  }, [location.pathname])

  const initials  = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A'
  const pageTitle = Object.entries(PAGE_TITLES).find(([p]) =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  )?.[1] ?? 'Admin'

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname === to || location.pathname.startsWith(to + '/')

  async function handleSignOut() { await signOut(); navigate('/') }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/admin" className="flex items-center gap-3">
          <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-white leading-tight">RiseAxis Capital</div>
            <div className="text-[9px] uppercase tracking-widest leading-none" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Admin Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Admin badge */}
      <div className="mx-3 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
          <ShieldCheck size={12} style={{ color: '#A78BFA' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#A78BFA' }}>Admin Access</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Management
        </div>
        {NAV.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact)
          return (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative"
              style={{
                background: active ? 'rgba(139,92,246,0.15)' : 'transparent',
                color: active ? '#C4B5FD' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-violet-400" />
              )}
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? 'text-white font-semibold' : ''}>{label}</span>
              {label === 'Applications' && pendingCount > 0 && (
                <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: '#EF4444' }}>
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
            </Link>
          )
        })}

        {/* Quick Links */}
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mt-5 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Quick Links
        </div>
        <Link to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.55)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
          <ExternalLink size={15} strokeWidth={2} />
          <span>Public Site</span>
        </Link>

        {/* Help */}
        <div className="mt-4 mx-0">
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>Support</span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Grant office: Mon–Fri 9AM–6PM EST
            </p>
            <a href="tel:7022747227"
              className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              (702) 274-7227 <ExternalLink size={9} />
            </a>
          </div>
        </div>
      </nav>

      {/* User section */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="relative" ref={userMenuRef}>
          <button onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{ background: userMenuOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12px] font-semibold text-white truncate">{profile?.full_name || 'Admin'}</div>
              <div className="text-[9px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{profile?.email}</div>
            </div>
            <ChevronDown size={12} style={{ color: 'rgba(255,255,255,0.3)', transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 rounded-xl overflow-hidden z-50"
                style={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
                <div className="p-2 space-y-0.5">
                  <Link to="/" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}>
                    <ExternalLink size={12} /> Public Site
                  </Link>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="my-1" />
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400 transition-all"
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <LogOut size={12} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen" style={{ background: '#FAF8F5' }}>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 z-40"
        style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 flex flex-col md:hidden"
              style={{ background: '#0F172A', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-colors">
                <X size={16} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-5 lg:px-8"
          style={{ background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE9E3' }}>
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:inline">Home</Link>
            <ChevronRight size={12} className="text-slate-300 hidden sm:inline" />
            <span className="text-slate-400 hidden sm:inline">Admin</span>
            <ChevronRight size={12} className="text-slate-300 hidden sm:inline" />
            <span className="font-semibold text-slate-800">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', color: '#7C3AED' }}>
              <ShieldCheck size={10} /> Admin
            </div>

            <Link to="/admin/payments/new"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-all hover:brightness-105"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' }}>
              New Receipt
            </Link>

            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-16 md:pb-0">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center bg-white"
        style={{ borderTop: '1px solid #EDE9E3', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        {[
          { to: '/admin',              icon: LayoutDashboard, label: 'Overview',  exact: true },
          { to: '/admin/applications', icon: FileText,         label: 'Apps',      exact: false },
          { to: '/admin/payments',     icon: CreditCard,       label: 'Payments',  exact: false },
          { to: '/admin/payments/new', icon: ShieldCheck,      label: 'Receipt',   exact: true,  highlight: true },
        ].map(({ to, icon: Icon, label, exact, highlight }) => {
          const active = isActive(to, exact)
          return (
            <Link key={to} to={to}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-all"
              style={{ color: active ? '#8B5CF6' : '#94A3B8' }}>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-violet-500" />}
              {highlight && !active ? (
                <div className="w-10 h-10 -mt-5 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#7C3AED)', boxShadow: '0 4px 14px rgba(139,92,246,0.35)' }}>
                  <Icon size={18} className="text-white" />
                </div>
              ) : (
                <div className="relative">
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  {label === 'Apps' && pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                      style={{ background: '#EF4444' }}>
                      {pendingCount > 9 ? '9' : pendingCount}
                    </span>
                  )}
                </div>
              )}
              <span className={`text-[9px] font-semibold leading-none ${highlight && !active ? 'mt-1' : ''}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
