import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy, Send, CheckCircle2, Clock, MessageSquare,
  ChevronDown, Loader2, AlertCircle, Plus, X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const inputCls = 'w-full rounded-xl px-3.5 text-sm outline-none transition-all'
const inputStyle = { background: T.bg, border: `1px solid ${T.border}`, color: T.navy }
const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = T.green; e.target.style.boxShadow = `0 0 0 3px ${T.greenLt}`; e.target.style.background = '#fff'
}
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = T.bg
}

const CATEGORIES = [
  'Application Status', 'Document Upload', 'Account & Login',
  'Payment & Wallet', 'Technical Issue', 'Other',
]

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#2563EB', bg: '#EFF6FF' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
  resolved:    { label: 'Resolved',    color: T.green,   bg: T.greenLt },
  closed:      { label: 'Closed',      color: '#64748B', bg: '#F1F5F9' },
}

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  category: string
  message: string
  status: string
  admin_response?: string
  created_at: string
  updated_at: string
}

export default function SupportPage() {
  const { user, profile } = useAuth()
  const [tickets, setTickets]   = useState<Ticket[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  // Form state
  const [subject,  setSubject]  = useState('')
  const [category, setCategory] = useState('')
  const [message,  setMessage]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')

  async function loadTickets() {
    if (!user) return
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setTickets((data as Ticket[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !category || !message.trim()) { setError('Please fill in all fields.'); return }
    setSaving(true); setError('')
    const ticketNum = `TKT-${Date.now().toString().slice(-6)}`
    const { error: err } = await supabase.from('support_tickets').insert({
      user_id:       user!.id,
      ticket_number: ticketNum,
      subject:       subject.trim(),
      category,
      message:       message.trim(),
      status:        'open',
      user_name:     profile?.full_name,
      user_email:    profile?.email,
    })
    if (err) { setError('Failed to submit. Please try again.'); setSaving(false); return }
    setSuccess(true)
    setSubject(''); setCategory(''); setMessage('')
    await loadTickets()
    setTimeout(() => { setSuccess(false); setShowForm(false) }, 2500)
    setSaving(false)
  }

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Help & Support</h1>
          <p className="text-sm" style={{ color: T.muted }}>Submit a request and our team will respond within 1 business day</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0 transition-all hover:brightness-105"
          style={{ background: `linear-gradient(135deg, ${T.green}, #15803D)`, boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
          {showForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> New Request</>}
        </button>
      </motion.div>

      {/* New ticket form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden mb-6">
            <div className="rounded-2xl p-6" style={{ background: T.white, border: `1px solid ${T.border}` }}>
              <h2 className="font-bold text-base mb-5" style={{ color: T.navy }}>Submit a Support Request</h2>

              {success ? (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 rounded-xl" style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                  <CheckCircle2 size={18} style={{ color: T.green }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: '#166534' }}>Request submitted!</div>
                    <div className="text-xs" style={{ color: '#166534' }}>We'll respond within 1 business day.</div>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Subject</label>
                      <input value={subject} onChange={e => setSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                        className={`${inputCls} h-10`} style={inputStyle}
                        onFocus={focusIn} onBlur={focusOut} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Category</label>
                      <select value={category} onChange={e => setCategory(e.target.value)}
                        className={`${inputCls} h-10`} style={inputStyle}
                        onFocus={focusIn} onBlur={focusOut}>
                        <option value="">Select category…</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Describe your issue in detail…"
                      rows={5} className={`${inputCls} py-2.5 resize-none`} style={inputStyle}
                      onFocus={focusIn} onBlur={focusOut} />
                  </div>
                  <button type="submit" disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${T.green}, #15803D)` }}>
                    {saving ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : <><Send size={14} /> Submit Request</>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <h2 className="font-bold text-sm" style={{ color: T.navy }}>Your Support Requests</h2>
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: '#F1F5F9', color: T.muted }}>
            {tickets.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: T.green }} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LifeBuoy size={40} style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>No support requests yet</p>
            <button onClick={() => setShowForm(true)}
              className="text-sm font-semibold" style={{ color: T.green }}>
              Submit your first request →
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {tickets.map(ticket => {
              const st = STATUS_MAP[ticket.status] ?? STATUS_MAP.open
              const isOpen = expanded === ticket.id
              return (
                <div key={ticket.id}>
                  <button
                    className="w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : ticket.id)}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: st.bg }}>
                      {ticket.status === 'resolved' || ticket.status === 'closed'
                        ? <CheckCircle2 size={14} style={{ color: st.color }} />
                        : <Clock size={14} style={{ color: st.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold truncate" style={{ color: T.navy }}>{ticket.subject}</span>
                        <span className="text-[10px] font-mono shrink-0" style={{ color: T.muted }}>#{ticket.ticket_number}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs" style={{ color: T.muted }}>{ticket.category}</span>
                        <span className="text-xs" style={{ color: T.muted }}>
                          {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      {ticket.admin_response && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#F0FDF4', color: T.green, border: '1px solid #BBF7D0' }}>
                          Reply
                        </span>
                      )}
                      <ChevronDown size={14} style={{ color: T.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-4 space-y-3 ml-12">
                          <div className="p-3.5 rounded-xl text-sm leading-relaxed" style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.body }}>
                            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Your Message</div>
                            {ticket.message}
                          </div>
                          {ticket.admin_response && (
                            <div className="p-3.5 rounded-xl text-sm leading-relaxed"
                              style={{ background: T.greenLt, border: `1px solid ${T.greenBd}`, color: '#166534' }}>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <MessageSquare size={11} style={{ color: T.green }} />
                                <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: T.green }}>Support Response</div>
                              </div>
                              {ticket.admin_response}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Contact fallback */}
      <div className="mt-6 rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: T.navy }}>Need urgent help?</div>
            <div className="text-xs" style={{ color: T.muted }}>Our grant support team is available Mon–Fri 9AM–6PM EST</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:7022747227"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-105 text-white"
              style={{ background: `linear-gradient(135deg, ${T.green}, #15803D)` }}>
              (702) 274-7227
            </a>
            <a href="mailto:grants@riseaxiscapital.com"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.body }}>
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
