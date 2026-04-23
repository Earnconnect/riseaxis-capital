import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronRight, FileText, Clock, CheckCircle2, DollarSign, RefreshCw, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A',
}

function statusVariant(s: string): Parameters<typeof Badge>[0]['variant'] {
  const m: Record<string,string> = { pending:'pending', under_review:'review', approved:'approved', rejected:'rejected', disbursed:'disbursed' }
  return (m[s]||'default') as Parameters<typeof Badge>[0]['variant']
}

const STATUS_TABS = [
  { key:'all',          label:'All' },
  { key:'pending',      label:'Pending' },
  { key:'under_review', label:'In Review' },
  { key:'approved',     label:'Approved' },
  { key:'disbursed',    label:'Disbursed' },
  { key:'rejected',     label:'Rejected' },
]

const KPI_DEFS = [
  { label:'Total Applications', icon: FileText,    bg:'#EFF6FF', color:'#3B82F6', border:'#BFDBFE' },
  { label:'Pending Review',     icon: Clock,       bg:'#FFFBEB', color:'#F59E0B', border:'#FDE68A' },
  { label:'Approved/Funded',    icon: CheckCircle2,bg:'#F0FDF4', color:'#16A34A', border:'#BBF7D0' },
  { label:'Total Approved ($)', icon: DollarSign,  bg:'#F5F3FF', color:'#8B5CF6', border:'#DDD6FE' },
]

export default function ApplicationsDashboard() {
  const [searchParams] = useSearchParams()
  const [apps, setApps]       = useState<GrantApplication[]>([])
  const [search, setSearch]   = useState('')
  const [tab, setTab]         = useState(searchParams.get('status') || 'all')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchApps() }, [tab])

  async function fetchApps() {
    setLoading(true)
    let q = supabase.from('grant_applications').select('*').order('created_at', { ascending: false })
    if (tab !== 'all') q = q.eq('status', tab)
    const { data } = await q
    if (data) setApps(data as GrantApplication[])
    setLoading(false)
  }

  const filtered = apps.filter(a =>
    !search ||
    a.full_name.toLowerCase().includes(search.toLowerCase()) ||
    a.app_number.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all:         apps.length,
    pending:     apps.filter(a => a.status==='pending').length,
    under_review:apps.filter(a => a.status==='under_review').length,
    approved:    apps.filter(a => a.status==='approved').length,
    disbursed:   apps.filter(a => a.status==='disbursed').length,
    rejected:    apps.filter(a => a.status==='rejected').length,
  }

  const totalApproved = apps.filter(a => ['approved','disbursed'].includes(a.status)).reduce((s,a) => s+(a.approved_amount||0), 0)

  const kpiValues = [counts.all, counts.pending, counts.approved+counts.disbursed, Math.round(totalApproved)]

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Administration</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Grant Applications</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>Review and manage all submitted grant applications</p>
        </motion.div>
        <button onClick={fetchApps}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:bg-slate-100"
          style={{ color: T.sub, border: `1px solid ${T.border}` }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_DEFS.map((def, i) => (
          <motion.div key={def.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: def.bg, border: `1px solid ${def.border}` }}>
              <def.icon size={16} style={{ color: def.color }} />
            </div>
            <div>
              <div className="text-xl font-bold" style={{ color: T.heading }}>
                {def.label.includes('$') ? formatCurrency(kpiValues[i]) : kpiValues[i].toLocaleString()}
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide mt-0.5" style={{ color: T.muted }}>{def.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl p-4 space-y-3"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Tab pills — horizontal scroll on mobile */}
        <div className="flex gap-1 p-1 rounded-xl overflow-x-auto hide-scrollbar"
          style={{ background: '#F1F5F9' }}>
          {STATUS_TABS.map(t => {
            const isActive = tab === t.key
            const count = t.key !== 'all' ? counts[t.key as keyof typeof counts] : null
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0"
                style={isActive
                  ? { background: T.heading, color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                  : { color: T.sub }}>
                {t.label}
                {count !== null && count > 0 && (
                  <span className="ml-1.5 text-[10px]" style={{ color: isActive ? 'rgba(255,255,255,0.6)' : T.muted }}>
                    ({count})
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: T.muted }} />
            <input
              placeholder="Search name, app number, email…"
              className="w-full h-9 pl-9 pr-4 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={e => { e.currentTarget.style.borderColor = '#16A34A'; e.currentTarget.style.background = '#fff' }}
              onBlur={e  => { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.background = '#F8FAFC' }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium shrink-0" style={{ color: T.muted }}>
            <Filter size={12} /> {filtered.length}
          </div>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 5 ? `1px solid ${T.border}` : 'none' }}>
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-4 w-32 rounded bg-slate-100 flex-1" />
                <div className="h-4 w-28 rounded bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
                <div className="h-5 w-20 rounded-full bg-slate-100" />
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
              <FileText className="w-7 h-7" style={{ color: T.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: T.sub }}>No applications match your filters</p>
            <p className="text-xs mt-1" style={{ color: T.muted }}>Try adjusting the search or status filter</p>
          </div>
        ) : (
          <>
            {/* Mobile card list (hidden md+) */}
            <div className="md:hidden">
              {filtered.map((app, i) => (
                <Link key={app.id} to={`/admin/applications/${app.id}`}
                  className="flex items-start gap-3 px-4 py-4 transition-colors active:bg-slate-50"
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: '#EFF6FF' }}>
                    <FileText size={14} style={{ color: '#3B82F6' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: '#F1F5F9', color: T.muted }}>{app.app_number}</span>
                      <Badge variant={statusVariant(app.status)} className="text-[10px]">{getStatusLabel(app.status)}</Badge>
                    </div>
                    <div className="font-semibold text-sm truncate" style={{ color: T.heading }}>{app.full_name}</div>
                    <div className="text-xs mt-0.5 truncate" style={{ color: T.muted }}>{app.email}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: T.sub }}>{getGrantProgramLabel(app.grant_program)}</span>
                      <span style={{ color: T.muted }}>·</span>
                      <span className="text-xs font-bold" style={{ color: T.heading }}>{formatCurrency(app.requested_amount)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px]" style={{ color: T.muted }}>{formatDateShort(app.created_at)}</div>
                    <ChevronRight size={14} className="mt-2 ml-auto" style={{ color: T.muted }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Desktop table (hidden below md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                    {['App Number','Applicant','Program','Requested','Status','Date',''].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => (
                    <tr key={app.id} className="group transition-colors hover:bg-slate-50"
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[11px] px-2 py-1 rounded-lg"
                          style={{ background: '#F1F5F9', color: T.sub }}>
                          {app.app_number}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sm" style={{ color: T.heading }}>{app.full_name}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.muted }}>{app.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: T.sub }}>{getGrantProgramLabel(app.grant_program)}</td>
                      <td className="px-5 py-3.5 font-bold text-sm" style={{ color: T.heading }}>{formatCurrency(app.requested_amount)}</td>
                      <td className="px-5 py-3.5"><Badge variant={statusVariant(app.status)}>{getStatusLabel(app.status)}</Badge></td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: T.muted }}>{formatDateShort(app.created_at)}</td>
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/applications/${app.id}`}
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-semibold"
                          style={{ color: T.green }}>
                          Review <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
