import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, CreditCard, Building2,
  DollarSign, TrendingDown, TrendingUp, X, Loader2, AlertCircle,
  CheckCircle2, Clock, XCircle, Shield, ChevronDown,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency } from '@/lib/utils'
import type { Wallet as WalletType, WalletTransaction } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

type WithdrawMethod = 'ach' | 'debit_card'

const statusIcon = (s: string) => {
  if (s === 'completed' || s === 'approved') return <CheckCircle2 size={13} style={{ color: '#16A34A' }} />
  if (s === 'pending') return <Clock size={13} style={{ color: '#F59E0B' }} />
  if (s === 'rejected') return <XCircle size={13} style={{ color: '#DC2626' }} />
  return null
}

const statusStyle = (s: string): React.CSSProperties => {
  if (s === 'completed' || s === 'approved') return { background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }
  if (s === 'pending') return { background: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' }
  if (s === 'rejected') return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }
  return {}
}

export default function WalletPage() {
  const { user } = useAuth()
  const [wallet, setWallet]   = useState<WalletType | null>(null)
  const [txns, setTxns]       = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [method, setMethod]       = useState<WithdrawMethod>('ach')
  const [amount, setAmount]       = useState('')
  const [bankName, setBankName]   = useState('')
  const [routing, setRouting]     = useState('')
  const [acctNum, setAcctNum]     = useState('')
  const [acctType, setAcctType]   = useState<'checking' | 'savings'>('checking')
  const [cardName, setCardName]   = useState('')
  const [cardNum, setCardNum]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')

  useEffect(() => { if (user) fetchWallet() }, [user])

  async function fetchWallet() {
    setLoading(true)
    const [{ data: w }, { data: t }] = await Promise.all([
      supabase.from('wallets').select('*').eq('user_id', user!.id).maybeSingle(),
      supabase.from('wallet_transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    ])
    setWallet(w as WalletType | null)
    setTxns((t as WalletTransaction[]) || [])
    setLoading(false)
  }

  const balance = wallet?.balance ?? 0

  function resetForm() {
    setAmount(''); setBankName(''); setRouting(''); setAcctNum('')
    setAcctType('checking'); setCardName(''); setCardNum('')
    setFormError(''); setMethod('ach')
  }

  async function handleWithdraw() {
    setFormError('')
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) return setFormError('Enter a valid amount.')
    if (amt > balance) return setFormError(`Amount exceeds available balance of ${formatCurrency(balance)}.`)
    if (method === 'ach') {
      if (!bankName.trim()) return setFormError('Bank name is required.')
      if (!/^\d{9}$/.test(routing.trim())) return setFormError('Routing number must be 9 digits.')
      if (!acctNum.trim()) return setFormError('Account number is required.')
    } else {
      if (!cardName.trim()) return setFormError('Cardholder name is required.')
      if (!/^\d{4}$/.test(cardNum.trim())) return setFormError('Enter last 4 digits of your card.')
    }

    setSubmitting(true)

    // Deduct balance immediately (pending)
    const newBalance = balance - amt
    const { error: wErr } = await supabase.from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user!.id)
    if (wErr) { setFormError(wErr.message); setSubmitting(false); return }

    // Insert pending withdrawal transaction
    const txnRow: Record<string, unknown> = {
      wallet_id: wallet!.id,
      user_id: user!.id,
      type: 'withdrawal',
      amount: amt,
      description: method === 'ach' ? `ACH withdrawal to ${bankName}` : `Debit card payout (••••${cardNum})`,
      status: 'pending',
      method,
      ...(method === 'ach' ? {
        bank_name: bankName,
        routing_number: routing,
        account_number_last4: acctNum.slice(-4),
        account_type: acctType,
      } : {
        card_last4: cardNum,
        card_holder_name: cardName,
      }),
    }
    await supabase.from('wallet_transactions').insert(txnRow)

    // Notify admin (insert notification for any admin — just use a general approach)
    await supabase.from('notifications').insert({
      user_id: user!.id,
      type: 'general',
      title: 'Withdrawal Request Submitted',
      message: `Your ${method === 'ach' ? 'ACH bank transfer' : 'debit card payout'} request of ${formatCurrency(amt)} is pending admin review.`,
      read: false,
    })

    setSubmitting(false)
    setShowModal(false)
    resetForm()
    fetchWallet()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Account</div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>My Wallet</h1>
        <p className="text-sm mt-0.5" style={{ color: T.sub }}>View your grant funds and request withdrawals to your bank</p>
      </motion.div>

      {/* Balance hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Available Balance</span>
          </div>
          {loading ? (
            <div className="h-10 w-40 rounded-xl bg-white/10 animate-pulse" />
          ) : (
            <div className="text-4xl font-bold text-white">{formatCurrency(balance)}</div>
          )}
          <div className="grid grid-cols-2 gap-4 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Received</div>
              <div className="text-lg font-bold" style={{ color: '#4ADE80' }}>
                {loading ? '—' : formatCurrency(wallet?.total_received ?? 0)}
              </div>
            </div>
            <div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Withdrawn</div>
              <div className="text-lg font-bold text-white">
                {loading ? '—' : formatCurrency(wallet?.total_withdrawn ?? 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => { setMethod('ach'); setShowModal(true) }}
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all hover:bg-white/5"
            style={{ color: '#4ADE80', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <Building2 size={15} /> Withdraw via ACH
          </button>
          <button onClick={() => { setMethod('debit_card'); setShowModal(true) }}
            className="flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all hover:bg-white/5"
            style={{ color: '#93C5FD' }}>
            <CreditCard size={15} /> Withdraw via Card
          </button>
        </div>
      </motion.div>

      {/* Transaction history */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="font-semibold text-sm" style={{ color: T.heading }}>Transaction History</div>
          <div className="text-xs mt-0.5" style={{ color: T.muted }}>{txns.length} transaction{txns.length !== 1 ? 's' : ''}</div>
        </div>

        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
                <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-40 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-4 w-16 rounded bg-slate-100" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
              <Wallet className="w-5 h-5" style={{ color: T.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: T.sub }}>No transactions yet</p>
            <p className="text-xs mt-1" style={{ color: T.muted }}>Funds will appear here once a grant is disbursed to your wallet</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                    {['', 'Date', 'Description', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.id} style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: t.type === 'credit' ? '#F0FDF4' : '#FFF7ED' }}>
                          {t.type === 'credit'
                            ? <TrendingUp size={13} style={{ color: '#16A34A' }} />
                            : <TrendingDown size={13} style={{ color: '#F59E0B' }} />}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: T.muted }}>
                        {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm font-medium" style={{ color: T.heading }}>{t.description}</div>
                        {t.method && (
                          <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                            {t.method === 'ach' ? `ACH · ${t.bank_name || ''} ····${t.account_number_last4 || ''}` : `Card ····${t.card_last4 || ''}`}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-sm"
                        style={{ color: t.type === 'credit' ? '#16A34A' : '#0F172A' }}>
                        {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
                          style={statusStyle(t.status)}>
                          {statusIcon(t.status)} {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {txns.map((t, i) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-4"
                  style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: t.type === 'credit' ? '#F0FDF4' : '#FFF7ED' }}>
                    {t.type === 'credit'
                      ? <TrendingUp size={14} style={{ color: '#16A34A' }} />
                      : <TrendingDown size={14} style={{ color: '#F59E0B' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: T.heading }}>{t.description}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm" style={{ color: t.type === 'credit' ? '#16A34A' : T.heading }}>
                      {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                    </div>
                    <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold capitalize"
                      style={statusStyle(t.status)}>
                      {statusIcon(t.status)} {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Security badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl px-5 py-4"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { label: 'Funds FDIC Protected', sub: 'Up to $250,000' },
            { label: '256-bit Encryption', sub: 'Bank-level security' },
            { label: 'Admin Verified', sub: 'All transfers reviewed' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
              <Shield size={12} style={{ color: T.green }} />
              <div>
                <div className="text-[10px] font-bold" style={{ color: T.heading }}>{b.label}</div>
                <div className="text-[9px]" style={{ color: T.muted }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => { setShowModal(false); resetForm() }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[5%] sm:top-[8%] sm:w-[440px] rounded-2xl overflow-hidden"
              style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: T.heading }}>Request Withdrawal</div>
                  <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                    Available: <span className="font-semibold" style={{ color: T.green }}>{formatCurrency(balance)}</span>
                  </div>
                </div>
                <button onClick={() => { setShowModal(false); resetForm() }}
                  className="p-1.5 rounded-lg transition-colors hover:bg-slate-100">
                  <X size={16} style={{ color: T.muted }} />
                </button>
              </div>

              <div className="px-5 py-5 space-y-4">
                {/* Method toggle */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['ach', 'debit_card'] as WithdrawMethod[]).map(m => (
                      <button key={m} onClick={() => setMethod(m)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                        style={method === m
                          ? { background: T.greenLt, border: `1px solid ${T.greenBd}`, color: T.green }
                          : { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.muted }}>
                        {m === 'ach' ? <Building2 size={14} /> : <CreditCard size={14} />}
                        {m === 'ach' ? 'ACH / Bank' : 'Debit Card'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Amount</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                    <input type="number" min="1" step="0.01" placeholder="0.00"
                      className="w-full h-9 pl-8 pr-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                      value={amount} onChange={e => setAmount(e.target.value)}
                      onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                      onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                    />
                  </div>
                </div>

                {/* ACH fields */}
                {method === 'ach' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Bank Name</label>
                      <input placeholder="e.g. Chase Bank" value={bankName} onChange={e => setBankName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                        onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                        onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Routing Number</label>
                        <input placeholder="9 digits" maxLength={9} value={routing} onChange={e => setRouting(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                          onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                          onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Account Number</label>
                        <input placeholder="Account #" value={acctNum} onChange={e => setAcctNum(e.target.value.replace(/\D/g, ''))}
                          className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all"
                          style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                          onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                          onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Account Type</label>
                      <div className="relative">
                        <select value={acctType} onChange={e => setAcctType(e.target.value as 'checking' | 'savings')}
                          className="w-full h-9 pl-3 pr-8 rounded-xl text-sm outline-none appearance-none transition-all"
                          style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}>
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.muted }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Debit card fields */}
                {method === 'debit_card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Cardholder Name</label>
                      <input placeholder="Name on card" value={cardName} onChange={e => setCardName(e.target.value)}
                        className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                        onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                        onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Card Last 4 Digits</label>
                      <input placeholder="0000" maxLength={4} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-9 px-3 rounded-xl text-sm outline-none transition-all"
                        style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                        onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                        onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                      />
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: T.muted }}>
                      After submitting, admin will process the payout to your card within 1–3 business days.
                    </p>
                  </div>
                )}

                {formError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                    style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                    <AlertCircle size={13} /> {formError}
                  </div>
                )}

                <button onClick={handleWithdraw} disabled={submitting}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><ArrowDownToLine size={14} /> Submit Withdrawal Request</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
