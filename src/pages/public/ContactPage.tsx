import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, Mail, MapPin, Clock, Send, CheckCircle2,
  MessageSquare, Loader2, Shield, ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const G = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const CONTACT_INFO = [
  {
    icon: Phone, label: 'Phone', value: '(702) 274-7227',
    sub: 'Mon – Fri, 9 AM – 6 PM EST',
    href: 'tel:7022747227', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
  },
  {
    icon: Mail, label: 'Email', value: 'grants@riseaxiscapital.com',
    sub: 'We respond within 1–2 business days',
    href: 'mailto:grants@riseaxiscapital.com', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE',
  },
  {
    icon: MapPin, label: 'Office', value: '3040 Idaho Ave NW',
    sub: 'Washington, DC 20016',
    href: 'https://maps.google.com/?q=3040+Idaho+Ave+NW+Washington+DC', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE',
  },
  {
    icon: Clock, label: 'Hours', value: 'Mon – Fri',
    sub: '9:00 AM – 6:00 PM Eastern Time',
    href: null, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
  },
]

const TOPICS = [
  'Application Status Inquiry',
  'Document Upload Help',
  'Disbursement / Payment Question',
  'Technical Issue',
  'Eligibility Question',
  'Other',
]

type FormState = { name: string; email: string; phone: string; topic: string; message: string }

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', topic: '', message: '' })
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [errors,   setErrors]   = useState<Partial<FormState>>({})

  function validate() {
    const e: Partial<FormState> = {}
    if (!form.name.trim())    e.name    = 'Please enter your name.'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.topic)          e.topic   = 'Please select a topic.'
    if (form.message.trim().length < 20) e.message = 'Message must be at least 20 characters.'
    return e
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSending(true)
    await new Promise(r => setTimeout(r, 1200))
    setSending(false)
    setSent(true)
  }

  const inputBase = 'w-full rounded-xl px-4 text-sm outline-none transition-all'
  const inputStyle = { background: G.page, border: `1px solid ${G.border}`, color: G.heading }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = G.green
    e.target.style.boxShadow   = `0 0 0 3px ${G.greenLt}`
    e.target.style.background  = '#fff'
  }
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = G.border
    e.target.style.boxShadow   = 'none'
    e.target.style.background  = G.page
  }

  return (
    <div style={{ background: G.page }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-16 text-center"
        style={{ background: 'linear-gradient(160deg, #FFFFFF 0%, #F0F7FF 55%, #F0FDF4 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-2xl mx-auto px-5">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: G.green }} />
            <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: G.green }}>
              Get in Touch
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold tracking-tight mb-4" style={{ color: G.heading }}>
            We're Here to Help
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
            className="text-lg leading-relaxed" style={{ color: G.body }}>
            Have a question about our grant programs, your application, or need technical support? Our team is ready to assist.
          </motion.p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Left: Contact Info ────────────────────────── */}
          <div className="space-y-5">
            {CONTACT_INFO.map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                {item.href ? (
                  <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                    className="flex items-start gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: G.muted }}>{item.label}</div>
                      <div className="text-sm font-bold" style={{ color: G.heading }}>{item.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: G.muted }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={14} className="ml-auto mt-1" style={{ color: G.muted }} />
                  </a>
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-2xl"
                    style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: G.muted }}>{item.label}</div>
                      <div className="text-sm font-bold" style={{ color: G.heading }}>{item.value}</div>
                      <div className="text-xs mt-0.5" style={{ color: G.muted }}>{item.sub}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {/* AI Alternative */}
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.32 }}
              className="rounded-2xl p-5"
              style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={15} className="text-green-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-green-400">AI Assistant</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Get instant answers 24/7 from our AI Grant Support Assistant — no wait time.
              </p>
              <Link to="/apply/chat"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.3)' }}>
                Chat Now <ChevronRight size={14} />
              </Link>
            </motion.div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
              <Shield size={13} style={{ color: G.green }} />
              <span className="text-xs font-medium" style={{ color: G.green }}>
                501(c)(3) Certified · EIN 27-0964813 · All communications are confidential
              </span>
            </div>
          </div>

          {/* ── Right: Contact Form ───────────────────────── */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="rounded-2xl p-8"
              style={{ background: G.white, border: `1px solid ${G.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

              {sent ? (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: G.greenLt, border: `1px solid ${G.greenBd}` }}>
                    <CheckCircle2 size={28} style={{ color: G.green }} />
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: G.heading }}>Message Sent!</h2>
                  <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto" style={{ color: G.body }}>
                    Thank you for reaching out. Our team will respond to your inquiry within 1–2 business days.
                  </p>
                  <button onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', topic:'', message:'' }) }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
                    style={{ background: G.greenLt, color: G.green, border: `1px solid ${G.greenBd}` }}>
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div>
                    <h2 className="text-lg font-bold mb-1" style={{ color: G.heading }}>Send Us a Message</h2>
                    <p className="text-sm" style={{ color: G.muted }}>Fill out the form below and we'll get back to you shortly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: G.muted }}>Full Name *</label>
                      <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="John Smith"
                        className={inputBase + ' h-10'} style={inputStyle} onFocus={focus} onBlur={blur} />
                      {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: G.muted }}>Email Address *</label>
                      <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        type="email" placeholder="you@example.com"
                        className={inputBase + ' h-10'} style={inputStyle} onFocus={focus} onBlur={blur} />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: G.muted }}>Phone (optional)</label>
                      <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                        type="tel" placeholder="(000) 000-0000"
                        className={inputBase + ' h-10'} style={inputStyle} onFocus={focus} onBlur={blur} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: G.muted }}>Topic *</label>
                      <select value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                        className={inputBase + ' h-10 cursor-pointer'} style={inputStyle} onFocus={focus} onBlur={blur}>
                        <option value="">Select a topic…</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.topic && <p className="text-xs text-red-500">{errors.topic}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wide" style={{ color: G.muted }}>Message *</label>
                    <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      rows={6} placeholder="Describe your question or issue in detail…"
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                      style={inputStyle} onFocus={focus} onBlur={blur} />
                    <div className="flex items-center justify-between">
                      {errors.message
                        ? <p className="text-xs text-red-500">{errors.message}</p>
                        : <span />
                      }
                      <span className="text-xs" style={{ color: G.muted }}>{form.message.length} chars</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2">
                    <p className="text-xs" style={{ color: G.muted }}>
                      By submitting, you agree to our{' '}
                      <Link to="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
                    </p>
                    <button type="submit" disabled={sending}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:brightness-105 disabled:opacity-50 shrink-0"
                      style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
                      {sending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : <><Send size={14} /> Send Message</>}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
