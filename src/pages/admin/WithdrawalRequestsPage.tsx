import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowDownToLine, Building2, CreditCard, Clock, CheckCircle2,
  XCircle, DollarSign, Users, Calendar, Check, X, Loader2, AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import type { WalletTransaction, Profile } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

interface TxnWithProfile extends WalletTransaction {
  profile?: { full_name: string; email: string }
}

const statusStyle = (s: string): React.CSSProperties => {
  if (s === 'approved') return { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }
  if (s === 'pending')  return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }
  if (s === 'rejected') return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
  return {}
}

const KPI_DEFS = [
  { label: 'Pending Requests', icon: Clock,        bg: '#FFFBEB', color: '#F59E0B', border: '#FDE68A' },
  { label: 'Total Approved',   icon: DollarSign,   bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  { label: 'Total Rejected',   icon: XCircle,      bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  { label: 'This Month',       icon: Calendar,     bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
]

export default function WithdrawalRequestsPage() {
  const [txns, setTxns]         = useState<TxnWithProfile[]>([])
  const [loading, setLoading]   = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [notes, setNotes]       = useState('')
  const [actionErr, setActionErr] = useState('')

  useEffect(() => { fetchRequests() }, [])

  async function fetchRequests() {
    setLoading(true)
    const { data } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('type', 'withdrawal')
      .order('created_at', { ascending: false })

    if (!data) { setLoading(false); return }

    // Enrich with profile data
    const userIds = [...new Set((data as WalletTransaction[]).map(t => t.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds)

    const profileMap: Record<string, { full_name: string; email: string }> = {}
    if (profiles) profiles.forEach((p: Profile & { id: string }) => { profileMap[p.id] = { full_name: p.full_name, email: p.email } })

    setTxns((data as WalletTransaction[]).map(t => ({ ...t, profile: profileMap[t.user_id] })))
    setLoading(false)
  }

  async function handleApprove(txn: TxnWithProfile) {
    setActionId(txn.id)
    setActionErr('')
    // Update transaction status
    await supabase.from('wallet_transactions')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', txn.id)
    // Update wallet: add to total_withdrawn (balance was already deducted on request)
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', txn.user_id).single()
    if (wallet) {
      await supabase.from('wallets')
        .update({ total_withdrawn: (wallet.total_withdrawn + txn.amount), updated_at: new Date().toISOString() })
        .eq('user_id', txn.user_id)
    }
    // Notify user
    await supabase.from('notifications').insert({
      user_id: txn.user_id,
      type: 'disbursement',
      title: 'Withdrawal Approved',
      message: `Your ${txn.method === 'ach' ? 'ACH transfer' : 'debit card payout'} of ${formatCurrency(txn.amount)} has been approved and is being processed.`,
      read: false,
    })
    setActionId(null)
    fetchRequests()
  }

  async function handleReject(txn: TxnWithProfile) {
    setActionId(txn.id)
    setActionErr('')
    // Update transaction status + add admin notes
    await supabase.from('wallet_transactions')
      .update({ status: 'rejected', admin_notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', txn.id)
    // Restore wallet balance
    const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', txn.user_id).single()
    if (wallet) {
      await supabase.from('wallets')
        .update({ balance: (wallet.balance + txn.amount), updated_at: new Date().toISOString() })
        .eq('user_id', txn.user_id)
    }
    // Notify user
    await supabase.from('notifications').insert({
      user_id: txn.user_id,
      type: 'general',
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request of ${formatCurrency(txn.amount)} was not approved.${notes ? ` Reason: ${notes}` : ''} Your balance has been restored.`,
      read: false,
    })
    setActionId(null)
    setRejectId(null)
    setNotes('')
    fetchRequests()
  }

  const pending      = txns.filter(t => t.status === 'pending').length
  const totalApproved = txns.filter(t => t.status === 'approved').reduce((s, t) => s + t.amount, 0)
  const totalRejected = txns.filter(t => t.status === 'rejected').length
  const thisMonth = txns.filter(t => {
    const d = new Date(t.created_at), now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const kpiValues = [pending, totalApproved, totalRejected, thisMonth]

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Administration</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Withdrawal Requests</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>Review and approve user wallet withdrawal requests</p>
        </motion.div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_DEFS.map((def, i) => (
          <motion.div key={def.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: def.bg, border: `1px solid ${def.border}` }}>
              <def.icon size={16} style={{ color: def.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: T.heading }}>
                {i === 1 ? formatCurrency(kpiValues[i]) : kpiValues[i].toLocaleString()}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide mt-0.5" style={{ color: T.muted }}>{def.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 4 ? `1px solid ${T.border}` : 'none' }}>
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-36 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-16 rounded bg-slate-100" />
                <div className="h-4 w-20 rounded bg-slate-100" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
                <div className="h-8 w-24 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
              <ArrowDownToLine className="w-7 h-7" style={{ color: T.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: T.sub }}>No withdrawal requests yet</p>
            <p className="text-xs mt-1" style={{ color: T.muted }}>Requests will appear here once users submit withdrawals from their wallet</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden">
              {txns.map((t, i) => (
                <div key={t.id} className="px-4 py-4"
                  style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: t.method === 'ach' ? '#EFF6FF' : '#F5F3FF' }}>
                      {t.method === 'ach' ? <Building2 size={14} style={{ color: '#3B82F6' }} /> : <CreditCard size={14} style={{ color: '#8B5CF6' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm" style={{ color: T.heading }}>{t.profile?.full_name || 'Unknown'}</div>
                      <div className="text-xs truncate" style={{ color: T.muted }}>{t.profile?.email}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="font-bold text-sm" style={{ color: T.green }}>{formatCurrency(t.amount)}</span>
                        <span style={{ color: T.muted }}>·</span>
                        <span className="text-xs" style={{ color: T.sub }}>{t.method === 'ach' ? 'ACH' : 'Debit Card'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize"
                        style={statusStyle(t.status)}>
                        {t.status}
                      </span>
                      <div className="text-[10px] mt-1" style={{ color: T.muted }}>{formatDateShort(t.created_at)}</div>
                    </div>
                  </div>
                  {t.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(t)} disabled={actionId === t.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-105 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                        {actionId === t.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Approve
                      </button>
                      <button onClick={() => setRejectId(t.id)} disabled={actionId === t.id}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-105 disabled:opacity-60"
                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                    {['Method', 'User', 'Amount', 'Details', 'Requested', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors"
                      style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: t.method === 'ach' ? '#EFF6FF' : '#F5F3FF' }}>
                          {t.method === 'ach' ? <Building2 size={14} style={{ color: '#3B82F6' }} /> : <CreditCard size={14} style={{ color: '#8B5CF6' }} />}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sm" style={{ color: T.heading }}>{t.profile?.full_name || '—'}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.muted }}>{t.profile?.email}</div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-sm" style={{ color: T.green }}>{formatCurrency(t.amount)}</td>
                      <td className="px-5 py-3.5">
                        {t.method === 'ach' ? (
                          <div className="text-xs space-y-0.5" style={{ color: T.sub }}>
                            <div className="font-medium">{t.bank_name}</div>
                            <div style={{ color: T.muted }}>Routing: {t.routing_number} · ····{t.account_number_last4} ({t.account_type})</div>
                          </div>
                        ) : (
                          <div className="text-xs space-y-0.5" style={{ color: T.sub }}>
                            <div className="font-medium">{t.card_holder_name}</div>
                            <div style={{ color: T.muted }}>Card ····{t.card_last4}</div>
                          </div>
                        )}
                        {t.admin_notes && (
                          <div className="text-[10px] mt-1 italic" style={{ color: T.muted }}>Note: {t.admin_notes}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: T.muted }}>{formatDateShort(t.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                          style={statusStyle(t.status)}>
                          {t.status === 'approved' && <CheckCircle2 size={10} />}
                          {t.status === 'pending'  && <Clock size={10} />}
                          {t.status === 'rejected' && <XCircle size={10} />}
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {t.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleApprove(t)} disabled={actionId === t.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:brightness-105 disabled:opacity-60"
                              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                              {actionId === t.id ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Approve
                            </button>
                            <button onClick={() => setRejectId(t.id)} disabled={actionId === t.id}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all hover:brightness-105 disabled:opacity-60"
                              style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                              <X size={11} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Reject confirmation modal */}
      {rejectId && (() => {
        const t = txns.find(x => x.id === rejectId)!
        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/40" onClick={() => { setRejectId(null); setNotes('') }} />
            <div className="fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[20%] sm:w-[380px] rounded-2xl overflow-hidden"
              style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="font-bold text-sm" style={{ color: T.heading }}>Reject Withdrawal</div>
                <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                  {formatCurrency(t.amount)} from {t.profile?.full_name} — balance will be restored
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Reason (optional)</label>
                  <textarea rows={3} placeholder="Enter reason for rejection…"
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                    style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                    value={notes} onChange={e => setNotes(e.target.value)}
                    onFocus={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.background = '#fff' }}
                    onBlur={e  => { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.background = '#F8FAFC' }}
                  />
                </div>
                {actionErr && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                    <AlertCircle size={12} /> {actionErr}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setRejectId(null); setNotes('') }}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-100"
                    style={{ border: `1px solid ${T.border}`, color: T.sub }}>
                    Cancel
                  </button>
                  <button onClick={() => handleReject(t)} disabled={actionId === t.id}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105 disabled:opacity-60"
                    style={{ background: '#DC2626' }}>
                    {actionId === t.id ? 'Rejecting…' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
