import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, DollarSign, Users, FileText,
  CheckCircle2, XCircle, Clock, Loader2, ArrowUpRight,
  PieChart,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { GrantApplication } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  violet: '#7C3AED', violetLt: '#F5F3FF',
}

const PROGRAM_LABELS: Record<string, string> = {
  emergency_assistance:  'Emergency',
  education_support:     'Education',
  medical_expenses:      'Medical',
  community_development: 'Community',
  business_funding:      'Business',
  other:                 'Other',
}

const PROGRAM_COLORS: Record<string, string> = {
  emergency_assistance:  '#DC2626',
  education_support:     '#7C3AED',
  medical_expenses:      '#DB2777',
  community_development: '#0891B2',
  business_funding:      '#D97706',
  other:                 '#64748B',
}

const STATUS_COLORS: Record<string, string> = {
  pending:      '#2563EB',
  under_review: '#D97706',
  approved:     '#16A34A',
  rejected:     '#DC2626',
  disbursed:    '#0891B2',
}

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; color: string; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-5" style={{ background: T.white, border: `1px solid ${T.border}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <ArrowUpRight size={14} style={{ color: T.muted }} />
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: T.navy }}>{value}</div>
      <div className="text-xs font-semibold" style={{ color: T.body }}>{label}</div>
      {sub && <div className="text-[11px] mt-0.5" style={{ color: T.muted }}>{sub}</div>}
    </motion.div>
  )
}

// Simple bar chart using divs
function BarChartDiv({ data, colorMap }: { data: { label: string; value: number; key: string }[]; colorMap: Record<string, string> }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="space-y-3 pt-2">
      {data.map(item => (
        <div key={item.key}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span style={{ color: T.body }}>{item.label}</span>
            <span className="font-semibold" style={{ color: T.navy }}>{item.value}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: colorMap[item.key] ?? T.violet }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Donut chart using SVG
function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = 52; const cx = 64; const cy = 64; const strokeW = 16
  let offset = 0
  const circumference = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <svg width={128} height={128} viewBox="0 0 128 128">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F1F5F9" strokeWidth={strokeW} />
        {segments.map((seg, i) => {
          const pct = seg.value / total
          const dash = pct * circumference
          const gap  = circumference - dash
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={strokeW}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circumference}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '64px 64px', transition: 'stroke-dasharray 0.6s ease' }}
            />
          )
          offset += pct
          return el
        })}
        <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fontSize={18} fontWeight={700} fill={T.navy}>
          {total}
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span style={{ color: T.body }}>{s.label}</span>
            <span className="font-semibold ml-auto pl-3" style={{ color: T.navy }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [apps, setApps]       = useState<GrantApplication[]>([])
  const [userCount, setUserCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [appsRes, usersRes] = await Promise.all([
        supabase.from('grant_applications').select('*'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user'),
      ])
      setApps((appsRes.data as GrantApplication[]) ?? [])
      setUserCount(usersRes.count ?? 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: T.bg }}>
      <Loader2 size={24} className="animate-spin" style={{ color: T.violet }} />
    </div>
  )

  const totalDisbursed  = apps.filter(a => a.status === 'disbursed').reduce((s, a) => s + (a.approved_amount ?? 0), 0)
  const approvedCount   = apps.filter(a => a.status === 'approved' || a.status === 'disbursed').length
  const pendingCount    = apps.filter(a => a.status === 'pending').length
  const rejectedCount   = apps.filter(a => a.status === 'rejected').length
  const approvalRate    = apps.length > 0 ? Math.round((approvedCount / apps.length) * 100) : 0

  // By program
  const byProgram = Object.keys(PROGRAM_LABELS).map(key => ({
    key, label: PROGRAM_LABELS[key], value: apps.filter(a => a.grant_program === key).length,
  })).sort((a, b) => b.value - a.value)

  // By status
  const byStatus = Object.keys(STATUS_COLORS).map(key => ({
    label: key.replace('_', ' '), value: apps.filter(a => a.status === key).length, color: STATUS_COLORS[key],
  })).filter(s => s.value > 0)

  // Avg requested amount
  const avgRequested = apps.length > 0
    ? Math.round(apps.reduce((s, a) => s + a.requested_amount, 0) / apps.length)
    : 0

  // Last 6 months volume
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const count = apps.filter(a => {
      const ad = new Date(a.created_at)
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth()
    }).length
    return { key: label, label, value: count }
  })

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Analytics & Reports</h1>
        <p className="text-sm" style={{ color: T.muted }}>Platform-wide performance metrics</p>
      </motion.div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Applications"   value={apps.length}             sub="All time"              icon={FileText}    color="#2563EB" delay={0} />
        <StatCard label="Total Users"          value={userCount}               sub="Registered applicants" icon={Users}       color={T.violet} delay={0.05} />
        <StatCard label="Total Disbursed"      value={`$${totalDisbursed.toLocaleString()}`} sub="Funded grants"  icon={DollarSign}  color="#16A34A" delay={0.1} />
        <StatCard label="Approval Rate"        value={`${approvalRate}%`}      sub={`${approvedCount} approved`} icon={TrendingUp} color="#D97706" delay={0.15} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Application status donut */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl p-6" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={15} style={{ color: T.violet }} />
            <h3 className="font-bold text-sm" style={{ color: T.navy }}>Applications by Status</h3>
          </div>
          <DonutChart segments={byStatus} />
        </motion.div>

        {/* By program bars */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-6" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={15} style={{ color: T.violet }} />
            <h3 className="font-bold text-sm" style={{ color: T.navy }}>Applications by Program</h3>
          </div>
          <BarChartDiv data={byProgram} colorMap={PROGRAM_COLORS} />
        </motion.div>

        {/* Monthly volume */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl p-6" style={{ background: T.white, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} style={{ color: T.violet }} />
            <h3 className="font-bold text-sm" style={{ color: T.navy }}>Monthly Volume (6 mo.)</h3>
          </div>
          <BarChartDiv data={monthlyData} colorMap={{ [monthlyData[0]?.key]: T.violet }} />
        </motion.div>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review',  value: pendingCount,   icon: Clock,        color: '#2563EB' },
          { label: 'Rejected',        value: rejectedCount,  icon: XCircle,      color: '#DC2626' },
          { label: 'Disbursed',       value: apps.filter(a => a.status === 'disbursed').length, icon: CheckCircle2, color: '#0891B2' },
          { label: 'Avg. Requested',  value: `$${avgRequested.toLocaleString()}`, icon: DollarSign, color: '#D97706' },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
            className="rounded-2xl p-4 flex items-center gap-3" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${m.color}12`, border: `1px solid ${m.color}20` }}>
              <m.icon size={15} style={{ color: m.color }} />
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: T.navy }}>{m.value}</div>
              <div className="text-xs" style={{ color: T.muted }}>{m.label}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
