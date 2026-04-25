import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy, CheckCircle2, Clock, MessageSquare, Send,
  ChevronDown, Loader2, AlertCircle, Filter, Search,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  violet: '#7C3AED', violetLt: '#F5F3FF',
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Open',        color: '#2563EB', bg: '#EFF6FF' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB' },
  resolved:    { label: 'Resolved',    color: '#16A34A', bg: '#F0FDF4' },
  closed:      { label: 'Closed',      color: '#64748B', bg: '#F1F5F9' },
}

interface Ticket {
  id: string
  ticket_number: string
  user_id: string
  user_name?: string
  user_email?: string
  subject: string
  category: string
  message: string
  status: string
  admin_response?: string
  created_at: string
  updated_at: string
}

export default function SupportTicketsPage() {
  const { profile } = useAuth()
  const [tickets, setTickets]     = useState<Ticket[]>([])
  const [loading, setLoading]     = useState(true)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')

  // Response state per ticket
  const [responses, setResponses]   = useState<Record<string, string>>({})
  const [saving, setSaving]         = useState<string | null>(null)
  const [saveOk, setSaveOk]         = useState<string | null>(null)

  async function loadTickets() {
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })
    setTickets((data as Ticket[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { loadTickets() }, [])

  async function handleRespond(ticket: Ticket) {
    const resp = (responses[ticket.id] ?? '').trim()
    if (!resp) return
    setSaving(ticket.id)
    const { error } = await supabase
      .from('support_tickets')
      .update({ admin_response: resp, status: 'resolved', updated_at: new Date().toISOString() })
      .eq('id', ticket.id)
    if (!error) {
      setSaveOk(ticket.id)
      await loadTickets()
      setTimeout(() => setSaveOk(null), 2000)
    }
    setSaving(null)
  }

  async function setTicketStatus(id: string, status: string) {
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    await loadTickets()
  }

  const filtered = tickets.filter(t => {
    const matchSearch = !search ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.user_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  const counts = {
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
  }

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Support Tickets</h1>
        <p className="text-sm" style={{ color: T.muted }}>Manage and respond to user help requests</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Open',        value: counts.open,        color: '#2563EB' },
          { label: 'In Progress', value: counts.in_progress, color: '#D97706' },
          { label: 'Resolved',    value: counts.resolved,    color: '#16A34A' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 text-center cursor-pointer transition-all hover:shadow-md"
            style={{ background: T.white, border: `1px solid ${T.border}` }}
            onClick={() => setStatus(s.label.toLowerCase().replace(' ', '_'))}>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: T.muted }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3"
        style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject, user, or ticket number…"
            className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy }} />
        </div>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="h-9 px-3 rounded-xl text-sm outline-none"
          style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy, minWidth: 150 }}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Ticket list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <h2 className="font-bold text-sm" style={{ color: T.navy }}>All Tickets</h2>
          <button onClick={() => { setSearch(''); setStatus('all') }}
            className="text-xs font-medium hover:underline" style={{ color: T.muted }}>
            Clear filters
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: T.violet }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <LifeBuoy size={40} style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>No tickets found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {filtered.map(ticket => {
              const st = STATUS_MAP[ticket.status] ?? STATUS_MAP.open
              const isOpen = expanded === ticket.id
              const resp = responses[ticket.id] ?? ticket.admin_response ?? ''
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
                        <span className="text-sm font-semibold" style={{ color: T.navy }}>{ticket.subject}</span>
                        <span className="text-[10px] font-mono" style={{ color: T.muted }}>#{ticket.ticket_number}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: T.muted }}>
                        <span>{ticket.user_name ?? 'Unknown'}</span>
                        <span>{ticket.user_email}</span>
                        <span>{ticket.category}</span>
                        <span>{new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                      <ChevronDown size={14} style={{ color: T.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4 ml-12">
                          {/* User message */}
                          <div className="p-3.5 rounded-xl text-sm leading-relaxed"
                            style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.body }}>
                            <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>User Message</div>
                            {ticket.message}
                          </div>

                          {/* Admin response */}
                          {saveOk === ticket.id ? (
                            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' }}>
                              <CheckCircle2 size={14} /> Response sent successfully
                            </div>
                          ) : (
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>
                                Admin Response
                              </label>
                              <textarea
                                value={resp}
                                onChange={e => setResponses(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                placeholder="Type your response to the user…"
                                rows={4}
                                className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                                style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy }}
                              />
                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  onClick={() => handleRespond(ticket)}
                                  disabled={saving === ticket.id || !resp.trim()}
                                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                                  style={{ background: `linear-gradient(135deg, ${T.violet}, #6D28D9)` }}>
                                  {saving === ticket.id ? <><Loader2 size={13} className="animate-spin" /> Sending…</> : <><Send size={13} /> Send Response</>}
                                </button>
                                <select
                                  defaultValue={ticket.status}
                                  onChange={e => setTicketStatus(ticket.id, e.target.value)}
                                  className="h-9 px-3 rounded-xl text-xs outline-none"
                                  style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.navy }}>
                                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                </select>
                              </div>
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
    </div>
  )
}
