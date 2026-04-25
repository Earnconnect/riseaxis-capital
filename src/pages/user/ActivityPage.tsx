import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, FileText, Bell, DollarSign, User,
  CheckCircle2, XCircle, Clock, Upload, Loader2,
  ChevronRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { GrantApplication, Notification, AppDocument } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A',
}

type EventType = 'application' | 'notification' | 'document' | 'profile'

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  detail: string
  timestamp: string
  color: string
  icon: React.ElementType
  linkTo?: string
}

function statusColor(status: string) {
  if (status === 'approved' || status === 'disbursed') return '#16A34A'
  if (status === 'rejected')  return '#DC2626'
  if (status === 'under_review') return '#D97706'
  return '#2563EB'
}

function statusIcon(status: string) {
  if (status === 'approved' || status === 'disbursed') return CheckCircle2
  if (status === 'rejected')  return XCircle
  if (status === 'under_review') return Clock
  return FileText
}

const STATUS_LABELS: Record<string, string> = {
  pending:      'submitted and is pending review',
  under_review: 'moved to Under Review',
  approved:     'was approved',
  rejected:     'was rejected',
  disbursed:    'funds were disbursed',
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [events, setEvents]   = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      const [appsRes, notifsRes, docsRes] = await Promise.all([
        supabase.from('grant_applications').select('*').eq('user_id', user!.id).order('updated_at', { ascending: false }),
        supabase.from('notifications').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(30),
        supabase.from('app_documents').select('*').eq('user_id', user!.id).order('uploaded_at', { ascending: false }),
      ])

      const appEvents: TimelineEvent[] = ((appsRes.data ?? []) as GrantApplication[]).map(app => ({
        id:        `app-${app.id}`,
        type:      'application',
        title:     `Application #${app.app_number}`,
        detail:    `Application ${STATUS_LABELS[app.status] ?? `status: ${app.status}`}`,
        timestamp: app.updated_at,
        color:     statusColor(app.status),
        icon:      statusIcon(app.status),
        linkTo:    `/applications/${app.id}`,
      }))

      const notifEvents: TimelineEvent[] = ((notifsRes.data ?? []) as Notification[]).map(n => ({
        id:        `notif-${n.id}`,
        type:      'notification',
        title:     n.title,
        detail:    n.message,
        timestamp: n.created_at,
        color:     '#7C3AED',
        icon:      Bell,
        linkTo:    '/notifications',
      }))

      const docEvents: TimelineEvent[] = ((docsRes.data ?? []) as AppDocument[]).map(d => ({
        id:        `doc-${d.id}`,
        type:      'document',
        title:     'Document Uploaded',
        detail:    d.file_name,
        timestamp: d.uploaded_at,
        color:     '#0891B2',
        icon:      Upload,
        linkTo:    '/documents',
      }))

      const all = [...appEvents, ...notifEvents, ...docEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 60)

      setEvents(all)
      setLoading(false)
    }
    load()
  }, [user])

  // Group by date
  const grouped: Record<string, TimelineEvent[]> = {}
  events.forEach(e => {
    const d = new Date(e.timestamp)
    const today    = new Date()
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    let label: string
    if (d.toDateString() === today.toDateString()) label = 'Today'
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
    else label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(e)
  })

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Activity</h1>
        <p className="text-sm" style={{ color: T.muted }}>A complete history of all actions on your account</p>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Application update', color: T.green },
          { label: 'Notification',       color: '#7C3AED' },
          { label: 'Document upload',    color: '#0891B2' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={24} className="animate-spin" style={{ color: T.green }} />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Activity size={40} style={{ color: T.border }} />
          <p className="text-sm" style={{ color: T.muted }}>No activity yet</p>
          <Link to="/apply" className="text-sm font-semibold" style={{ color: T.green }}>
            Start your first application →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([dateLabel, items], gi) => (
            <motion.div key={dateLabel} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.04 }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>{dateLabel}</span>
                <div className="flex-1 h-px" style={{ background: T.border }} />
                <span className="text-xs" style={{ color: T.muted }}>{items.length} events</span>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
                {items.map((event, idx) => {
                  const Icon = event.icon
                  return (
                    <div key={event.id}
                      className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-50"
                      style={{ borderBottom: idx < items.length - 1 ? `1px solid ${T.border}` : 'none' }}>

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${event.color}12`, border: `1px solid ${event.color}25` }}>
                        <Icon size={14} style={{ color: event.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm font-semibold" style={{ color: T.navy }}>{event.title}</span>
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: T.body }}>{event.detail}</p>
                      </div>

                      {/* Time + link */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px]" style={{ color: T.muted }}>
                          {new Date(event.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {event.linkTo && (
                          <Link to={event.linkTo}
                            className="p-1 rounded-lg transition-colors hover:bg-slate-100"
                            style={{ color: T.muted }}>
                            <ChevronRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
