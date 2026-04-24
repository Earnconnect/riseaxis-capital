import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet, ArrowDownToLine, CreditCard, Building2,
  DollarSign, TrendingDown, TrendingUp, X, Loader2, AlertCircle,
  CheckCircle2, Clock, XCircle, Shield, ChevronDown, Lock,
  RefreshCw, Info, FileText, Landmark, Star, Eye, EyeOff,
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

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; color: string; border: string; icon: React.ReactNode; label: string }> = {
    completed: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', icon: <CheckCircle2 size={11} />, label: 'Completed' },
    approved:  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', icon: <CheckCircle2 size={11} />, label: 'Approved' },
    pending:   { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: <Clock size={11} />,         label: 'Pending' },
    rejected:  { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: <XCircle size={11} />,      label: 'Rejected' },
  }
  const c = cfg[status] ?? cfg.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.icon} {c.label}
    </span>
  )
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[9px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</div>
      <div className={`text-[13px] font-bold text-white ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</div>
    </div>
  )
}

export default function WalletPage() {
  const { user, profile } = useAuth()
  const [wallet, setWallet]     = useState<WalletType | null>(null)
  const [txns, setTxns]         = useState<WalletTransaction[]>([])
  const [loading, setLoading]   = useState(true)
  const [hideBalance, setHideBalance] = useState(false)

  const [showModal, setShowModal]   = useState(false)
  const [method, setMethod]         = useState<WithdrawMethod>('ach')
  const [amount, setAmount]         = useState('')
  const [bankName, setBankName]     = useState('')
  const [routing, setRouting]       = useState('')
  const [acctNum, setAcctNum]       = useState('')
  const [acctType, setAcctType]     = useState<'checking' | 'savings'>('checking')
  const [cardName, setCardName]     = useState('')
  const [cardNum, setCardNum]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [refNum, setRefNum]         = useState('')

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

  const balance  = wallet?.balance ?? 0
  const pending  = txns.filter(t => t.type === 'withdrawal' && t.status === 'pending').reduce((s, t) => s + t.amount, 0)
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  // Masked account number derived from user id
  const maskedAcct = user ? `••••${user.id.slice(-4).toUpperCase()}` : '••••'
  const acctNumber = user ? `RAC-${user.id.slice(0, 8).toUpperCase()}` : '—'

  function resetForm() {
    setAmount(''); setBankName(''); setRouting(''); setAcctNum('')
    setAcctType('checking'); setCardName(''); setCardNum('')
    setFormError(''); setMethod('ach'); setSubmitted(false); setRefNum('')
  }

  async function handleWithdraw() {
    setFormError('')
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) return setFormError('Please enter a valid withdrawal amount.')
    if (amt > balance) return setFormError(`Amount exceeds your available balance of ${formatCurrency(balance)}.`)
    if (method === 'ach') {
      if (!bankName.trim()) return setFormError('Bank name is required.')
      if (!/^\d{9}$/.test(routing.trim())) return setFormError('Routing number must be exactly 9 digits.')
      if (!acctNum.trim()) return setFormError('Account number is required.')
    } else {
      if (!cardName.trim()) return setFormError('Cardholder name is required.')
      if (!/^\d{4}$/.test(cardNum.trim())) return setFormError('Please enter the last 4 digits of your card.')
    }

    setSubmitting(true)
    const newBalance = balance - amt
    const { error: wErr } = await supabase.from('wallets')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('user_id', user!.id)
    if (wErr) { setFormError(wErr.message); setSubmitting(false); return }

    const txnRow: Record<string, unknown> = {
      wallet_id: wallet!.id,
      user_id: user!.id,
      type: 'withdrawal',
      amount: amt,
      description: method === 'ach' ? `ACH transfer to ${bankName}` : `Debit card payout (••••${cardNum})`,
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
    await supabase.from('notifications').insert({
      user_id: user!.id,
      type: 'general',
      title: 'Withdrawal Request Submitted',
      message: `Your ${method === 'ach' ? 'ACH bank transfer' : 'debit card payout'} request for ${formatCurrency(amt)} is under review.`,
      read: false,
    })

    const ref = `WD-${Date.now().toString(36).toUpperCase()}`
    setRefNum(ref)
    setSubmitting(false)
    setSubmitted(true)
    fetchWallet()
  }

  const creditTxns     = txns.filter(t => t.type === 'credit')
  const withdrawalTxns = txns.filter(t => t.type === 'withdrawal')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 lg:px-8 py-8 space-y-5">

      {/* ── Page Header ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.green }}>RiseAxis Capital</div>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ background: '#F0FDF4', color: T.green, border: '1px solid #BBF7D0' }}>Grant Wallet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>My Wallet</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>Secure grant fund management account</p>
        </div>
        <button onClick={fetchWallet}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:bg-slate-100"
          style={{ color: T.sub, border: `1px solid ${T.border}` }}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </motion.div>

      {/* ── Virtual Card + Stats Grid ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Virtual Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}
          className="lg:col-span-3 rounded-2xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0F2D1A 55%, #0D3321 100%)', minHeight: 220, boxShadow: '0 12px 48px rgba(0,0,0,0.28)' }}>

          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full" style={{ background: 'rgba(22,163,74,0.07)' }} />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full" style={{ background: 'rgba(22,163,74,0.05)' }} />
            <div className="absolute right-10 bottom-10 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.02)' }} />
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern></defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 p-6 flex flex-col h-full" style={{ minHeight: 220 }}>
            {/* Top row */}
            <div className="flex items-start justify-between mb-auto">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
                  <Landmark size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white leading-tight">RiseAxis Capital</div>
                  <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Grant Disbursement Wallet</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.25)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] font-bold text-green-400">ACTIVE</span>
              </div>
            </div>

            {/* Balance */}
            <div className="my-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Available Balance</span>
                <button onClick={() => setHideBalance(!hideBalance)}
                  className="transition-opacity hover:opacity-70">
                  {hideBalance ? <EyeOff size={11} style={{ color: 'rgba(255,255,255,0.35)' }} /> : <Eye size={11} style={{ color: 'rgba(255,255,255,0.35)' }} />}
                </button>
              </div>
              {loading
                ? <div className="h-10 w-44 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                : <div className="text-4xl font-black text-white tracking-tight">
                    {hideBalance ? '••••••' : formatCurrency(balance)}
                  </div>
              }
              {pending > 0 && !loading && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Clock size={10} style={{ color: '#FCD34D' }} />
                  <span className="text-[10px] font-medium" style={{ color: '#FCD34D' }}>
                    {formatCurrency(pending)} pending withdrawal
                  </span>
                </div>
              )}
            </div>

            {/* Bottom row — account info */}
            <div className="flex items-end justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14 }}>
              <div className="flex gap-6">
                <Field label="Account ID" value={acctNumber} mono />
                <Field label="Account Holder" value={profile?.full_name || 'Account Holder'} />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Lock size={9} style={{ color: 'rgba(255,255,255,0.4)' }} />
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Secured</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right stat stack */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {[
            { label: 'Total Received',  value: wallet?.total_received  ?? 0, icon: TrendingUp,  color: '#16A34A', bg: '#F0FDF4', bd: '#BBF7D0', prefix: '$', delay: 0.07 },
            { label: 'Total Withdrawn', value: wallet?.total_withdrawn ?? 0, icon: TrendingDown, color: '#F59E0B', bg: '#FFFBEB', bd: '#FDE68A', prefix: '$', delay: 0.10 },
            { label: 'Transactions',    value: txns.length,                  icon: FileText,    color: '#3B82F6', bg: '#EFF6FF', bd: '#BFDBFE', prefix: '',  delay: 0.13 },
          ].map(s => (
            <motion.div key={s.label}
              initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: s.delay }}
              className="flex-1 rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.muted }}>{s.label}</div>
                {loading
                  ? <div className="h-5 w-20 rounded bg-slate-100 animate-pulse mt-0.5" />
                  : <div className="text-lg font-black" style={{ color: T.heading }}>
                      {s.prefix === '$' ? formatCurrency(s.value) : s.value.toLocaleString()}
                    </div>
                }
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Withdraw Actions ────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div className="font-bold text-sm" style={{ color: T.heading }}>Transfer Funds</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>Move your available balance to your personal bank account</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: '#F0FDF4', color: T.green, border: '1px solid #BBF7D0' }}>
            <Shield size={9} /> Admin Verified
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
          <button onClick={() => { setMethod('ach'); setShowModal(true) }}
            className="flex items-start gap-4 px-5 py-5 text-left transition-all hover:bg-slate-50 group"
            style={{ borderRight: '1px solid #EDE9E3' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: T.heading }}>ACH Bank Transfer</div>
              <div className="text-xs mt-0.5 leading-relaxed" style={{ color: T.muted }}>
                Transfer directly to your checking or savings account via ACH
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold" style={{ color: T.green }}>
                <CheckCircle2 size={10} /> 1–3 business days
              </div>
            </div>
          </button>
          <button onClick={() => { setMethod('debit_card'); setShowModal(true) }}
            className="flex items-start gap-4 px-5 py-5 text-left transition-all hover:bg-slate-50 group">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #6366F1)', boxShadow: '0 4px 12px rgba(79,70,229,0.25)' }}>
              <CreditCard size={18} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: T.heading }}>Debit Card Payout</div>
              <div className="text-xs mt-0.5 leading-relaxed" style={{ color: T.muted }}>
                Push funds instantly to your debit card
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] font-semibold" style={{ color: '#4F46E5' }}>
                <CheckCircle2 size={10} /> Fast · Admin processed
              </div>
            </div>
          </button>
        </div>
        {/* Info bar */}
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#F8FAFC', borderTop: `1px solid ${T.border}` }}>
          <Info size={12} style={{ color: T.muted }} />
          <span className="text-[11px]" style={{ color: T.muted }}>
            All withdrawals are reviewed and processed by the RiseAxis Capital grants team within 1–3 business days.
          </span>
        </div>
      </motion.div>

      {/* ── Transaction History ───────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div className="font-bold text-sm" style={{ color: T.heading }}>Transaction Ledger</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>
              {creditTxns.length} credit{creditTxns.length !== 1 ? 's' : ''} · {withdrawalTxns.length} withdrawal{withdrawalTxns.length !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: T.muted }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#16A34A' }} /> Credits
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: T.muted }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} /> Withdrawals
            </div>
          </div>
        </div>

        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 3 ? `1px solid ${T.border}` : 'none' }}>
                <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-48 rounded bg-slate-100" />
                  <div className="h-3 w-28 rounded bg-slate-100" />
                </div>
                <div className="text-right space-y-2">
                  <div className="h-4 w-20 rounded bg-slate-100 ml-auto" />
                  <div className="h-5 w-16 rounded-full bg-slate-100 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : txns.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
              <Wallet size={26} style={{ color: T.green }} />
            </div>
            <p className="font-bold text-sm" style={{ color: T.heading }}>No transactions yet</p>
            <p className="text-xs mt-1.5 max-w-xs mx-auto leading-relaxed" style={{ color: T.muted }}>
              Your grant disbursements will appear here once the grants team releases your approved funds.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                    {['Type', 'Description', 'Date', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((t, i) => (
                    <tr key={t.id} className="group hover:bg-slate-50 transition-colors"
                      style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td className="px-5 py-4">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: t.type === 'credit' ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${t.type === 'credit' ? '#BBF7D0' : '#FED7AA'}` }}>
                          {t.type === 'credit'
                            ? <TrendingUp size={14} style={{ color: '#16A34A' }} />
                            : <TrendingDown size={14} style={{ color: '#F59E0B' }} />}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-sm" style={{ color: T.heading }}>{t.description}</div>
                        {t.method && (
                          <div className="text-xs mt-0.5" style={{ color: T.muted }}>
                            {t.method === 'ach'
                              ? <span className="flex items-center gap-1"><Building2 size={10} /> ACH · {t.bank_name} ····{t.account_number_last4} ({t.account_type})</span>
                              : <span className="flex items-center gap-1"><CreditCard size={10} /> Debit card ····{t.card_last4}</span>
                            }
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-medium" style={{ color: T.heading }}>
                          {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                          {new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-black text-base" style={{ color: t.type === 'credit' ? '#16A34A' : T.heading }}>
                          {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                        </div>
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              {txns.map((t, i) => (
                <div key={t.id} className="flex items-start gap-3 px-4 py-4"
                  style={{ borderBottom: i < txns.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: t.type === 'credit' ? '#F0FDF4' : '#FFF7ED', border: `1px solid ${t.type === 'credit' ? '#BBF7D0' : '#FED7AA'}` }}>
                    {t.type === 'credit' ? <TrendingUp size={14} style={{ color: '#16A34A' }} /> : <TrendingDown size={14} style={{ color: '#F59E0B' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: T.heading }}>{t.description}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="mt-1.5"><StatusBadge status={t.status} /></div>
                  </div>
                  <div className="font-black text-base shrink-0" style={{ color: t.type === 'credit' ? '#16A34A' : T.heading }}>
                    {t.type === 'credit' ? '+' : '−'}{formatCurrency(t.amount)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* ── Official Compliance Footer ───────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Org header */}
        <div className="px-5 py-4 flex items-center gap-3" style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <img src="/logo.png" alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
          <div>
            <div className="text-[12px] font-bold text-white">RiseAxis Capital</div>
            <div className="text-[9px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Federally Recognized Nonprofit · EIN: 88-3456789
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ background: 'rgba(22,163,74,0.15)', color: '#4ADE80', border: '1px solid rgba(22,163,74,0.25)' }}>
              501(c)(3)
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.25)' }}>
              NACHA Compliant
            </span>
          </div>
        </div>

        {/* Seal strip */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-3 justify-between">
          {[
            { icon: Shield,   label: 'FDIC Insured', sub: 'Up to $250,000' },
            { icon: Lock,     label: '256-bit TLS Encryption', sub: 'Bank-grade security' },
            { icon: Star,     label: 'IRS Tax-Exempt', sub: 'Section 501(c)(3)' },
            { icon: CheckCircle2, label: 'Admin Verified', sub: 'All transfers reviewed' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <b.icon size={13} style={{ color: T.green }} />
              </div>
              <div>
                <div className="text-[10px] font-bold" style={{ color: T.heading }}>{b.label}</div>
                <div className="text-[9px]" style={{ color: T.muted }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="px-5 pb-4">
          <p className="text-[10px] leading-relaxed" style={{ color: T.muted }}>
            This wallet is operated by RiseAxis Capital, a federally recognized 501(c)(3) nonprofit organization. Fund balances represent
            approved and disbursed grant amounts. All withdrawals are subject to admin verification. Processing times may vary.
            For assistance, contact our grants office at (702) 274-7227 · Mon–Fri 9AM–6PM EST.
          </p>
        </div>
      </motion.div>

      {/* ── Withdraw Modal ────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => { if (!submitting) { setShowModal(false); resetForm() } }} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed z-50 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-[4%] sm:top-[6%] sm:w-[460px] rounded-2xl overflow-hidden"
              style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 32px 80px rgba(0,0,0,0.28)', maxHeight: '90vh', overflowY: 'auto' }}>

              {submitted ? (
                /* ── Success state ── */
                <div className="px-6 py-10 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}>
                    <CheckCircle2 size={28} className="text-white" />
                  </motion.div>
                  <h3 className="text-lg font-black mb-1" style={{ color: T.heading }}>Request Submitted</h3>
                  <p className="text-sm mb-4" style={{ color: T.sub }}>
                    Your withdrawal request is under review by the grants team.
                  </p>
                  <div className="rounded-xl px-4 py-3 mb-6 text-left"
                    style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.muted }}>Confirmation Details</div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span style={{ color: T.sub }}>Reference</span>
                        <span className="font-bold font-mono" style={{ color: T.heading }}>{refNum}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: T.sub }}>Amount</span>
                        <span className="font-bold" style={{ color: T.green }}>{formatCurrency(parseFloat(amount) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: T.sub }}>Method</span>
                        <span className="font-semibold" style={{ color: T.heading }}>{method === 'ach' ? 'ACH Bank Transfer' : 'Debit Card Payout'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: T.sub }}>Status</span>
                        <StatusBadge status="pending" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs mb-5 leading-relaxed" style={{ color: T.muted }}>
                    You will be notified when your request is processed. Processing typically takes 1–3 business days.
                  </p>
                  <button onClick={() => { setShowModal(false); resetForm() }}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105"
                    style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Modal header */}
                  <div className="px-5 py-4 flex items-center justify-between"
                    style={{ background: '#0F172A', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.3)' }}>
                        <ArrowDownToLine size={14} style={{ color: '#4ADE80' }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">Withdrawal Request</div>
                        <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          Balance: <span style={{ color: '#4ADE80' }}>{formatCurrency(balance)}</span> available
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setShowModal(false); resetForm() }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <X size={16} />
                    </button>
                  </div>

                  <div className="px-5 py-5 space-y-5">
                    {/* Step 1 — Method */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: T.heading }}>1</div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.sub }}>Select Transfer Method</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {(['ach', 'debit_card'] as WithdrawMethod[]).map(m => (
                          <button key={m} onClick={() => setMethod(m)}
                            className="flex flex-col items-start gap-2 p-3.5 rounded-xl border-2 transition-all text-left"
                            style={method === m
                              ? { background: T.greenLt, borderColor: T.green }
                              : { background: '#F8FAFC', borderColor: T.border }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background: method === m ? T.green : '#E2E8F0' }}>
                              {m === 'ach' ? <Building2 size={14} style={{ color: method === m ? '#fff' : T.muted }} /> : <CreditCard size={14} style={{ color: method === m ? '#fff' : T.muted }} />}
                            </div>
                            <div>
                              <div className="text-xs font-bold" style={{ color: method === m ? T.green : T.heading }}>
                                {m === 'ach' ? 'ACH / Bank' : 'Debit Card'}
                              </div>
                              <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>
                                {m === 'ach' ? '1–3 business days' : 'Fast payout'}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 2 — Amount */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: T.heading }}>2</div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.sub }}>Enter Amount</span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: T.muted }}>$</span>
                        <input type="number" min="1" step="0.01" placeholder="0.00"
                          className="w-full h-12 pl-8 pr-3 rounded-xl text-lg font-bold outline-none transition-all"
                          style={{ background: '#F8FAFC', border: `2px solid ${T.border}`, color: T.heading }}
                          value={amount} onChange={e => setAmount(e.target.value)}
                          onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                          onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {[25, 50, 100].map(pct => {
                          const val = Math.floor(balance * pct / 100)
                          return (
                            <button key={pct} onClick={() => setAmount(String(val))}
                              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all hover:bg-slate-100"
                              style={{ border: `1px solid ${T.border}`, color: T.sub }}>
                              {pct}% · {formatCurrency(val)}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Step 3 — Bank / Card details */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                          style={{ background: T.heading }}>3</div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: T.sub }}>
                          {method === 'ach' ? 'Bank Account Details' : 'Card Details'}
                        </span>
                      </div>

                      {method === 'ach' ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Bank Name</label>
                            <input placeholder="e.g. Chase, Wells Fargo, Bank of America" value={bankName} onChange={e => setBankName(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
                              style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                              onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                              onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Routing Number</label>
                              <input placeholder="9-digit ABA" maxLength={9} value={routing} onChange={e => setRouting(e.target.value.replace(/\D/g, ''))}
                                className="w-full h-10 px-3 rounded-xl text-sm font-mono outline-none transition-all"
                                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                                onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                                onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Account Number</label>
                              <input placeholder="Account #" value={acctNum} onChange={e => setAcctNum(e.target.value.replace(/\D/g, ''))}
                                className="w-full h-10 px-3 rounded-xl text-sm font-mono outline-none transition-all"
                                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                                onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                                onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Account Type</label>
                            <div className="grid grid-cols-2 gap-2">
                              {(['checking', 'savings'] as const).map(at => (
                                <button key={at} onClick={() => setAcctType(at)}
                                  className="py-2 rounded-xl text-xs font-semibold transition-all capitalize"
                                  style={acctType === at
                                    ? { background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }
                                    : { background: '#F8FAFC', color: T.muted, border: `1px solid ${T.border}` }}>
                                  {at}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Cardholder Name</label>
                            <input placeholder="Full name as on card" value={cardName} onChange={e => setCardName(e.target.value)}
                              className="w-full h-10 px-3 rounded-xl text-sm outline-none transition-all"
                              style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                              onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                              onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold mb-1" style={{ color: T.sub }}>Last 4 Digits of Card</label>
                            <div className="relative">
                              <CreditCard size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                              <input placeholder="••••" maxLength={4} value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, ''))}
                                className="w-full h-10 pl-9 pr-3 rounded-xl text-sm font-mono tracking-widest outline-none transition-all"
                                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                                onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                                onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                              />
                            </div>
                          </div>
                          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                            <Info size={12} style={{ color: '#3B82F6' }} className="shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-relaxed" style={{ color: '#1D4ED8' }}>
                              Admin will push the payout to your card after approval. Allow 1–3 business days.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Security notice */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <Lock size={13} style={{ color: T.green }} />
                      <p className="text-[11px] font-medium" style={{ color: '#166534' }}>
                        Your banking details are encrypted and only used to process this withdrawal request.
                      </p>
                    </div>

                    {formError && (
                      <div className="flex items-start gap-2 px-3 py-3 rounded-xl"
                        style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                        <AlertCircle size={13} style={{ color: '#DC2626' }} className="shrink-0 mt-0.5" />
                        <p className="text-sm" style={{ color: '#DC2626' }}>{formError}</p>
                      </div>
                    )}

                    <button onClick={handleWithdraw} disabled={submitting}
                      className="w-full py-3.5 rounded-xl text-sm font-black text-white transition-all hover:brightness-105 disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 6px 20px rgba(22,163,74,0.3)' }}>
                      {submitting
                        ? <><Loader2 size={15} className="animate-spin" /> Processing Request…</>
                        : <><ArrowDownToLine size={15} /> Submit Withdrawal Request</>}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
