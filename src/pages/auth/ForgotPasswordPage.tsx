import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16"
      style={{ background: '#070B18' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.07), transparent 60%)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }} className="w-full max-w-sm relative">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <img src="/logo.png" alt="RiseAxis Capital" className="w-8 h-8 object-cover rounded-xl" />
          <div className="text-sm font-bold text-white">RiseAxis Capital</div>
        </div>

        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-white/45">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="glass-card p-7">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                <CheckCircle2 size={26} className="text-green-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-2">Check your inbox</h2>
              <p className="text-sm text-white/45 leading-relaxed">
                If an account exists for <span className="text-white/70 font-medium">{email}</span>,
                you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-white/25 mt-4">
                Didn't receive it? Check your spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  {error}
                </motion.div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wide flex items-center gap-1.5">
                  <Mail size={11} /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="glass-input w-full h-11 rounded-xl text-white px-4 text-sm outline-none"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 text-center text-xs text-white/35"
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
              Sign in
            </Link>
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to home</Link>
        </div>
      </motion.div>
    </div>
  )
}
