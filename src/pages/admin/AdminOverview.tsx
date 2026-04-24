import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import {
  FileText, CheckCircle2, Clock,
  ArrowUpRight, TrendingUp, RefreshCw,
  ChevronRight, XCircle, Banknote,
  AlertTriangle, ArrowRight, Shield, Phone, Mail, MapPin, Activity,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

/* ── theme tokens ─────────────────────────────────────────── */
const T = {
  page:    '#FAF8F5',
  card:    '#FFFFFF',
  border:  '#EDE9E3',
  heading: '#0F172A',
  sub:     '#64748B',
  muted:   '#94A3B8',
  green:   '#16A34A',
  greenLt: '#F0FDF4',
  greenBd: '#BBF7D0',
}

function statusVariant(s: string): Parameters<typeof Badge>[0]['variant'] {
  const m: Record<string, string> = { pending:'pending', under_review:'review', approved:'approved', rejected:'rejected', disbursed:'disbursed' }
  return (m[s] || 'default') as Parameters<typeof Badge>[0]['variant']
}

function buildWeeklyData(apps: GrantApplication[]) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const now = new Date()
  return days.map((day, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - (6 - i))
    const dayApps = apps.filter(a => new Date(a.created_at).toDateString() === d.toDateString())
    return { day, applications: dayApps.length, amount: dayApps.reduce((s,a) => s+(a.requested_amount||0), 0) }
  })
}

function buildProgramData(apps: GrantApplication[]) {
  const map: Record<string, number> = {}
  apps.forEach(a => { map[a.grant_program] = (map[a.grant_program] || 0) + 1 })
  const colors = ['#6366F1','#16A34A','#F59E0B','#EF4444','#8B5CF6','#14B8A6']
  return Object.entries(map).map(([k, v], i) => ({
    name: getGrantProgramLabel(k).replace(' Assistance','').replace(' Support','').replace(' Expenses','').replace(' Development','').replace(' Funding',''),
    value: v, color: colors[i % colors.length]
  }))
}

