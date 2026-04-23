import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, Trash2, Info, CheckCircle2, XCircle, DollarSign, Search as SearchIcon, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatDateShort } from '@/lib/utils'
import type { Notification } from '@/types'

const S = {
  page: '#F8FAFC', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#E2E8F0',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const TYPE_MAP: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  approval:            { icon: <CheckCircle2 size={14} />, bg: '#F0FDF4', color: '#16A34A' },
  rejection:           { icon: <XCircle size={14} />,     bg: '#FEF2F2', color: '#DC2626' },
  disbursement:        { icon: <DollarSign size={14} />,  bg: '#FFFBEB', color: '#D97706' },
  under_review:        { icon: <SearchIcon size={14} />,  bg: '#EFF6FF', color: '#2563EB' },
  documents_requested: { icon: <Info size={14} />,        bg: '#F5F3FF', color: '#7C3AED' },
  general:             { icon: <Bell size={14} />,        bg: '#F8FAFC', color: '#64748B' },
  status_update:       { icon: <CheckCircle2 size={14} />, bg: '#F0FDF4', color: '#16A34A' },
}

function TypeIcon({ type }: { type: string }) {
  const { icon, bg, color } = TYPE_MAP[type] || TYPE_MAP.general
  return (
    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: bg, border: `1px solid ${color}22`, color }}>
      {icon}
    </div>
  )
}

function SkeletonRow({ last }: { last?: boolean }) {
  return (
    <div className="flex items-start gap-4 px-5 py-4"
      style={{ borderBottom: last ? 'none' : `1px solid ${S.border}` }}>
      <div className="w-9 h-9 rounded-xl shrink-0 animate-pulse" style={{ background: S.border }} />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded animate-pulse" style={{ background: S.border }} />
        <div className="h-3 w-full rounded animate-pulse" style={{ background: S.border }} />
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: S.border }} />
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => { if (user) fetchNotifications() }, [user])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }

  async function markAllRead() {
    await supabase.from('notifications').update({ read: true }).eq('user_id', user!.id).eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function markRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-2xl space-y-5">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: S.green }}>
              Activity
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.heading }}>Notifications</h1>
            <p className="text-sm mt-0.5" style={{ color: S.muted }}>
              {unreadCount > 0 ? (
                <><strong style={{ color: S.green }}>{unreadCount}</strong> unread message{unreadCount !== 1 ? 's' : ''}</>
              ) : (
                'All caught up — no unread messages'
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={fetchNotifications}
              className="p-2 rounded-xl transition-colors"
              style={{ color: S.muted, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.background = S.border; e.currentTarget.style.color = S.heading }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.muted }}>
              <RefreshCw size={15} />
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: S.greenLt, border: `1px solid ${S.greenBd}`, color: S.green }}
                onMouseEnter={e => { e.currentTarget.style.background = S.greenBd }}
                onMouseLeave={e => { e.currentTarget.style.background = S.greenLt }}>
                <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
              </button>
            )}
          </div>
        </motion.div>

        {loading ? (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} last={i === 3} />)}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-14 text-center"
            style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: S.page, border: `1px solid ${S.border}` }}>
              <Bell className="w-7 h-7" style={{ color: S.muted }} />
            </div>
            <h3 className="text-base font-bold mb-1" style={{ color: S.heading }}>No Notifications Yet</h3>
            <p className="text-sm" style={{ color: S.muted }}>
              You'll receive updates about your applications here.
            </p>
          </motion.div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <AnimatePresence initial={false}>
              {notifications.map((n, i) => (
                <motion.div key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  className="flex gap-4 px-5 py-4 transition-colors"
                  style={{
                    borderBottom: i < notifications.length - 1 ? `1px solid ${S.border}` : 'none',
                    background: !n.read ? '#F0FDF4' : 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = !n.read ? '#DCFCE7' : S.page }}
                  onMouseLeave={e => { e.currentTarget.style.background = !n.read ? '#F0FDF4' : 'transparent' }}>

                  <TypeIcon type={n.type} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-sm font-semibold leading-snug" style={{ color: n.read ? S.body : S.heading }}>
                        {n.title}
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full shrink-0 mt-1.5 animate-pulse"
                          style={{ background: S.green }} />
                      )}
                    </div>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: S.muted }}>{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-medium" style={{ color: S.muted }}>
                        {formatDateShort(n.created_at)}
                      </span>
                      {!n.read && (
                        <button onClick={() => markRead(n.id)}
                          className="text-[10px] flex items-center gap-1 font-semibold transition-colors"
                          style={{ color: S.green }}
                          onMouseEnter={e => e.currentTarget.style.color = '#15803D'}
                          onMouseLeave={e => e.currentTarget.style.color = S.green}>
                          <Check className="w-3 h-3" /> Mark read
                        </button>
                      )}
                      <button onClick={() => deleteNotification(n.id)}
                        className="text-[10px] flex items-center gap-1 ml-auto font-semibold transition-colors"
                        style={{ color: '#DC2626' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#B91C1C'}
                        onMouseLeave={e => e.currentTarget.style.color = '#DC2626'}>
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
