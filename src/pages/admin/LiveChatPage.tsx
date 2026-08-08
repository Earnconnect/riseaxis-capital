import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageCircle, Send, Loader2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { sendEmailNotification } from '@/lib/email'
import { useAuth } from '@/contexts/AuthContext'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

interface ChatMessage {
  id: string
  user_id: string
  sender_role: 'user' | 'admin'
  content: string
  read: boolean
  created_at: string
}

interface Conv {
  userId: string
  name: string
  email: string
  last: string
  lastAt: string
  unread: number
}

export default function LiveChatPage() {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [profiles, setProfiles] = useState<Record<string, { full_name: string; email: string }>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  async function loadProfiles(ids: string[]) {
    const missing = ids.filter(id => !profiles[id])
    if (missing.length === 0) return
    const { data } = await supabase.from('profiles').select('id, full_name, email').in('id', missing)
    if (data) {
      setProfiles(prev => {
        const next = { ...prev }
        data.forEach((p: { id: string; full_name: string; email: string }) => { next[p.id] = { full_name: p.full_name, email: p.email } })
        return next
      })
    }
  }

  useEffect(() => {
    let active = true
    supabase.from('chat_messages').select('*').order('created_at')
      .then(async ({ data }) => {
        if (!active) return
        const msgs = (data as ChatMessage[]) || []
        setMessages(msgs)
        await loadProfiles([...new Set(msgs.map(m => m.user_id))])
        setLoading(false)
      })

    const channel = supabase
      .channel('admin-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
        const m = payload.new as ChatMessage
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m])
        loadProfiles([m.user_id])
      })
      .subscribe()

    return () => { active = false; supabase.removeChannel(channel) }
  }, [])

  const convs = useMemo<Conv[]>(() => {
    const map = new Map<string, ChatMessage[]>()
    for (const m of messages) {
      if (!map.has(m.user_id)) map.set(m.user_id, [])
      map.get(m.user_id)!.push(m)
    }
    const list: Conv[] = []
    for (const [userId, msgs] of map) {
      const last = msgs[msgs.length - 1]
      list.push({
        userId,
        name: profiles[userId]?.full_name || 'Applicant',
        email: profiles[userId]?.email || '',
        last: last.content,
        lastAt: last.created_at,
        unread: msgs.filter(m => m.sender_role === 'user' && !m.read).length,
      })
    }
    return list.sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt))
  }, [messages, profiles])

  const filtered = convs.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))

  const thread = useMemo(() => messages.filter(m => m.user_id === selected).sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)), [messages, selected])

  // Mark the selected conversation's inbound messages read
  useEffect(() => {
    if (!selected) return
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
    const unreadIds = messages.filter(m => m.user_id === selected && m.sender_role === 'user' && !m.read).map(m => m.id)
    if (unreadIds.length) {
      supabase.from('chat_messages').update({ read: true }).in('id', unreadIds).then(() => {
        setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, read: true } : m))
      })
    }
  }, [selected, thread.length])

  async function send() {
    const text = input.trim()
    if (!text || !selected || sending) return
    setSending(true)
    setInput('')

    // Is the applicant actively chatting? (a user message in the last 3 min)
    const lastUserMsg = thread.filter(m => m.sender_role === 'user').slice(-1)[0]
    const userActive = lastUserMsg && (Date.now() - new Date(lastUserMsg.created_at).getTime() < 3 * 60 * 1000)

    const { error } = await supabase.from('chat_messages').insert({
      user_id: selected,
      sender_id: profile?.id,
      sender_role: 'admin',
      content: text,
    })
    if (error) { setInput(text); setSending(false); return }

    // Always drop an in-app notification so it's waiting when they return.
    await supabase.from('notifications').insert({
      user_id: selected,
      type: 'general',
      title: 'New reply from RiseAxis Support',
      message: text.length > 140 ? text.slice(0, 140) + '…' : text,
    })
    // Only email when they're not actively in the chat, to avoid spamming
    // during a live back-and-forth.
    if (!userActive) {
      await sendEmailNotification({
        userId: selected,
        event: 'support_reply',
        title: 'New Reply From RiseAxis Support',
        message: text,
      })
    }
    setSending(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 lg:px-8 py-6">
      <h1 className="text-xl font-bold mb-1" style={{ color: T.heading }}>Live Chat</h1>
      <p className="text-sm mb-5" style={{ color: T.muted }}>Reply to applicants in real time.</p>

      <div className="rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[300px_1fr]"
        style={{ background: T.card, border: `1px solid ${T.border}`, height: '70vh' }}>

        {/* Conversation list */}
        <div className="border-r flex flex-col" style={{ borderColor: T.border }}>
          <div className="p-3" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applicants…"
                className="w-full h-9 pl-9 pr-3 rounded-lg text-sm outline-none" style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" style={{ color: T.muted }} /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 px-4 text-sm" style={{ color: T.muted }}>No conversations yet.</div>
            ) : filtered.map(c => (
              <button key={c.userId} onClick={() => setSelected(c.userId)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50"
                style={{ borderBottom: `1px solid ${T.border}`, background: selected === c.userId ? '#F0FDF4' : 'transparent' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate" style={{ color: T.heading }}>{c.name}</span>
                    {c.unread > 0 && (
                      <span className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full shrink-0" style={{ background: '#16A34A' }}>{c.unread}</span>
                    )}
                  </div>
                  <div className="text-xs truncate" style={{ color: T.muted }}>{c.last}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className="flex flex-col min-h-0">
          {selected ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                  {(profiles[selected]?.full_name || 'A').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-bold" style={{ color: T.heading }}>{profiles[selected]?.full_name || 'Applicant'}</div>
                  <div className="text-xs" style={{ color: T.muted }}>{profiles[selected]?.email}</div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F8FAFC' }}>
                {thread.map(m => {
                  const admin = m.sender_role === 'admin'
                  return (
                    <div key={m.id} className={`flex ${admin ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                        style={admin
                          ? { background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', borderBottomRightRadius: 4 }
                          : { background: '#fff', color: T.heading, border: `1px solid ${T.border}`, borderBottomLeftRadius: 4 }}>
                        {m.content}
                        <div className="text-[9px] mt-1 text-right" style={{ color: admin ? 'rgba(255,255,255,0.6)' : T.muted }}>
                          {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>

              <div className="p-3 flex items-end gap-2" style={{ borderTop: `1px solid ${T.border}` }}>
                <textarea value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Type your reply…" rows={1}
                  className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 outline-none max-h-24"
                  style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
                <button onClick={send} disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                <MessageCircle size={24} style={{ color: T.green }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: T.heading }}>Select a conversation</p>
              <p className="text-xs mt-1" style={{ color: T.muted }}>Choose an applicant on the left to view and reply to their messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
