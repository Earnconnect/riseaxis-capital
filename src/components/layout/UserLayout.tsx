import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, MessageSquare, Bell,
  Settings, LogOut, Menu, X, Plus, ChevronDown,
  HelpCircle, ClipboardList, UserCircle, Wallet,
  ChevronRight, ExternalLink, Megaphone,
  FolderOpen, LifeBuoy, Receipt, Activity,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const NAV_MAIN = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard',        exact: true },
  { to: '/apply',          icon: FileText,        label: 'Apply for Grant',  exact: true, highlight: true },
  { to: '/applications',   icon: ClipboardList,   label: 'My Applications',  exact: false },
  { to: '/apply/chat',     icon: MessageSquare,   label: 'AI Assistant',     exact: false },
  { to: '/notifications',  icon: Bell,            label: 'Notifications',    exact: false },
  { to: '/wallet',         icon: Wallet,          label: 'My Wallet',        exact: false },
  { to: '/documents',      icon: FolderOpen,      label: 'Documents',        exact: false },
  { to: '/activity',       icon: Activity,        label: 'Activity',         exact: false },
]
const NAV_ACCOUNT = [
  { to: '/profile',        icon: UserCircle, label: 'My Profile',     exact: false },
  { to: '/settings',       icon: Settings,   label: 'Settings',       exact: false },
  { to: '/tax-documents',  icon: Receipt,    label: 'Tax Documents',  exact: false },
  { to: '/support',        icon: LifeBuoy,   label: 'Help & Support', exact: false },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/apply':         'Apply for Grant',
  '/applications':  'My Applications',
  '/apply/chat':    'AI Assistant',
  '/notifications': 'Notifications',
  '/settings':      'Account Settings',
  '/profile':       'My Profile',
  '/wallet':        'My Wallet',
  '/documents':     'Document Center',
  '/activity':      'Activity',
  '/tax-documents': 'Tax Documents',
  '/support':       'Help & Support',
}

export default function UserLayout() {
  const { profile, signOut } = useAuth()
  const location  = useLocation()
  const navigate  = useNavigate()
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [unreadCount, setUnreadCount] = useState(0)
  const [announcement, setAnnouncement] = useState<{ message: string; type: string } | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const initials   = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const firstName  = profile?.full_name?.split(' ')[0] || 'there'
  const pageTitle  = Object.entries(PAGE_TITLES).find(([p]) =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  )?.[1] ?? 'Portal'

  useEffect(() => {
    if (!profile) return
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))
  }, [profile, location.pathname])

  useEffect(() => {
    supabase
      .from('announcements')
      .select('message, type')
      .eq('active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setAnnouncement(data as { message: string; type: string }) })
  }, [])

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
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl shrink-0" />
          <div>
            <div className="text-[13px] font-bold text-white leading-tight">RiseAxis Capital</div>
            <div className="text-[9px] uppercase tracking-widest leading-none" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Grant Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Main Menu
        </div>
        {NAV_MAIN.map(({ to, icon: Icon, label, exact, highlight }) => {
          const active = isActive(to, exact)
          return (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group relative"
              style={{
                background: active ? 'rgba(22,163,74,0.15)' : highlight && !active ? 'rgba(22,163,74,0.08)' : 'transparent',
                color: active ? '#4ADE80' : 'rgba(255,255,255,0.55)',
                border: highlight && !active ? '1px solid rgba(22,163,74,0.15)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = highlight ? 'rgba(22,163,74,0.08)' : 'transparent' }}>
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-green-400" />
              )}
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? 'text-white font-semibold' : ''}>{label}</span>
              {highlight && !active && (
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">New</span>
              )}
            </Link>
          )
        })}

        <div className="text-[9px] font-bold uppercase tracking-widest px-3 mt-5 mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Account
        </div>
        {NAV_ACCOUNT.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact)
          return (
            <Link key={to} to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
              style={{
                background: active ? 'rgba(22,163,74,0.15)' : 'transparent',
                color: active ? '#4ADE80' : 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-green-400" />}
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span className={active ? 'text-white font-semibold' : ''}>{label}</span>
            </Link>
          )
        })}

        {/* Help */}
        <div className="mt-4 mx-0">
          <div className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle size={13} style={{ color: 'rgba(255,255,255,0.35)' }} />
              <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>Need help?</span>
            </div>
            <p className="text-[10px] leading-relaxed mb-2.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Contact our grant support team Mon–Fri 9AM–6PM EST.
            </p>
            <a href="tel:7022747227"
              className="flex items-center gap-1.5 text-[10px] font-semibold text-green-400 hover:text-green-300 transition-colors">
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
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[12px] font-semibold text-white truncate">{profile?.full_name || 'User'}</div>
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
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}>
                    <UserCircle size={12} /> My Profile
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all"
                    style={{ color: 'rgba(255,255,255,0.65)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}>
                    <Settings size={12} /> Settings
                  </Link>
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
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0 overflow-x-hidden">

        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-5 lg:px-8"
          style={{ background: 'rgba(250,248,245,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EDE9E3' }}>
          {/* Mobile burger */}
          <button onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            <Menu size={18} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors hidden sm:inline">Home</Link>
            <ChevronRight size={12} className="text-slate-300 hidden sm:inline" />
            <span className="font-semibold text-slate-800">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Apply CTA */}
            <Link to="/apply"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-white transition-all hover:brightness-105"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
              <Plus size={13} strokeWidth={2.5} /> New Application
            </Link>

            {/* Notifications */}
            <Link to="/notifications"
              className="relative p-2 rounded-xl transition-colors hover:bg-slate-100"
              style={{ color: '#64748B' }}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: '#DC2626', lineHeight: 1 }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
              {initials}
            </div>
          </div>
        </header>

        {/* Announcement Banner */}
        <AnimatePresence>
          {announcement && !bannerDismissed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="flex items-center justify-between gap-3 px-5 lg:px-8 py-2.5"
              style={{
                background: announcement.type === 'warning' ? '#FFFBEB' : announcement.type === 'success' ? '#F0FDF4' : '#EFF6FF',
                borderBottom: `1px solid ${announcement.type === 'warning' ? '#FDE68A' : announcement.type === 'success' ? '#BBF7D0' : '#BFDBFE'}`,
              }}>
              <div className="flex items-center gap-2">
                <Megaphone size={13} style={{ color: announcement.type === 'warning' ? '#D97706' : announcement.type === 'success' ? '#16A34A' : '#2563EB', flexShrink: 0 }} />
                <p className="text-xs font-semibold" style={{ color: announcement.type === 'warning' ? '#92400E' : announcement.type === 'success' ? '#166534' : '#1E3A5F' }}>
                  {announcement.message}
                </p>
              </div>
              <button onClick={() => setBannerDismissed(true)} className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors">
                <X size={12} style={{ color: '#94A3B8' }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page content */}
        <main className="flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
