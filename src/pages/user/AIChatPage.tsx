import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, Shield, RefreshCw, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { openai, GRANT_SUPPORT_SYSTEM_PROMPT } from '@/lib/openai'

const S = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  'What grant programs are available?',
  'How do I check my application status?',
  'What documents do I need?',
  'How long does approval take?',
  'I want to apply for Emergency Assistance',
  'What is the maximum grant amount?',
]

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your RiseAxis Capital AI Grant Support Assistant. I'm here to help you 24/7 with:

• **Applying for a grant** — I can guide you through the full application
• **Checking application status** — share your app number or email
• **Understanding our programs** — Emergency, Education, Medical, Community, Business
• **Document requirements** — I'll tell you exactly what you need
• **Any other questions** about our funding programs

How can I help you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(content?: string) {
    const text = (content || input).trim()
    if (!text || loading) return

    const userMessage: Message = { role: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: GRANT_SUPPORT_SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: text },
        ],
        max_tokens: 800,
        temperature: 0.7,
      })

      const reply = response.choices[0]?.message?.content || 'I apologize, I was unable to process your request. Please try again.'
      setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please try again in a moment, or contact us directly at grants@riseaxiscapital.com or (702) 274-7227.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: 'Chat cleared. How can I assist you with your grant application today?',
      timestamp: new Date(),
    }])
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto h-[calc(100svh-7rem)] sm:h-[calc(100vh-8rem)] flex flex-col gap-4">

        {/* Header card */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center justify-between"
          style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 shrink-0">
              <img src="/logo.png" alt="RiseAxis Capital" className="w-11 h-11 object-cover rounded-xl" />
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                style={{ background: '#22C55E' }} />
            </div>
            <div>
              <div className="font-bold text-sm" style={{ color: S.heading }}>AI Grant Support Assistant</div>
              <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: S.green }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: S.green }} />
                Online · Available 24/7
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ background: S.greenLt, border: `1px solid ${S.greenBd}`, color: S.green }}>
              <Shield className="w-3 h-3" />
              Secure & Private
            </div>
            <button onClick={clearChat} title="Clear chat"
              className="p-2 rounded-xl transition-colors"
              style={{ color: S.muted }}
              onMouseEnter={e => { e.currentTarget.style.background = S.page; e.currentTarget.style.color = S.heading }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.muted }}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-2">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 2px 8px rgba(22,163,74,0.25)' }
                    : { background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
                  }>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-white" />
                    : <Bot className="w-4 h-4" style={{ color: S.green }} />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={msg.role === 'user'
                      ? {
                          background: 'linear-gradient(135deg, #16A34A, #15803D)',
                          color: '#fff',
                          borderTopRightRadius: '4px',
                          boxShadow: '0 4px 14px rgba(22,163,74,0.2)',
                        }
                      : {
                          background: S.white,
                          border: `1px solid ${S.border}`,
                          color: S.body,
                          borderTopLeftRadius: '4px',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }
                    }>
                    <FormattedMessage content={msg.content} />
                  </div>
                  <div className="text-[10px] px-1" style={{ color: S.muted }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: S.white, border: `1px solid ${S.border}` }}>
                <Bot className="w-4 h-4" style={{ color: S.green }} />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
                style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div className="flex gap-1.5 items-center">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: S.green, animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick action chips */}
        <AnimatePresence>
          {messages.length <= 1 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold" style={{ color: S.muted }}>
                <Sparkles className="w-3.5 h-3.5" /> Quick questions
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button key={action} onClick={() => sendMessage(action)}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all"
                    style={{ background: S.white, border: `1px solid ${S.border}`, color: S.body }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = S.greenLt
                      e.currentTarget.style.borderColor = S.greenBd
                      e.currentTarget.style.color = S.green
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = S.white
                      e.currentTarget.style.borderColor = S.border
                      e.currentTarget.style.color = S.body
                    }}>
                    {action}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input bar */}
        <div className="rounded-2xl p-3"
          style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message…"
              disabled={loading}
              className="flex-1 h-10 rounded-xl px-4 text-sm outline-none transition-all"
              style={{ background: S.page, border: `1px solid ${S.border}`, color: S.heading }}
              onFocus={e => { e.target.style.borderColor = S.green; e.target.style.boxShadow = `0 0 0 3px ${S.greenLt}` }}
              onBlur={e => { e.target.style.borderColor = S.border; e.target.style.boxShadow = 'none' }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white transition-all hover:brightness-105 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center" style={{ color: S.muted }}>
            AI responses are for guidance only. For official matters, contact grants@riseaxiscapital.com
          </p>
        </div>
      </div>
    </div>
  )
}

function FormattedMessage({ content }: { content: string }) {
  const parts = content.split('\n')
  return (
    <>
      {parts.map((line, i) => {
        const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        if (line.startsWith('•') || line.startsWith('-')) {
          return (
            <div key={i} className="flex gap-2 my-0.5">
              <span>•</span>
              <span dangerouslySetInnerHTML={{ __html: line.replace(/^[•\-]\s*/, '') }} />
            </div>
          )
        }
        if (line === '') return <br key={i} />
        return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: formatted }} />
      })}
    </>
  )
}
