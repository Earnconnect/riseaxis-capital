import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

const NAV_LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/programs',   label: 'Grant Programs' },
  { to: '/about',      label: 'About' },
  { to: '/contact',    label: 'Contact' },
  { to: '/verify',     label: 'Verify Receipt' },
  { to: '/apply/chat', label: 'AI Assistant' },
]

export default function PublicNavbar() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  async function handleSignOut() { await signOut(); navigate('/') }
  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav
        className="h-16 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: `1px solid ${scrolled ? '#E2E8F0' : 'rgba(226,232,240,0.6)'}`,
          boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.07)' : 'none',
        }}>
        <div className="max-w-[1440px] mx-auto px-5 lg:px-8 h-full flex items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2">
            <img src="/logo.png" alt="RiseAxis Capital" className="w-8 h-8 object-cover rounded-xl" />
            <div className="hidden sm:block">
              <div className="text-[13px] font-bold text-slate-900 leading-tight tracking-tight">RiseAxis Capital</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">Grant Funding Program</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_LINKS.map(l => {
              const active = isActive(l.to)
              return (
                <Link key={l.to} to={l.to}
                  className={`light-nav-pill ${active ? 'light-nav-pill-active' : ''}`}>
                  {l.label}
                </Link>
              )
            })}
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {user ? (
              <>
                {isAdmin && <Link to="/admin" className="light-nav-pill text-sm">Admin</Link>}
                <Link to="/dashboard" className="light-nav-pill text-sm">Dashboard</Link>
                <button onClick={handleSignOut}
                  className="text-[13px] text-slate-400 hover:text-slate-700 transition-colors px-3 py-2">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="light-nav-pill">Sign In</Link>
                <Link to="/apply"
                  className="flex items-center gap-1.5 text-[13px] font-semibold px-5 py-2.5 rounded-full text-white transition-all hover:brightness-105"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
                  Apply for Grant
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden ml-auto p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden flex flex-col bg-white"
              style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.12)', borderLeft: '1px solid #E2E8F0' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="RiseAxis Capital" className="w-7 h-7 object-cover rounded-lg" />
                  <span className="font-bold text-slate-900 text-sm">RiseAxis Capital</span>
                </div>
                <button onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_LINKS.map(l => {
                  const active = isActive(l.to)
                  return (
                    <Link key={l.to} to={l.to}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-slate-900 text-white font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}>
                      {l.label}
                    </Link>
                  )
                })}
              </div>
              <div className="p-4 space-y-2 border-t border-slate-100">
                {user ? (
                  <>
                    <Link to="/dashboard"
                      className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                      My Dashboard
                    </Link>
                    <button onClick={handleSignOut}
                      className="w-full flex items-center justify-center py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/apply"
                      className="flex items-center justify-center py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
                      Apply for Grant
                    </Link>
                    <Link to="/login"
                      className="flex items-center justify-center py-3 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
