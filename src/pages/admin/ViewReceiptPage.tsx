import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Printer, CheckCircle2, Shield } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { ProofOfPayment } from '@/types'

const T = {
  card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

export default function ViewReceiptPage() {
  const { id } = useParams()
  const [receipt, setReceipt] = useState<ProofOfPayment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    supabase.from('proof_of_payments').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setReceipt(data as ProofOfPayment); setLoading(false) })
  }, [id])

  if (loading) return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-2xl space-y-5">
        <div className="flex justify-between">
          <div className="h-8 w-16 rounded animate-pulse bg-slate-100" />
          <div className="h-8 w-20 rounded animate-pulse bg-slate-100" />
        </div>
        <div className="rounded-2xl overflow-hidden animate-pulse"
          style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <div className="h-20 bg-slate-100" />
          <div className="h-10 bg-slate-50" />
          <div className="py-8 flex flex-col items-center gap-2">
            <div className="h-10 w-36 rounded bg-slate-100" />
            <div className="h-3 w-24 rounded bg-slate-100" />
          </div>
          <div className="p-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 rounded bg-slate-100" />
                  <div className="h-4 w-32 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!receipt) return (
    <div className="text-center py-24" style={{ color: T.muted }}>Receipt not found.</div>
  )

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-2xl space-y-5">

        {/* Actions row */}
        <div className="flex items-center justify-between no-print">
          <Link to="/admin/payments"
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: T.sub }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-slate-100"
            style={{ color: T.sub, border: `1px solid ${T.border}` }}>
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>

        {/* Receipt card — kept dark/branded for printability */}
        <div className="rounded-2xl overflow-hidden shadow-lg" id="receipt-print"
          style={{ background: '#0F172A' }}>

          {/* Header bar */}
          <div className="p-6" style={{ background: 'linear-gradient(135deg, #0C1A36, #071828)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="RiseAxis Capital" className="w-10 h-10 object-cover rounded-xl" />
                <div>
                  <div className="font-bold text-base text-white">RiseAxis Capital</div>
                  <div className="text-xs text-white/50">Official Proof of Payment</div>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs text-white/40">Transaction ID</div>
                <div className="font-mono text-white font-semibold text-sm break-all">{receipt.transaction_id}</div>
              </div>
            </div>
          </div>

          {/* Status banner */}
          <div className="px-6 py-3 flex items-center gap-2"
            style={{ background: 'rgba(22,163,74,0.1)', borderBottom: '1px solid rgba(22,163,74,0.2)' }}>
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm font-semibold text-green-400">Completed Payment</span>
          </div>

          {/* Amount */}
          <div className="px-8 py-6 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-4xl font-bold text-white">{formatCurrency(receipt.amount)}</div>
            <div className="text-sm text-white/40 mt-1">Amount Disbursed</div>
          </div>

          {/* Details grid */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                { label: 'Recipient Name',    value: receipt.recipient_name },
                { label: 'Recipient Email',   value: receipt.recipient_email },
                { label: 'Payment Method',    value: receipt.payment_method },
                { label: 'Bank',              value: receipt.bank_name },
                { label: 'Account (Last 4)',  value: `****${receipt.account_last4}` },
                { label: 'Status',            value: receipt.status },
                { label: 'Issued Date',       value: formatDate(receipt.issued_at) },
                { label: 'Issued By',         value: receipt.issued_by },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-white/30">{label}</div>
                  <div className="text-sm font-medium text-white/80 mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            {receipt.notes && (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">Notes</div>
                <div className="text-sm text-white/60">{receipt.notes}</div>
              </div>
            )}

            {/* Compliance */}
            <div className="pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="text-xs font-semibold text-white/50 mb-3">Compliance Verification</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {['Identity Verified','Funds Source Verified','IRS Compliance Confirmed'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-xs text-white/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-5 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 text-xs text-white/30"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>RiseAxis Capital · 501(c)(3) · EIN: 27-0964813</span>
                </div>
                <div>3040 Idaho Ave NW, Washington, DC 20016</div>
              </div>
              <div className="sm:text-right">
                <div>Verify at:</div>
                <div className="font-medium text-white/50 break-all">/verify/{receipt.transaction_id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
