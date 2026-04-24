import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, CreditCard, DollarSign, Users, Calendar, Eye, Download } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import type { ProofOfPayment } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const KPI_DEFS = [
  { label:'Total Disbursed', icon: DollarSign, bg:'#F0FDF4', color:'#16A34A', border:'#BBF7D0', prefix:'$' },
  { label:'Unique Payees',   icon: Users,      bg:'#EFF6FF', color:'#3B82F6', border:'#BFDBFE', prefix:'' },
  { label:'This Month',      icon: Calendar,   bg:'#FFFBEB', color:'#F59E0B', border:'#FDE68A', prefix:'' },
]

export default function PaymentDashboard() {
  const [receipts, setReceipts] = useState<ProofOfPayment[]>([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { fetchReceipts() }, [])

  async function fetchReceipts() {
    const { data } = await supabase
      .from('proof_of_payments')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setReceipts(data as ProofOfPayment[])
    setLoading(false)
  }

  const filtered = receipts.filter(r =>
    !search ||
    r.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    r.transaction_id.toLowerCase().includes(search.toLowerCase()) ||
    r.recipient_email.toLowerCase().includes(search.toLowerCase())
  )

  const totalDisbursed = receipts.reduce((s, r) => s + r.amount, 0)
  const uniquePayees   = new Set(receipts.map(r => r.recipient_email)).size
  const thisMonth      = receipts.filter(r => {
    const d = new Date(r.created_at), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const kpiValues = [Math.round(totalDisbursed), uniquePayees, thisMonth]

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Administration</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Payments</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>Manage proof of payment receipts</p>
        </motion.div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button onClick={() => {
            const rows = filtered.map(r => ({
              transaction_id: r.transaction_id, recipient_name: r.recipient_name,
              recipient_email: r.recipient_email, amount: r.amount,
              payment_method: r.payment_method, bank_name: r.bank_name,
              status: r.status, issued_at: r.issued_at?.slice(0,10),
            }))
            if (!rows.length) return
            const headers = Object.keys(rows[0])
            const csv = [headers, ...rows.map(r => headers.map(h => `"${(r as Record<string,unknown>)[h] ?? ''}"`))]
              .map(r => r.join(',')).join('\n')
            const a = document.createElement('a')
            a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
            a.download = `payments-${new Date().toISOString().slice(0,10)}.csv`
            a.click()
          }}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: T.sub, border: `1px solid ${T.border}` }}>
            <Download size={13} /> Export CSV
          </button>
          <Link to="/admin/payments/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
            <Plus className="w-4 h-4" /> Create Receipt
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {KPI_DEFS.map((def, i) => (
          <motion.div key={def.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: def.bg, border: `1px solid ${def.border}` }}>
              <def.icon size={16} style={{ color: def.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: T.heading }}>
                {def.prefix === '$' ? formatCurrency(kpiValues[i]) : kpiValues[i].toLocaleString()}
              </div>
              <div className="text-xs font-medium mt-0.5" style={{ color: T.muted }}>{def.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="rounded-2xl p-4"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.muted }} />
          <input
            placeholder="Search recipient, transaction ID, or email…"
            className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
            style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
            onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                <div className="h-4 w-32 rounded bg-slate-100" />
                <div className="h-4 w-36 rounded bg-slate-100 flex-1" />
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
              <CreditCard className="w-7 h-7" style={{ color: T.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: T.sub }}>No payment receipts found</p>
            <Link to="/admin/payments/new"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-95"
              style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
              Create First Receipt
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden">
              {filtered.map((r, i) => (
                <Link key={r.id} to={`/admin/payments/${r.id}`}
                  className="flex items-start gap-3 px-4 py-4 transition-colors active:bg-slate-50"
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: T.greenLt }}>
                    <CreditCard size={14} style={{ color: T.green }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: '#F1F5F9', color: T.sub }}>{r.transaction_id}</span>
                      <Badge variant="approved" className="text-[10px]">{r.status}</Badge>
                    </div>
                    <div className="font-semibold text-sm truncate" style={{ color: T.heading }}>{r.recipient_name}</div>
                    <div className="text-xs truncate" style={{ color: T.muted }}>{r.recipient_email}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-bold" style={{ color: T.green }}>{formatCurrency(r.amount)}</span>
                      <span style={{ color: T.muted }}>·</span>
                      <span className="text-xs" style={{ color: T.sub }}>{r.payment_method}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px]" style={{ color: T.muted }}>{formatDateShort(r.issued_at)}</div>
                    <Eye size={13} className="mt-2 ml-auto" style={{ color: T.muted }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                    {['Transaction ID','Recipient','Amount','Method','Status','Date',''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="group transition-colors hover:bg-slate-50"
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] px-2 py-1 rounded-lg"
                          style={{ background: '#F1F5F9', color: T.sub }}>
                          {r.transaction_id}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sm" style={{ color: T.heading }}>{r.recipient_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.muted }}>{r.recipient_email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-sm" style={{ color: T.green }}>
                        {formatCurrency(r.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: T.sub }}>{r.payment_method}</td>
                      <td className="px-5 py-3.5"><Badge variant="approved">{r.status}</Badge></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: T.muted }}>{formatDateShort(r.issued_at)}</td>
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/payments/${r.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold"
                          style={{ color: T.green }}>
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
