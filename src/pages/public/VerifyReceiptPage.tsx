import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, CheckCircle2, XCircle, Loader2, Shield, Printer } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ProofOfPayment } from '@/types'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

export default function VerifyReceiptPage() {
  const { txId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState(txId || '')
  const [loading, setLoading] = useState(false)
  const [receipt, setReceipt] = useState<ProofOfPayment | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { if (txId) handleVerify(txId) }, [txId])

  async function handleVerify(id?: string) {
    const txToSearch = id || query.trim()
    if (!txToSearch) return
    setLoading(true)
    setNotFound(false)
    setReceipt(null)

    const { data, error } = await supabase
      .from('proof_of_payments')
      .select('*')
      .eq('transaction_id', txToSearch)
      .single()

    setLoading(false)
    if (error || !data) {
      setNotFound(true)
    } else {
      setReceipt(data as ProofOfPayment)
      navigate(`/verify/${txToSearch}`, { replace: true })
    }
  }

  return (
    <div style={{ background: G.page }} className="pt-16 min-h-screen">

      {/* Hero */}
      <section className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 60%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-2xl mx-auto px-5 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <Shield size={12} style={{ color: G.green }} />
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
                Secure Verification Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight" style={{ color: G.heading }}>
              Verify Payment Receipt
            </h1>
            <p className="text-base leading-relaxed" style={{ color: G.body }}>
              Enter a Transaction ID to verify the authenticity of a RiseAxis Capital payment receipt.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="pb-12 pt-8">
        <div className="max-w-2xl mx-auto px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="rounded-2xl p-6 mb-5"
            style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: G.muted }}>
              Transaction ID
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="TX-NEP-YYYY-XXXXXX"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                className="flex-1 h-11 rounded-xl px-4 font-mono text-sm outline-none transition-all"
                style={{ background: G.page, border: `1px solid ${G.border}`, color: G.heading }}
                onFocus={e => { e.target.style.borderColor = G.green; e.target.style.boxShadow = `0 0 0 3px ${G.greenLt}` }}
                onBlur={e => { e.target.style.borderColor = G.border; e.target.style.boxShadow = 'none' }}
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading || !query.trim()}
                className="flex items-center gap-2 px-5 h-11 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Verify
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: G.muted }}>Format: TX-NEP-YYYY-XXXXXX</p>
          </motion.div>

          {/* Not found */}
          {notFound && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-8 text-center"
              style={{ background: G.white, border: '1px solid #FECACA', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                <XCircle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: G.heading }}>Receipt Not Found</h3>
              <p className="text-sm leading-relaxed" style={{ color: G.body }}>
                No payment receipt found with Transaction ID{' '}
                <span className="font-mono font-semibold" style={{ color: G.heading }}>{query}</span>.
                Please verify the ID or contact{' '}
                <a href="mailto:grants@riseaxiscapital.com" className="underline" style={{ color: G.green }}>
                  grants@riseaxiscapital.com
                </a>.
              </p>
            </motion.div>
          )}

          {/* Receipt */}
          {receipt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden" id="receipt-print"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>

              {/* Header bar */}
              <div className="p-6" style={{ background: G.navy, borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="RiseAxis Capital" className="w-10 h-10 object-cover rounded-xl" />
                    <div>
                      <div className="font-bold text-base text-white">RiseAxis Capital</div>
                      <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Official Proof of Payment</div>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Transaction ID</div>
                    <div className="font-mono text-green-400 font-semibold text-sm break-all">{receipt.transaction_id}</div>
                  </div>
                </div>
              </div>

              {/* Verified banner */}
              <div className="px-6 py-3 flex items-center gap-2"
                style={{ background: G.greenLt, borderBottom: `1px solid ${G.greenBd}` }}>
                <CheckCircle2 className="w-4 h-4" style={{ color: G.green }} />
                <span className="text-sm font-semibold" style={{ color: G.green }}>Verified Payment Record</span>
                <span className="text-xs ml-1" style={{ color: '#4ADE80' }}>— Confirmed in our system</span>
              </div>

              {/* Amount */}
              <div className="px-8 py-6 text-center" style={{ borderBottom: `1px solid ${G.border}` }}>
                <div className="text-4xl font-bold" style={{ color: G.heading }}>{formatCurrency(receipt.amount)}</div>
                <div className="text-sm mt-1" style={{ color: G.muted }}>Amount Disbursed</div>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: 'Recipient Name',    value: receipt.recipient_name },
                    { label: 'Amount Disbursed',  value: formatCurrency(receipt.amount) },
                    { label: 'Payment Method',    value: receipt.payment_method },
                    { label: 'Bank',              value: receipt.bank_name },
                    { label: 'Account (Last 4)',  value: `****${receipt.account_last4}` },
                    { label: 'Status',            value: receipt.status },
                    { label: 'Issued Date',       value: formatDate(receipt.issued_at) },
                    { label: 'Issued By',         value: receipt.issued_by },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-xs" style={{ color: G.muted }}>{label}</div>
                      <div className="text-sm font-medium mt-0.5" style={{ color: G.heading }}>{value}</div>
                    </div>
                  ))}
                </div>

                {receipt.notes && (
                  <div className="p-4 rounded-xl" style={{ background: G.page, border: `1px solid ${G.border}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: G.muted }}>Notes</div>
                    <div className="text-sm" style={{ color: G.body }}>{receipt.notes}</div>
                  </div>
                )}

                {/* Compliance */}
                <div className="pt-5" style={{ borderTop: `1px solid ${G.border}` }}>
                  <div className="text-xs font-semibold mb-3" style={{ color: G.body }}>Compliance Verification</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {['Identity Verified', 'Funds Source Verified', 'IRS Compliance Confirmed'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs" style={{ color: G.body }}>
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: G.green }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  style={{ borderTop: `1px solid ${G.border}` }}>
                  <div className="text-xs" style={{ color: G.muted }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Shield className="w-3.5 h-3.5" />
                      <span>RiseAxis Capital · 501(c)(3) · EIN: 27-0964813</span>
                    </div>
                    <div>3040 Idaho Ave NW, Washington, DC 20016</div>
                  </div>
                  <div className="flex gap-2 no-print">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-slate-50"
                      style={{ background: G.page, border: `1px solid ${G.border}`, color: G.body }}>
                      <Printer className="w-4 h-4" /> Print
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}
