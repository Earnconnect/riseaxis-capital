import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, Shield, Lock, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

const schema = z.object({
  fullName: z.string().min(3, 'Enter your full legal name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await signUp(data.email, data.password, data.fullName)
    if (error) setError(error.message || 'Registration failed. Please try again.')
    else { setDone(true); setTimeout(() => navigate('/login'), 4000) }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#070B18' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm">
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)', boxShadow: '0 0 40px rgba(34,197,94,0.3)' }}>
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">Account Created!</h2>
          <p className="text-sm text-white/50 mb-8 leading-relaxed">
            Please check your email to verify your address. You'll be redirected to sign in shortly.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}>
            Go to Sign In <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#070B18' }}>

      {/* Left — animated hero panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] shrink-0 relative overflow-hidden p-12">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #070B18 0%, #0C1A36 50%, #071828 100%)'
        }} />
        {/* Glow blobs */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.4), transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-1/4 left-1/4 w-60 h-60 rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.4), transparent 70%)', filter: 'blur(50px)' }}
        />
        <div className="absolute inset-0 opacity-[0.07] dot-pattern" />

        {/* Floating particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -18, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
            className="absolute w-1 h-1 rounded-full bg-green-400"
            style={{ left: `${20 + i * 15}%`, top: `${20 + i * 12}%` }}
          />
        ))}

        {/* Content */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 mb-16">
            <img src="/logo.png" alt="RiseAxis Capital" className="w-9 h-9 object-cover rounded-xl" />
            <div>
              <div className="text-sm font-bold text-white">RiseAxis Capital</div>
              <div className="text-[9px] text-white/35 uppercase tracking-widest">Grant Funding Program</div>
            </div>
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-3xl font-bold text-white leading-tight mb-4">
              Start Your Journey<br />
              <span className="gradient-text-green">To Grant Funding</span>
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-10">
              Create your free applicant account to access all available grant programs and begin your application.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="space-y-4">
            {[
              { icon: FileText,    text: 'Apply to all available grant programs' },
              { icon: Shield,      text: 'Secure identity verification required' },
              { icon: Lock,        text: '256-bit SSL bank-grade encryption' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <Icon className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm text-white/60">{text}</span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="mt-10 p-4 rounded-2xl"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <p className="text-[11px] text-yellow-300/70 leading-relaxed">
              <span className="text-yellow-300 font-semibold">Legal Notice:</span> Grants over $600 are subject to IRS 1099-MISC reporting. Providing false information is a federal offense under 18 U.S.C. § 1001.
            </p>
          </motion.div>
        </div>

        <div className="relative text-[10px] text-white/25 leading-relaxed">
          EIN: 27-0964813 · 3040 Idaho Ave NW, Washington, DC 20016<br />
          Grants over $600 subject to IRS 1099-MISC reporting.
        </div>
      </div>

      {/* Right — glass form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(34,197,94,0.06), transparent 60%)' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}
          className="w-full max-w-sm relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <img src="/logo.png" alt="RiseAxis Capital" className="w-8 h-8 object-cover rounded-xl" />
            <div className="text-sm font-bold text-white">RiseAxis Capital</div>
          </div>

          <div className="mb-7">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-sm text-white/45 mt-1">Register to apply for grant funding</p>
          </div>

          <div className="glass-card p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="px-4 py-3 rounded-xl text-sm text-red-300"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Full Legal Name</Label>
                <Input placeholder="John Michael Smith"
                  className="glass-input h-11 rounded-xl text-white"
                  {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Email Address</Label>
                <Input type="email" placeholder="you@example.com"
                  className="glass-input h-11 rounded-xl text-white"
                  {...register('email')} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Password</Label>
                <div className="relative">
                  <Input type={show ? 'text' : 'password'} placeholder="Min. 8 characters"
                    className="glass-input h-11 rounded-xl text-white pr-10"
                    {...register('password')} />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-white/50 uppercase tracking-wide">Confirm Password</Label>
                <Input type="password" placeholder="Re-enter password"
                  className="glass-input h-11 rounded-xl text-white"
                  {...register('confirmPassword')} />
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <div className="p-3 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <p className="text-xs text-yellow-300/70 leading-relaxed">
                  Grants over $600 are subject to IRS 1099-MISC reporting. Providing false information is a federal offense.
                </p>
              </div>

              <button type="submit" disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}>
                {isSubmitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                  : <>Create Account <ArrowRight className="w-4 h-4" /></>
                }
              </button>
            </form>

            <div className="mt-6 pt-5 text-center text-xs text-white/35"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
                Sign in
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
