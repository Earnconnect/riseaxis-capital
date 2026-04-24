import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Lock, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const [show, setShow]     = useState(false)
  const [error, setError]   = useState('')
  const { signIn }          = useAuth()
  const navigate            = useNavigate()
  const location            = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await signIn(data.email, data.password)
    if (error) setError(error.message || 'Invalid email or password. Please try again.')
    else navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070B18' }}>

      {/* Left — photo hero panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative overflow-hidden p-12">
        {/* Photo */}
        <img src="/login.webp" alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center" />
        {/* Dark overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(7,11,24,0.82) 0%, rgba(12,26,54,0.75) 60%, rgba(7,24,40,0.85) 100%)' }} />

        {/* Content */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl" />
            <div>
              <div className="text-sm font-bold text-white">RiseAxis Capital</div>
              <div className="text-[9px] text-white/35 uppercase tracking-widest">Grant Funding Program</div>
            </div>
          </Link>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Empowering Lives<br />
              <span className="gradient-text-green">Through Grants</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              Sign in to your applicant portal to track applications, receive updates, and manage your grants.
            </p>
          </motion.div>

          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="space-y-4">
            {[
              { icon: Shield,       text:'501(c)(3) certified nonprofit organization' },
              { icon: Lock,        text:'256-bit SSL bank-grade encryption' },
              { icon: CheckCircle2, text:'IRS compliant grant management' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)' }}>
                  <Icon className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative text-[10px] text-white/25 leading-relaxed">
          EIN: 27-0964813 · 3040 Idaho Ave NW, Washington, DC 20016<br />
          Grants over $600 subject to IRS 1099-MISC reporting.
        </div>
      </div>

      {/* Right — glass form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        {/* Subtle bg accent */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background:'radial-gradient(ellipse at 60% 40%, rgba(34,197,94,0.06), transparent 60%)' }} />

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.5 }}
          className="w-full max-w-sm relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <img src="/logo.png" alt="RiseAxis Capital" className="w-8 h-8 object-cover rounded-xl" />
            <div className="text-sm font-bold text-white">RiseAxis Capital</div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In</h1>
            <p className="text-sm text-white/45 mt-1">Access your applicant portal account</p>
          </div>

          <div className="glass-card p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                  className="px-4 py-3 rounded-xl text-sm text-red-300"
                  style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-white/50 uppercase tracking-wide">Email Address</Label>
                <Input id="email" type="email" placeholder="you@example.com"
                  className="glass-input h-11 rounded-xl text-white"
                  {...register('email')} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-white/50 uppercase tracking-wide">Password</Label>
                  <Link to="/forgot-password" className="text-[11px] text-green-400/70 hover:text-green-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input id="password" type={show ? 'text' : 'password'} placeholder="••••••••"
                    className="glass-input h-11 rounded-xl text-white pr-10"
                    {...register('password')} />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background:'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow:'0 4px 20px rgba(34,197,94,0.35)' }}>
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                  : <>Sign In <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <div className="mt-6 pt-5 text-center text-xs text-white/35"
              style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                Create one free
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5">
            <Link to="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to home</Link>
            <span className="text-xs text-white/25">256-bit SSL · EIN: 27-0964813</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
