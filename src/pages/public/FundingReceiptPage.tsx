import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, X, Copy, Check, Printer, Settings2, ChevronRight, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import FundingReceipt from '@/components/receipt/FundingReceipt'
import FundingReceiptEditor from '@/components/receipt/FundingReceiptEditor'
import {
  type FundingReceiptConfig, receiptFromSearch, receiptToSearch, buildReceiptUrl, receiptTotal, formatMoney,
} from '@/lib/fundingReceipt'

const P = { page: '#F7F9FB', white: '#FFFFFF', heading: '#0B1220', body: '#475569', muted: '#94A3B8', border: '#E6EAF0', black: '#0B0F19', green: '#059669' }

const PRINT_CSS = `@media print { .no-print { display: none !important } body { background: #fff !important } }`

function EditDrawer({ cfg, onChange, onClose }: { cfg: FundingReceiptConfig; onChange: (c: FundingReceiptConfig) => void; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const url = buildReceiptUrl(cfg)
  async function copy() {
    try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  return (
    <>
      <motion.div className="fixed inset-0 z-40 no-print" style={{ background: 'rgba(2,6,23,0.35)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[440px] flex flex-col no-print" style={{ background: P.white, boxShadow: '-20px 0 60px -20px rgba(2,6,23,0.35)' }}>
        <div className="flex items-center justify-between px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2">
            <Settings2 size={16} style={{ color: P.green }} />
            <div>
              <div className="text-[14px] font-bold" style={{ color: P.heading }}>Edit this receipt</div>
              <div className="text-[11px]" style={{ color: P.muted }}>Changes apply instantly and update the link</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100" aria-label="Close"><X size={16} style={{ color: P.body }} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5"><FundingReceiptEditor value={cfg} onChange={onChange} /></div>
        <div className="px-5 py-4 space-y-2.5 shrink-0" style={{ borderTop: `1px solid ${P.border}`, background: '#FAFBFC' }}>
          <div className="flex gap-2">
            <button onClick={copy} className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 hover:brightness-110" style={{ background: P.black }}>
              {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy share link'}
            </button>
            <Link to="/admin/receipt" className="h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-1.5" style={{ border: `1px solid ${P.border}`, color: P.heading, background: P.white }}>
              Builder <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default function FundingReceiptPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [editing, setEditing] = useState(false)
  const cfg = useMemo(() => receiptFromSearch(location.search), [location.search])

  function update(next: FundingReceiptConfig) {
    navigate({ pathname: location.pathname, search: receiptToSearch(next) }, { replace: true })
  }

  useEffect(() => {
    const prev = document.title
    document.title = `Funding Receipt · ${formatMoney(receiptTotal(cfg))} · ${cfg.brand}`
    const meta = document.createElement('meta'); meta.name = 'robots'; meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => { document.title = prev; meta.remove() }
  }, [cfg])

  return (
    <div className="min-h-screen" style={{ background: P.page, fontFamily: '"Plus Jakarta Sans", Inter, system-ui, sans-serif' }}>
      <style>{PRINT_CSS}</style>

      <header className="no-print sticky top-0 z-30" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${P.border}` }}>
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-[16px] font-extrabold tracking-tight" style={{ color: P.heading }}>{cfg.brand}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-8 rounded-full text-[11.5px] font-bold" style={{ background: '#ECFDF5', color: P.green, border: '1px solid #A7F3D0' }}>
              <Lock size={12} /> Verified funding record
            </div>
            <button onClick={() => window.print()} className="h-9 px-3.5 rounded-xl text-[12.5px] font-semibold flex items-center gap-1.5" style={{ border: `1px solid ${P.border}`, color: P.heading, background: P.white }}>
              <Printer size={14} /> <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="absolute inset-x-0 top-0 h-[360px] pointer-events-none" aria-hidden
          style={{ background: 'radial-gradient(700px 300px at 50% -20%, rgba(22,163,74,0.10), transparent 70%)' }} />
        <div className="relative max-w-[1180px] mx-auto px-5 lg:px-8 py-10 sm:py-14">
          <FundingReceipt cfg={cfg} />
        </div>
      </main>

      <footer className="no-print" style={{ borderTop: `1px solid ${P.border}`, background: P.white }}>
        <div className="max-w-[1180px] mx-auto px-5 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]" style={{ color: P.muted }}>
          <span>© {new Date().getFullYear()} {cfg.brand}</span>
          <div className="flex items-center gap-5">
            <Link to="/verify" className="hover:text-black">Verify a payment</Link>
            <Link to="/privacy" className="hover:text-black">Privacy</Link>
            <Link to="/contact" className="hover:text-black">Contact</Link>
          </div>
        </div>
      </footer>

      {isAdmin && (
        <>
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} onClick={() => setEditing(true)}
            className="no-print fixed bottom-5 right-5 z-30 h-12 pl-4 pr-5 rounded-full flex items-center gap-2 text-[13px] font-bold text-white hover:-translate-y-0.5 transition-all"
            style={{ background: P.black, boxShadow: '0 14px 30px -10px rgba(2,6,23,0.6)' }}>
            <Pencil size={14} /> Edit receipt
            <span className="ml-1 px-1.5 py-0.5 rounded-md text-[9.5px] uppercase tracking-wider" style={{ background: 'rgba(255,255,255,0.14)' }}>Admin</span>
          </motion.button>
          <AnimatePresence>{editing && <EditDrawer cfg={cfg} onChange={update} onClose={() => setEditing(false)} />}</AnimatePresence>
        </>
      )}
    </div>
  )
}
