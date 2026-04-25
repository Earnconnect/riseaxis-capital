import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldCheck, Search, Filter, Loader2, Download,
  CheckCircle2, XCircle, Edit3, DollarSign, User,
  RefreshCw, Eye,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { GrantApplication } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  violet: '#7C3AED', violetLt: '#F5F3FF',
}

type AuditAction = 'approved' | 'rejected' | 'status_change' | 'disbursed' | 'reviewed' | 'notes_updated'

interface AuditEntry {
  id: string
  app_number: string
  application_id: string
  applicant_name: string
  action: AuditAction
  detail: string
  admin_name: string
  timestamp: string
}

const ACTION_CONFIG: Record<AuditAction, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  approved:       { label: 'Approved',        color: '#16A34A', bg: '#F0FDF4', icon: CheckCircle2 },
  rejected:       { label: 'Rejected',        color: '#DC2626', bg: '#FEF2F2', icon: XCircle      },
  disbursed:      { label: 'Disbursed',       color: '#0891B2', bg: '#ECFEFF', icon: DollarSign   },
  status_change:  { label: 'Status Changed',  color: '#D97706', bg: '#FFFBEB', icon: RefreshCw    },
  reviewed:       { label: 'Reviewed',        color: T.violet,  bg: '#F5F3FF', icon: Eye          },
  notes_updated:  { label: 'Notes Updated',   color: '#475569', bg: '#F1F5F9', icon: Edit3        },
}

function deriveAction(app: GrantApplication): AuditAction {
  if (app.status === 'approved') return 'approved'
  if (app.status === 'rejected') return 'rejected'
  if (app.status === 'disbursed') return 'disbursed'
  if (app.status === 'under_review') return 'reviewed'
  if (app.reviewer_notes) return 'notes_updated'
  return 'status_change'
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('grant_applications')
        .select('*')
        .not('reviewed_by', 'is', null)
        .order('reviewed_at', { ascending: false })

      const derived: AuditEntry[] = ((data as GrantApplication[]) ?? []).map(app => ({
        id:             app.id,
        app_number:     app.app_number,
        application_id: app.id,
        applicant_name: app.full_name,
        action:         deriveAction(app),
        detail:         app.rejection_reason
          ? `Reason: ${app.rejection_reason}`
          : app.reviewer_notes
            ? `Notes: ${app.reviewer_notes.slice(0, 80)}…`
            : `Status set to ${app.status.replace('_', ' ')}`,
        admin_name:  app.reviewed_by ?? 'Admin',
        timestamp:   app.reviewed_at ?? app.updated_at,
      }))
      setEntries(derived)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = entries.filter(e => {
    const matchSearch = !search ||
      e.app_number.toLowerCase().includes(search.toLowerCase()) ||
      e.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      e.admin_name.toLowerCase().includes(search.toLowerCase())
    const matchAction = actionFilter === 'all' || e.action === actionFilter
    return matchSearch && matchAction
  })

  function exportCSV() {
    const rows = [
      ['Timestamp', 'Application #', 'Applicant', 'Action', 'Detail', 'Admin'],
      ...filtered.map(e => [
        new Date(e.timestamp).toLocaleString(),
        e.app_number, e.applicant_name, e.action, e.detail, e.admin_name,
      ]),
    ]
    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = `audit-log-${Date.now()}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Audit Log</h1>
          <p className="text-sm" style={{ color: T.muted }}>Record of all admin actions on applications</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${T.violet}, #6D28D9)` }}>
          <Download size={14} /> Export CSV
        </button>
      </motion.div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button onClick={() => setActionFilter('all')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{ background: actionFilter === 'all' ? T.violet : T.white, color: actionFilter === 'all' ? '#fff' : T.body, border: `1px solid ${actionFilter === 'all' ? T.violet : T.border}` }}>
          All ({entries.length})
        </button>
        {(Object.keys(ACTION_CONFIG) as AuditAction[]).map(key => {
          const cfg   = ACTION_CONFIG[key]
          const count = entries.filter(e => e.action === key).length
          if (count === 0) return null
          return (
            <button key={key} onClick={() => setActionFilter(key)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: actionFilter === key ? cfg.color : cfg.bg, color: actionFilter === key ? '#fff' : cfg.color, border: `1px solid ${cfg.color}30` }}>
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by app number, applicant, or admin name…"
          className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none"
          style={{ background: T.white, border: `1px solid ${T.border}`, color: T.navy }} />
      </div>

      {/* Log table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} style={{ color: T.violet }} />
            <h2 className="font-bold text-sm" style={{ color: T.navy }}>Audit Trail</h2>
          </div>
          <span className="text-xs" style={{ color: T.muted }}>{filtered.length} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin" style={{ color: T.violet }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ShieldCheck size={40} style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>No audit entries found</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {['Timestamp', 'Application', 'Applicant', 'Action', 'Detail', 'Admin'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider" style={{ color: T.muted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: T.border }}>
                  {filtered.map(entry => {
                    const cfg = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.status_change
                    const Icon = cfg.icon
                    return (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: T.muted }}>
                          {new Date(entry.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-mono font-semibold" style={{ color: T.navy }}>#{entry.app_number}</span>
                        </td>
                        <td className="px-5 py-3 text-sm" style={{ color: T.body }}>{entry.applicant_name}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            <Icon size={11} />
                            {cfg.label}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs max-w-[200px] truncate" style={{ color: T.body }}>{entry.detail}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
                            <User size={11} />
                            {entry.admin_name}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
              {filtered.map(entry => {
                const cfg  = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.status_change
                const Icon = cfg.icon
                return (
                  <div key={entry.id} className="px-4 py-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: cfg.bg }}>
                      <Icon size={13} style={{ color: cfg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold" style={{ color: T.navy }}>#{entry.app_number}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                      <div className="text-xs mt-0.5 truncate" style={{ color: T.body }}>{entry.applicant_name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                        {entry.admin_name} · {new Date(entry.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
