import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface ChatMessage {
  id: string
  user_id: string
  sender_role: 'user' | 'admin'
  content: string
  created_at: string
}

export default function SupportChatWidget() {
  const { user, profile, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Load history + subscribe to realtime inserts for this user's conversation
  useEffect(() => {
    if (!user) return
    let active = true

    supabase.from('chat_messages').select('*').eq('user_id', user.id).order('created_at')
      .then(({ data }) => {
        if (!active) return
        setMessages((data as ChatMessage[]) || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`chat:${user.id}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `user_id=eq.${user.id}` },
        payload => {
          setMessages(prev => prev.some(m => m.id === (payload.new as ChatMessage).id)
            ? prev
            : [...prev, payload.new as ChatMessage])
        })
      .subscribe()

    return () => { active = false; supabase.removeChannel(channel) }
  }, [user])

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send() {
    const text = input.trim()
    if (!text || !user || sending) return
    setSending(true)
    setInput('')
    const { error } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      sender_id: user.id,
      sender_role: 'user',
      content: text,
    })
    if (error) setInput(text)   // restore on failure
    setSending(false)
  }

  // Only signed-in applicants get the widget (admins use the admin inbox).
  if (!user || isAdmin) return null

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <>
      {/* Launcher */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 8px 24px rgba(22,163,74,0.4)' }}
        aria-label="Live chat support">
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} /></motion.span>
            : <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={24} /></motion.span>}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="fixed bottom-24 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-[380px] rounded-2xl overflow-hidden flex flex-col"
            style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 24px 60px rgba(0,0,0,0.22)', height: '520px', maxHeight: 'calc(100vh - 8rem)' }}>

            {/* Header */}
            <div className="px-4 py-3.5 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, #0F2540, #1E3A5F)' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <MessageCircle size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">RiseAxis Support</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>We typically reply within minutes</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#F8FAFC' }}>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#94A3B8' }} /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <MessageCircle size={20} style={{ color: '#16A34A' }} />
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Hi {firstName} 👋</p>
                  <p className="text-xs mt-1" style={{ color: '#64748B' }}>Send us a message and a grant specialist will reply here live.</p>
                </div>
              ) : (
                messages.map(m => {
                  const mine = m.sender_role === 'user'
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[78%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                        style={mine
                          ? { background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff', borderBottomRightRadius: 4 }
                          : { background: '#fff', color: '#0F172A', border: '1px solid #E2E8F0', borderBottomLeftRadius: 4 }}>
                        {!mine && <div className="text-[10px] font-bold mb-0.5" style={{ color: '#16A34A' }}>Support</div>}
                        {m.content}
                        <div className="text-[9px] mt-1 text-right" style={{ color: mine ? 'rgba(255,255,255,0.6)' : '#94A3B8' }}>
                          {new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={endRef} />
            </div>

            {/* Composer */}
            <div className="p-3 flex items-end gap-2" style={{ borderTop: '1px solid #E2E8F0', background: '#fff' }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Type a message…" rows={1}
                className="flex-1 resize-none text-sm rounded-xl px-3 py-2.5 outline-none max-h-24"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#0F172A' }} />
              <button onClick={send} disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)' }}>
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