const CardBase = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl ${className}`}
    style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
    {children}
  </div>
)

export default function AdminOverview() {
  const [apps, setApps] = useState<GrantApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true); setError(null)
    try {
      const { data, error: err } = await supabase
        .from('grant_applications').select('*').order('created_at', { ascending: false })
      if (err) throw err
      setApps((data ?? []) as GrantApplication[])
      setLastUpdated(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load. Please try again.')
    } finally { setLoading(false) }
  }

  const pending      = apps.filter(a => a.status === 'pending')
  const underReview  = apps.filter(a => a.status === 'under_review')
  const approved     = apps.filter(a => ['approved','disbursed'].includes(a.status))
  const disbursed    = apps.filter(a => a.status === 'disbursed')
  const rejected     = apps.filter(a => a.status === 'rejected')
  const totalAmt     = approved.reduce((s, a) => s + (a.approved_amount || 0), 0)
  const avgAmt       = approved.length ? totalAmt / approved.length : 0
  const approvalRate = apps.length ? Math.round((approved.length / apps.length) * 100) : 0
  const weeklyData   = buildWeeklyData(apps)
  const programData  = buildProgramData(apps)
  const recent       = apps.slice(0, 8)
  const needsAction  = [...pending, ...underReview].slice(0, 6)

  const areaData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const cnt = apps.filter(a => new Date(a.created_at) <= d).length
    return { date: label, applications: cnt }
  })

  if (loading && apps.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-4 animate-pulse"
              style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="h-7 w-24 rounded bg-slate-100" />
              <div className="h-3 w-32 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>
            Administration
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Platform Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: T.sub }}>
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </motion.div>
        <button onClick={fetchData}
          className="self-start flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-full transition-all hover:bg-slate-100"
          style={{ color: T.sub, border: `1px solid ${T.border}` }}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-5 py-3.5 flex items-center justify-between gap-3"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-3">
            <XCircle size={15} className="text-red-500 shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
          <button onClick={fetchData}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors">
            <RefreshCw size={11} /> Retry
          </button>
        </div>
      )}

      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Total Applications',  value: apps.length,           sub: `${apps.length} total`,            bg: '#EFF6FF', icon: FileText,    iconColor: '#3B82F6',  val: apps.length },
          { label: 'Pending Review',       value: pending.length + underReview.length, sub: `${underReview.length} in review`, bg: '#FFFBEB', icon: Clock, iconColor: '#F59E0B', val: pending.length + underReview.length },
          { label: 'Approved / Funded',    value: approved.length,       sub: `${approvalRate}% approval rate`,  bg: '#F0FDF4', icon: CheckCircle2, iconColor: '#16A34A', val: approved.length },
          { label: 'Total Approved ($)',   value: Math.round(totalAmt),  sub: `Avg ${formatCurrency(avgAmt)}`,   bg: '#F5F3FF', icon: Banknote,    iconColor: '#8B5CF6',  val: Math.round(totalAmt) },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 cursor-default"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: s.bg }}>
                <s.icon size={18} style={{ color: s.iconColor }} strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full truncate max-w-[120px]"
                style={{ background: '#F8FAFC', color: T.muted, border: `1px solid ${T.border}` }}>
                {s.sub}
              </span>
            </div>
            <div className="text-[28px] font-bold tracking-tight leading-none" style={{ color: T.heading }}>
              {s.label.includes('$') ? formatCurrency(s.val) : s.val.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold uppercase tracking-wider mt-1.5" style={{ color: T.muted }}>
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Secondary Metrics ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending',      value: pending.length,      bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
          { label: 'Under Review', value: underReview.length,  bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' },
          { label: 'Rejected',     value: rejected.length,     bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
          { label: 'Disbursed',    value: disbursed.length,    bg: '#F5F3FF', color: '#7C3AED', border: '#DDD6FE' },
        ].map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.2 }}
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: s.bg, border: `1px solid ${s.border}` }}>
            <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
            <span className="text-lg font-bold" style={{ color: s.color }}>{s.value}</span>
          </motion.div>
        ))}
      </div>

      {/* ── Charts ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        {/* Area chart */}
        <CardBase className="md:col-span-1 lg:col-span-3 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-bold" style={{ color: T.heading }}>Application Growth</div>
              <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>Cumulative 14-day trend</div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
              style={{ background: '#EFF6FF', color: '#3B82F6', border: '1px solid #BFDBFE' }}>
              <TrendingUp size={10} /> Trending
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-blue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EDE9E3', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                labelStyle={{ fontWeight: 600, color: '#0F172A' }}
                itemStyle={{ color: '#64748B' }} />
              <Area type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2.5} fill="url(#grad-blue)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </CardBase>

        {/* Weekly bar chart */}
        <CardBase className="lg:col-span-2 p-5">
          <div className="mb-5">
            <div className="text-sm font-bold" style={{ color: T.heading }}>Weekly Activity</div>
            <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>Applications by day</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #EDE9E3', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                cursor={{ fill: 'rgba(99,102,241,0.05)' }}
                itemStyle={{ color: '#64748B' }} />
              <Bar dataKey="applications" radius={[6,6,0,0]}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={i === weeklyData.length - 1 ? '#6366F1' : '#E2E8F0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardBase>
      </div>

      {/* ── Program Breakdown ─────────────────────────────────── */}
      {programData.length > 0 && (
        <CardBase className="p-5">
          <div className="text-sm font-bold mb-4" style={{ color: T.heading }}>Applications by Program</div>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {programData.map(p => (
              <div key={p.name} className="text-center p-3 rounded-xl transition-all hover:shadow-sm"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                <div className="text-2xl font-bold mb-1" style={{ color: p.color }}>{p.value}</div>
                <div className="text-[10px] font-medium leading-tight" style={{ color: T.muted }}>{p.name}</div>
                <div className="mt-2 h-1 rounded-full" style={{ backgroundColor: p.color, opacity: 0.4 }} />
              </div>
            ))}
          </div>
        </CardBase>
      )}

      {/* ── Conversion Funnel ─────────────────────────────────── */}
      <CardBase className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-sm font-bold" style={{ color: T.heading }}>Application Funnel</div>
            <div className="text-xs" style={{ color: T.muted }}>Conversion from submission to disbursement</div>
          </div>
          <div className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
            Live Data
          </div>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Applications Submitted', count: apps.length,         color: '#6366F1', bg: '#EEF2FF' },
            { label: 'Under Review',           count: underReview.length,  color: '#F59E0B', bg: '#FFFBEB' },
            { label: 'Approved',               count: approved.length,     color: '#16A34A', bg: '#F0FDF4' },
            { label: 'Funds Disbursed',        count: disbursed.length,    color: '#7C3AED', bg: '#F5F3FF' },
          ].map((step, i, arr) => {
            const pct = arr[0].count > 0 ? Math.max(4, Math.round((step.count / arr[0].count) * 100)) : 0
            const conv = i > 0 && arr[i - 1].count > 0 ? Math.round((step.count / arr[i - 1].count) * 100) : null
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium" style={{ color: T.sub }}>{step.label}</span>
                  <div className="flex items-center gap-3">
                    {conv !== null && (
                      <span className="text-[10px] font-bold" style={{ color: T.muted }}>{conv}% from prev.</span>
                    )}
                    <span className="font-bold" style={{ color: step.color }}>{step.count}</span>
                  </div>
                </div>
                <div className="h-7 rounded-xl overflow-hidden" style={{ background: step.bg }}>
                  <div className="h-full rounded-xl flex items-center px-3 text-[10px] font-bold text-white transition-all"
                    style={{ width: `${pct}%`, background: step.color, minWidth: step.count > 0 ? '2.5rem' : 0 }}>
                    {step.count > 0 ? `${pct}%` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardBase>

      {/* ── Needs Action + Recent ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Needs Action */}
        <CardBase className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: `1px solid ${T.border}`, background: '#FFFBEB' }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-sm font-bold text-amber-700">Requires Action</span>
            </div>
            <span className="text-[10px] font-bold bg-amber-500 text-white rounded-full px-2 py-0.5 min-w-[20px] text-center">
              {needsAction.length}
            </span>
          </div>
          {needsAction.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: T.greenLt }}>
                <CheckCircle2 size={18} style={{ color: T.green }} />
              </div>
              <p className="text-xs font-medium" style={{ color: T.muted }}>All applications up to date</p>
            </div>
          ) : (
            <div style={{ divideColor: T.border }}>
              {needsAction.map((app, i) => (
                <div key={app.id} className="px-5 py-3.5 transition-colors hover:bg-slate-50"
                  style={{ borderBottom: i < needsAction.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: '#F1F5F9', color: T.muted }}>
                      {app.app_number}
                    </span>
                    <Badge variant={statusVariant(app.status)} className="text-[10px]">{getStatusLabel(app.status)}</Badge>
                  </div>
                  <div className="text-[13px] font-semibold truncate mb-0.5" style={{ color: T.heading }}>{app.full_name}</div>
                  <div className="text-[11px]" style={{ color: T.muted }}>{getGrantProgramLabel(app.grant_program)}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold" style={{ color: T.heading }}>{formatCurrency(app.requested_amount)}</span>
                    <Link to={`/admin/applications/${app.id}`}
                      className="text-[11px] font-semibold flex items-center gap-0.5 transition-colors hover:underline"
                      style={{ color: '#6366F1' }}>
                      Review <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="px-5 py-3" style={{ borderTop: `1px solid ${T.border}`, background: '#F8FAFC' }}>
            <Link to="/admin/applications?status=pending"
              className="text-[11px] font-semibold flex items-center gap-1 transition-colors hover:underline"
              style={{ color: T.muted }}>
              View all pending <ChevronRight size={12} />
            </Link>
          </div>
        </CardBase>

        {/* Recent Applications */}
        <CardBase className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
            <div className="text-sm font-bold" style={{ color: T.heading }}>Recent Applications</div>
            <Link to="/admin/applications"
              className="text-[11px] font-semibold flex items-center gap-0.5 transition-colors"
              style={{ color: '#6366F1' }}>
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          <div>
            {recent.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2"
                  style={{ background: '#F1F5F9' }}>
                  <FileText size={16} style={{ color: T.muted }} />
                </div>
                <p className="text-xs font-medium" style={{ color: T.muted }}>No applications yet</p>
              </div>
            ) : recent.map((app, i) => (
              <Link key={app.id} to={`/admin/applications/${app.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50 group"
                style={{ borderBottom: i < recent.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: '#EFF6FF' }}>
                  <FileText size={14} style={{ color: '#3B82F6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: T.heading }}>{app.full_name}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                    {getGrantProgramLabel(app.grant_program)} · {formatDateShort(app.created_at)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: T.heading }}>{formatCurrency(app.requested_amount)}</div>
                  <Badge variant={statusVariant(app.status)} className="text-[10px] mt-0.5">{getStatusLabel(app.status)}</Badge>
                </div>
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: T.muted }} />
              </Link>
            ))}
          </div>
        </CardBase>
      </div>

      {/* ── Program Performance ──────────────────────────────── */}
      <CardBase className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#6366F1' }}>Program Performance Summary</span>
          <span className="text-[10px] font-medium" style={{ color: T.muted }}>FY 2025–2026</span>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y" style={{ borderColor: T.border }}>
          {[
            { prog: 'emergency_assistance',  label: 'Emergency Assistance' },
            { prog: 'education_support',     label: 'Education Support' },
            { prog: 'medical_expenses',      label: 'Medical Expenses' },
            { prog: 'community_development', label: 'Community Development' },
            { prog: 'business_funding',      label: 'Business Funding' },
            { prog: 'other',                 label: 'Other Needs' },
          ].map(({ prog, label }) => {
            const pa   = apps.filter(a => a.grant_program === prog)
            const pr   = pa.filter(a => ['approved','disbursed'].includes(a.status))
            const px   = pa.filter(a => a.status === 'rejected')
            const pd   = pa.filter(a => a.status === 'disbursed').reduce((s,a) => s+(a.approved_amount||0),0)
            const pavg = pr.length ? pr.reduce((s,a)=>s+(a.approved_amount||0),0)/pr.length : 0
            return (
              <div key={prog} className="px-4 py-3.5">
                <div className="font-semibold text-sm mb-2" style={{ color: T.heading }}>{label}</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Total', val: pa.length, color: T.sub },
                    { label: 'Approved', val: `${pr.length}${pa.length > 0 ? ` (${Math.round(pr.length/pa.length*100)}%)` : ''}`, color: T.green },
                    { label: 'Rejected', val: px.length, color: '#EF4444' },
                  ].map(c => (
                    <div key={c.label} className="text-center p-2 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                      <div className="text-[11px] font-bold" style={{ color: c.color }}>{c.val}</div>
                      <div className="text-[9px]" style={{ color: T.muted }}>{c.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px]" style={{ color: T.muted }}>Disbursed: <span className="font-semibold" style={{ color: T.heading }}>{formatCurrency(pd)}</span></span>
                  <span className="text-[11px]" style={{ color: T.muted }}>Avg: <span className="font-semibold" style={{ color: T.heading }}>{pavg > 0 ? formatCurrency(pavg) : '—'}</span></span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
                {['Grant Program','Applications','Approved','Rejected','Total Disbursed','Avg. Award'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-wider" style={{ color: T.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { prog: 'emergency_assistance',  label: 'Emergency Assistance' },
                { prog: 'education_support',     label: 'Education Support' },
                { prog: 'medical_expenses',      label: 'Medical Expenses' },
                { prog: 'community_development', label: 'Community Development' },
                { prog: 'business_funding',      label: 'Business Funding' },
                { prog: 'other',                 label: 'Other Needs' },
              ].map(({ prog, label }, ri) => {
                const pa   = apps.filter(a => a.grant_program === prog)
                const pr   = pa.filter(a => ['approved','disbursed'].includes(a.status))
                const px   = pa.filter(a => a.status === 'rejected')
                const pd   = pa.filter(a => a.status === 'disbursed').reduce((s,a) => s+(a.approved_amount||0),0)
                const pavg = pr.length ? pr.reduce((s,a)=>s+(a.approved_amount||0),0)/pr.length : 0
                return (
                  <tr key={prog} className="transition-colors hover:bg-slate-50"
                    style={{ borderBottom: ri < 5 ? `1px solid ${T.border}` : 'none' }}>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: T.heading }}>{label}</td>
                    <td className="px-5 py-3.5" style={{ color: T.sub }}>{pa.length}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold" style={{ color: T.green }}>{pr.length}</span>
                      {pa.length > 0 && <span className="ml-1.5" style={{ color: T.muted }}>({Math.round(pr.length/pa.length*100)}%)</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-red-500">{px.length}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold" style={{ color: T.heading }}>{formatCurrency(pd)}</td>
                    <td className="px-5 py-3.5" style={{ color: T.sub }}>{pavg > 0 ? formatCurrency(pavg) : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardBase>

      {/* ── System Info ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CardBase className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={14} style={{ color: '#6366F1' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Organization</span>
          </div>
          <div className="space-y-2.5">
            {[
              ['Name',          'RiseAxis Capital Funding'],
              ['Legal Status',  '501(c)(3) Certified'],
              ['EIN',           '27-0964813'],
              ['Jurisdiction',  'Washington, DC, USA'],
              ['Founded',       '2019'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-[11px] font-medium" style={{ color: T.muted }}>{k}</span>
                <span className="text-[11px] font-semibold text-right" style={{ color: T.heading }}>{v}</span>
              </div>
            ))}
          </div>
        </CardBase>

        <CardBase className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} style={{ color: '#3B82F6' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Guidelines</span>
          </div>
          <div className="space-y-2.5">
            {[
              ['Standard Review',   '5–10 business days'],
              ['Complex Cases',     'Up to 15 business days'],
              ['Max Emergency',     '$10,000'],
              ['Max Business',      '$50,000'],
              ['IRS Threshold',     '$600+'],
              ['Disbursement',      'ACH Direct Transfer'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-[11px] font-medium" style={{ color: T.muted }}>{k}</span>
                <span className="text-[11px] font-semibold text-right" style={{ color: T.heading }}>{v}</span>
              </div>
            ))}
          </div>
        </CardBase>

        <CardBase className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={13} style={{ color: '#8B5CF6' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted }}>Program Office</span>
          </div>
          <div className="space-y-3.5">
            {[
              { icon: Phone, label: 'Direct Line', val: '(702) 274-7227' },
              { icon: Mail,  label: 'Email',       val: 'grants@riseaxiscapital.com' },
              { icon: Clock, label: 'Hours',       val: 'Mon–Fri, 9AM–6PM EST' },
              { icon: MapPin,label: 'Address',     val: '3040 Idaho Ave NW, Washington, DC 20016' },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#F5F3FF' }}>
                  <row.icon size={11} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>{row.label}</div>
                  <div className="text-[12px] font-medium mt-0.5" style={{ color: T.heading }}>{row.val}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBase>
      </div>

    </div>
  )
}
