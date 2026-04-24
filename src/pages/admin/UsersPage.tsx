import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Shield, UserCheck, Calendar, ChevronRight, X, ExternalLink, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDateShort, formatCurrency } from '@/lib/utils'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'user' | 'admin'
  created_at: string
  app_count?: number
  total_received?: number
}

interface UserApp {
  id: string
  app_number: string
  grant_program: string
  status: string
  requested_amount: number
  approved_amount?: number
  created_at: string
}

const SC = (s: string) => ({ pending:'#D97706',under_review:'#2563EB',approved:'#16A34A',rejected:'#DC2626',disbursed:'#7C3AED' }[s]??'#94A3B8')
const SB = (s: string) => ({ pending:'#FFFBEB',under_review:'#EFF6FF',approved:'#F0FDF4',rejected:'#FEF2F2',disbursed:'#F5F3FF' }[s]??'#F8FAFC')
const SD = (s: string) => ({ pending:'#FDE68A',under_review:'#BFDBFE',approved:'#BBF7D0',rejected:'#FECACA',disbursed:'#DDD6FE' }[s]??'#E2E8F0')

function getInitials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

export default function UsersPage() {
  const [users, setUsers]     = useState<UserProfile[]>([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<UserProfile | null>(null)
  const [userApps, setUserApps] = useState<UserApp[]>([])
  const [loadingApps, setLoadingApps] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    if (!profiles) { setLoading(false); return }

    const { data: apps } = await supabase
      .from('grant_applications')
      .select('user_id, approved_amount, status')

    const appMap: Record<string, { count: number; received: number }> = {}
    apps?.forEach(a => {
      if (!appMap[a.user_id]) appMap[a.user_id] = { count: 0, received: 0 }
      appMap[a.user_id].count++
      if (a.status === 'disbursed' && a.approved_amount)
        appMap[a.user_id].received += a.approved_amount
    })

    setUsers(profiles.map(p => ({
      ...p,
      app_count: appMap[p.id]?.count ?? 0,
      total_received: appMap[p.id]?.received ?? 0,
    })))
    setLoading(false)
  }

  async function openUser(u: UserProfile) {
    setSelected(u)
    setLoadingApps(true)
    const { data } = await supabase
      .from('grant_applications')
      .select('id, app_number, grant_program, status, requested_amount, approved_amount, created_at')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
    setUserApps((data as UserApp[]) ?? [])
    setLoadingApps(false)
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const now = new Date()
  const thisMonth = users.filter(u => {
    const d = new Date(u.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const kpis = [
    { label: 'Total Users',          value: users.length,                                  color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', icon: Users },
    { label: 'Admins',               value: users.filter(u => u.role === 'admin').length,  color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', icon: Shield },
    { label: 'With Applications',    value: users.filter(u => (u.app_count ?? 0) > 0).length, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: UserCheck },
    { label: 'New This Month',       value: thisMonth,                                     color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: Calendar },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Administration</div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>Users</h1>
        <p className="text-sm mt-0.5" style={{ color: T.sub }}>All registered accounts on the platform</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 sm:p-5"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: k.bg, border: `1px solid ${k.border}` }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div className="text-2xl font-black" style={{ color: T.heading }}>{loading ? '—' : k.value}</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>{k.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full h-10 rounded-xl pl-9 pr-4 text-sm outline-none"
          style={{ background: T.card, border: `1px solid ${T.border}`, color: T.heading }}
        />
      </div>

      {/* Users list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: T.border }} />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded animate-pulse" style={{ background: T.border }} />
                  <div className="h-3 w-28 rounded animate-pulse" style={{ background: T.border }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={24} className="mx-auto mb-3" style={{ color: T.muted }} />
            <p className="text-sm font-semibold" style={{ color: T.heading }}>No users found</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {/* Desktop header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: T.muted, background: '#FAFAF9' }}>
              <div className="col-span-4">User</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Applications</div>
              <div className="col-span-2">Funds Received</div>
              <div className="col-span-2">Joined</div>
            </div>
            {filtered.map((u, i) => (
              <motion.button key={u.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                onClick={() => openUser(u)}
                className="w-full text-left px-4 sm:px-5 py-3.5 transition-colors hover:bg-slate-50 flex md:grid md:grid-cols-12 md:gap-4 items-center gap-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-3 md:col-span-4 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                    style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                    {getInitials(u.full_name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: T.heading }}>{u.full_name || 'Unknown'}</div>
                    <div className="text-xs truncate" style={{ color: T.muted }}>{u.email}</div>
                  </div>
                </div>
                {/* Role */}
                <div className="hidden md:flex md:col-span-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={u.role === 'admin'
                      ? { background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #DDD6FE' }
                      : { background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                    {u.role}
                  </span>
                </div>
                {/* App count */}
                <div className="hidden md:block md:col-span-2 text-sm font-semibold" style={{ color: T.heading }}>
                  {u.app_count ?? 0}
                </div>
                {/* Funds received */}
                <div className="hidden md:block md:col-span-2 text-sm font-semibold" style={{ color: (u.total_received ?? 0) > 0 ? T.green : T.muted }}>
                  {(u.total_received ?? 0) > 0 ? formatCurrency(u.total_received!) : '—'}
                </div>
                {/* Joined */}
                <div className="hidden md:block md:col-span-2 text-xs" style={{ color: T.muted }}>
                  {formatDateShort(u.created_at)}
                </div>
                <ChevronRight size={14} className="ml-auto shrink-0" style={{ color: T.muted }} />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* User Detail Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setSelected(null)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col overflow-y-auto"
              style={{ background: T.page, borderLeft: `1px solid ${T.border}`, boxShadow: '-8px 0 32px rgba(0,0,0,0.12)' }}>

              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 sticky top-0 z-10"
                style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                <div className="text-sm font-bold" style={{ color: T.heading }}>User Profile</div>
                <button onClick={() => setSelected(null)}
                  className="p-1.5 rounded-xl transition-colors hover:bg-slate-100"
                  style={{ color: T.muted }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Avatar + info */}
                <div className="rounded-2xl p-5 text-center" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-black text-white"
                    style={{ background: selected.role === 'admin' ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : 'linear-gradient(135deg,#16A34A,#15803D)' }}>
                    {getInitials(selected.full_name)}
                  </div>
                  <div className="text-base font-bold mb-0.5" style={{ color: T.heading }}>{selected.full_name || 'Unknown'}</div>
                  <div className="text-xs mb-3" style={{ color: T.muted }}>{selected.email}</div>
                  <span className="inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={selected.role === 'admin'
                      ? { background: '#F5F3FF', color: '#8B5CF6', border: '1px solid #DDD6FE' }
                      : { background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                    {selected.role === 'admin' ? '★ Admin' : 'Applicant'}
                  </span>
                </div>

                {/* Contact */}
                <div className="rounded-2xl p-4 space-y-2.5" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: T.muted }}>Contact</div>
                  <div className="flex items-center gap-2.5 text-sm" style={{ color: T.heading }}>
                    <Mail size={13} style={{ color: T.muted }} />
                    <span className="truncate">{selected.email}</span>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2.5 text-sm" style={{ color: T.heading }}>
                      <Phone size={13} style={{ color: T.muted }} />
                      <span>{selected.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-sm" style={{ color: T.muted }}>
                    <Calendar size={13} />
                    <span>Joined {formatDateShort(selected.created_at)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4 text-center" style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                    <div className="text-2xl font-black" style={{ color: T.green }}>{selected.app_count ?? 0}</div>
                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: T.green }}>Applications</div>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                    <div className="text-2xl font-black" style={{ color: '#7C3AED' }}>
                      {(selected.total_received ?? 0) > 0 ? formatCurrency(selected.total_received!) : '$0'}
                    </div>
                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#7C3AED' }}>Funds Received</div>
                  </div>
                </div>

                {/* Applications */}
                <div className="rounded-2xl overflow-hidden" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div className="text-xs font-bold" style={{ color: T.heading }}>Applications</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: T.greenLt, color: T.green }}>{userApps.length}</span>
                  </div>
                  {loadingApps ? (
                    <div className="p-4 space-y-2">
                      {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: T.border }} />)}
                    </div>
                  ) : userApps.length === 0 ? (
                    <div className="py-8 text-center text-xs" style={{ color: T.muted }}>No applications yet</div>
                  ) : (
                    <div className="divide-y" style={{ borderColor: T.border }}>
                      {userApps.map(a => (
                        <Link key={a.id} to={`/admin/applications/${a.id}`}
                          onClick={() => setSelected(null)}
                          className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: T.heading }}>
                              {a.grant_program.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </div>
                            <div className="text-[10px] font-mono mt-0.5" style={{ color: T.muted }}>#{a.app_number}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0"
                            style={{ background: SB(a.status), color: SC(a.status), border: `1px solid ${SD(a.status)}` }}>
                            {a.status.replace(/_/g, ' ')}
                          </span>
                          <ExternalLink size={11} style={{ color: T.muted }} />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
