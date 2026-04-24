import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="fixed bottom-0 left-0 right-0 z-[100]"
          style={{ background: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)' }}>
                <Cookie className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                We use cookies to enhance your experience, analyze site traffic, and personalize content.
                See our{' '}
                <Link to="/privacy" className="underline hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Privacy Policy
                </Link>{' '}
                for details.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={accept}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                Manage Preferences
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                Accept All
              </button>
              <button onClick={accept} className="p-1.5 rounded-lg transition-colors hover:bg-white/10 text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
