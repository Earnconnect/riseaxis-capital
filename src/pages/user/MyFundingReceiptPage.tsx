import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Loader2, Check, Printer, Share2, FileText, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import FundingReceipt from '@/components/receipt/FundingReceipt'
import { type FundingReceiptConfig, receiptFromRecords, buildReceiptUrl } from '@/lib/fundingReceipt'
import { loadSavedReceipt } from '@/lib/fundingReceiptStore'
import type { GrantApplication, ProofOfPayment } from '@/types'

const T = { white: '#FFFFFF', border: '#EDE9E3', heading: '#0F172A', sub: '#64748B', muted: '#94A3B8', green: '#059669', greenLt: '#ECFDF5', black: '#0B0F19' }
const PRINT_CSS = `@media print { .no-print, aside, header, nav { display: none !important } body { background: #fff !important } }`

export default function MyFundingReceiptPage() {
  const { user, profile } = useAuth()
  const [cfg, setCfg] = useState<FundingReceiptConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      // Admin-saved override wins; otherwise generate from records.
      const saved = await loadSavedReceipt(user.id)
      if (saved) { setCfg(saved); setLoading(false); return }

      const [{ data: apps }, { data: pays }] = await Promise.all([
        supabase.from('grant_applications').select('*').eq('user_id', user.id).in('status', ['approved', 'disbursed']).order('created_at', { ascending: false }),
        supabase.from('proof_of_payments').select('*').eq('user_id', user.id),
      ])
      const built = receiptFromRecords((apps ?? []) as GrantApplication[], (pays ?? []) as ProofOfPayment[], { recipient: profile?.full_name ?? '' })
      setCfg(built.entities.length ? built : null)
      setLoading(false)
    })()
  }, [user, profile?.full_name])

  async function copy() {
    if (!cfg) return
    try { await navigator.clipboard.writeText(buildReceiptUrl(cfg)) } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">
      <style>{PRINT_CSS}</style>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="no-print flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>My Funding</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Funding Receipt</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>A shareable summary of the funding approved and disbursed to you.</p>
        </div>
        {cfg && (
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="h-10 px-4 rounded-xl text-[13px] font-semibold flex items-center gap-2" style={{ border: `1px solid ${T.border}`, color: T.heading, background: T.white }}>
              <Printer size={14} /> Print
            </button>
            <button onClick={copy} className="h-10 px-4 rounded-xl text-[13px] font-semibold text-white flex items-center gap-2 hover:brightness-110" style={{ background: T.black }}>
              {copied ? <Check size={14} /> : <Share2 size={14} />} {copied ? 'Link copied' : 'Share link'}
            </button>
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-24" style={{ color: T.muted }}><Loader2 size={22} className="animate-spin" /></div>
      ) : !cfg ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-10 text-center max-w-[560px] mx-auto" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: T.greenLt, color: T.green }}><FileText size={24} /></div>
          <div className="text-[17px] font-bold mb-1.5" style={{ color: T.heading }}>No funding on record yet</div>
          <p className="text-[13.5px] mb-5" style={{ color: T.sub }}>Your funding receipt appears here as soon as an application is approved. Until then, you can track your applications below.</p>
          <Link to="/applications" className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl text-[13px] font-semibold text-white" style={{ background: T.black }}>
            My applications <ArrowRight size={14} />
          </Link>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[26px] px-5 sm:px-10 py-8 sm:py-10" style={{ background: '#F7F9FB', border: `1px solid ${T.border}` }}>
          <FundingReceipt cfg={cfg} />
          <div className="no-print mt-6 text-center text-[12px]" style={{ color: T.muted }}>
            Need a correction? <Link to="/support" className="font-semibold" style={{ color: T.green }}>Contact support</Link> and reference your receipt number.
          </div>
        </motion.div>
      )}
    </div>
  )
}
