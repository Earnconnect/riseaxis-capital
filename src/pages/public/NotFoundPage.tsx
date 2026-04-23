import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home, MessageSquare, Search, FileText } from 'lucide-react'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const QUICK_LINKS = [
  { icon: Home,         label: 'Home',           sub: 'Back to the main page',          to: '/' },
  { icon: FileText,     label: 'Grant Programs',  sub: 'Explore all 6 funding programs', to: '/programs' },
  { icon: MessageSquare,label: 'AI Assistant',    sub: 'Get help from our AI chatbot',   to: '/apply/chat' },
  { icon: Search,       label: 'Verify Receipt',  sub: 'Look up a payment transaction',  to: '/verify' },
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-20 text-center" style={{ background: G.page }}>

      {/* Subtle background blobs */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="fixed -bottom-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative max-w-lg w-full">

        {/* 404 display */}
        <div className="mb-8">
          <div className="text-[120px] font-bold leading-none tracking-tighter select-none"
            style={{
              background: 'linear-gradient(135deg, #E2E8F0 0%, #CBD5E1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
            404
          </div>
          <div className="w-16 h-1 rounded-full mx-auto -mt-4 mb-6"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }} />
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: G.heading }}>Page not found</h1>
        <p className="text-base leading-relaxed mb-10" style={{ color: G.body }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Quick nav */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {QUICK_LINKS.map(({ icon: Icon, label, sub, to }) => (
            <Link key={to} to={to}
              className="flex flex-col items-start gap-1.5 p-4 rounded-2xl text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                <Icon size={15} style={{ color: G.green }} />
              </div>
              <div className="text-sm font-semibold" style={{ color: G.heading }}>{label}</div>
              <div className="text-xs leading-snug" style={{ color: G.muted }}>{sub}</div>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
            style={{ background: G.white, border: `1px solid ${G.border}`, color: G.body, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to="/"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
            <Home size={16} /> Return Home
          </Link>
        </div>

        <p className="text-xs mt-8" style={{ color: G.muted }}>
          If you believe this is an error, contact us at{' '}
          <a href="mailto:grants@riseaxiscapital.com" className="underline hover:text-slate-600 transition-colors"
            style={{ color: G.muted }}>
            grants@riseaxiscapital.com
          </a>
        </p>
      </motion.div>
    </div>
  )
}
