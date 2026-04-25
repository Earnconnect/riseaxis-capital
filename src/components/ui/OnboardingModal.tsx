import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, BookOpen, FilePlus, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const STEPS = [
  {
    icon: User,
    color: '#7C3AED',
    title: 'Complete Your Profile',
    body: 'Fill in your personal details, address, and emergency contact. A complete profile speeds up application review and unlocks all portal features.',
    action: { label: 'Go to Profile', to: '/profile' },
  },
  {
    icon: BookOpen,
    color: '#0891B2',
    title: 'Explore Grant Programs',
    body: 'We offer 6 grant programs covering emergency needs, education, medical bills, business startup, community projects, and more. Use the eligibility quiz to find your best match.',
    action: { label: 'Browse Programs', to: '/programs' },
  },
  {
    icon: FilePlus,
    color: '#16A34A',
    title: 'Submit Your Application',
    body: 'The online application takes 15–30 minutes. Save your progress as a draft and return any time. Most decisions are delivered within 7–14 business days.',
    action: { label: 'Start Application', to: '/apply' },
  },
]

const STORAGE_KEY = 'onboarding_complete'

export default function OnboardingModal() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!user) return
    const key = `${STORAGE_KEY}_${user.id}`
    if (!localStorage.getItem(key)) {
      // Small delay so the dashboard content renders first
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [user])

  function dismiss() {
    if (user) localStorage.setItem(`${STORAGE_KEY}_${user.id}`, 'true')
    setVisible(false)
  }

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md rounded-2xl overflow-hidden pointer-events-auto"
              style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', border: '1px solid #E2E8F0' }}>

              {/* Header */}
              <div className="relative px-6 pt-6 pb-5"
                style={{ background: 'linear-gradient(135deg, #0F172A, #1E3A5F)' }}>
                <button onClick={dismiss}
                  className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <X size={15} />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)' }}>
                    <Sparkles size={13} style={{ color: '#4ADE80' }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Welcome to RiseAxis Capital
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">Let's get you started</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  3 quick steps to your first grant application
                </p>

                {/* Step dots */}
                <div className="flex items-center gap-2 mt-5">
                  {STEPS.map((_, i) => (
                    <button key={i} onClick={() => setStep(i)}
                      className="transition-all rounded-full"
                      style={{
                        width: i === step ? 24 : 8,
                        height: 8,
                        background: i === step ? '#4ADE80' : i < step ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)',
                      }}
                    />
                  ))}
                  <span className="text-[10px] ml-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {step + 1} / {STEPS.length}
                  </span>
                </div>
              </div>

              {/* Step content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-6"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                      style={{ background: `${current.color}12`, border: `1px solid ${current.color}25` }}>
                      <Icon size={22} style={{ color: current.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1" style={{ color: '#0F172A' }}>{current.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{current.body}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Footer */}
              <div className="px-6 pb-6 flex items-center gap-3">
                {isLast ? (
                  <Link to={current.action.to} onClick={dismiss}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                    {current.action.label} <ChevronRight size={14} />
                  </Link>
                ) : (
                  <>
                    <Link to={current.action.to} onClick={dismiss}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-slate-100"
                      style={{ color: '#475569', border: '1px solid #E2E8F0' }}>
                      {current.action.label}
                    </Link>
                    <button onClick={() => setStep(step + 1)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
                      Next <ChevronRight size={14} />
                    </button>
                  </>
                )}
              </div>

              {/* Skip */}
              <div className="px-6 pb-5 text-center">
                <button onClick={dismiss} className="text-xs transition-colors hover:text-slate-600" style={{ color: '#94A3B8' }}>
                  Skip for now — I'll explore on my own
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
