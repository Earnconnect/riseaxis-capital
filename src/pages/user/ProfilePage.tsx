import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Shield, FileText, CheckCircle2, DollarSign, ChevronRight, Save, Loader2, AlertCircle, CheckCircle, Lock, KeyRound } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

function statusVariant(s: string): Parameters<typeof Badge>[0]['variant'] {
  const m: Record<string, string> = { pending: 'pending', under_review: 'review', approved: 'approved', rejected: 'rejected', disbursed: 'disbursed' }
  return (m[s] || 'default') as Parameters<typeof Badge>[0]['variant']
}

export default function ProfilePage() {
  const { profile, user } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone]       = useState(profile?.phone || '')
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [error, setError]             = useState('')
  const [pwResetSent, setPwResetSent] = useState(false)
  const [pwResetLoading, setPwResetLoading] = useState(false)

  const [apps, setApps] = useState<GrantApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name)
    if (profile?.phone)     setPhone(profile.phone)
  }, [profile])

  useEffect(() => {
    if (!user) return
    supabase
      .from('grant_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setApps(data as GrantApplication[])
        setLoadingApps(false)
      })
  }, [user])

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setError('')
    const { error: err } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() })
      .eq('id', user.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePasswordReset() {
    if (!user?.email) return
    setPwResetLoading(true)
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin + '/login' })
    setPwResetLoading(false)
    setPwResetSent(true)
  }

  const totalApps     = apps.length
  const approvedApps  = apps.filter(a => ['approved', 'disbursed'].includes(a.status)).length
  const fundsReceived = apps.filter(a => a.status === 'disbursed').reduce((s, a) => s + (a.approved_amount || 0), 0)
  const recentApps    = apps.slice(0, 3)

  const STATS = [
    { label: 'Applications', value: totalApps, icon: FileText, bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
    { label: 'Approved',     value: approvedApps, icon: CheckCircle2, bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    { label: 'Funds Received', value: formatCurrency(fundsReceived), icon: DollarSign, bg: '#F5F3FF', color: '#8B5CF6', border: '#DDD6FE' },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Account</div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: T.sub }}>Manage your personal information and view your activity</p>
      </motion.div>

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

        {/* Avatar banner */}
        <div className="px-6 py-6 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', borderBottom: `1px solid ${T.border}` }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-white truncate">{fullName || 'Your Name'}</div>
            <div className="text-sm mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile?.email}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'rgba(22,163,74,0.2)', color: '#4ADE80', border: '1px solid rgba(22,163,74,0.3)' }}>
                <Shield size={8} /> {profile?.role || 'user'}
              </span>
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Member since {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="px-6 py-5 space-y-4">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: T.muted }}>Personal Information</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full name */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Full Name</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Phone Number</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                  onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
                  onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Email Address <span style={{ color: T.muted }}>(read-only)</span></label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                <input
                  value={profile?.email || ''}
                  readOnly
                  className="w-full h-9 pl-9 pr-3 rounded-xl text-sm cursor-not-allowed"
                  style={{ background: '#F1F5F9', border: `1px solid ${T.border}`, color: T.muted }}
                />
              </div>
            </div>

            {/* Member since (read-only) */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>Member Since</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                <input
                  value={memberSince}
                  readOnly
                  className="w-full h-9 pl-9 pr-3 rounded-xl text-sm cursor-not-allowed"
                  style={{ background: '#F1F5F9', border: `1px solid ${T.border}`, color: T.muted }}
                />
              </div>
            </div>
          </div>

          {/* Error / success feedback */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: T.green }}>
                <CheckCircle size={13} /> Changes saved
              </span>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3">
        {STATS.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: T.heading }}>{s.value}</div>
              <div className="text-[10px] font-medium mt-0.5" style={{ color: T.muted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Recent applications */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div>
            <div className="font-semibold text-sm" style={{ color: T.heading }}>Recent Applications</div>
            <div className="text-xs mt-0.5" style={{ color: T.muted }}>Your last {Math.min(3, totalApps)} submitted grant applications</div>
          </div>
          {totalApps > 0 && (
            <Link to="/applications" className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: T.green }}>
              View all <ChevronRight size={12} />
            </Link>
          )}
        </div>

        {loadingApps ? (
          <div className="space-y-0">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse"
                style={{ borderBottom: i < 2 ? `1px solid ${T.border}` : 'none' }}>
                <div className="h-4 w-24 rounded bg-slate-100" />
                <div className="h-4 w-32 rounded bg-slate-100 flex-1" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        ) : recentApps.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: '#F1F5F9', border: `1px solid ${T.border}` }}>
              <FileText className="w-5 h-5" style={{ color: T.muted }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: T.sub }}>No applications yet</p>
            <Link to="/apply"
              className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-95"
              style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
              Apply for a Grant
            </Link>
          </div>
        ) : (
          recentApps.map((app, i) => (
            <Link key={app.id} to={`/applications/${app.id}`}
              className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50"
              style={{ borderBottom: i < recentApps.length - 1 ? `1px solid ${T.border}` : 'none' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: '#EFF6FF' }}>
                <FileText size={13} style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: '#F1F5F9', color: T.sub }}>{app.app_number}</span>
                  <span className="text-xs font-medium truncate" style={{ color: T.heading }}>{getGrantProgramLabel(app.grant_program)}</span>
                </div>
                <div className="text-xs mt-0.5" style={{ color: T.muted }}>{formatCurrency(app.requested_amount)} requested · {formatDateShort(app.created_at)}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={statusVariant(app.status)} className="text-[10px]">{getStatusLabel(app.status)}</Badge>
                <ChevronRight size={13} style={{ color: T.muted }} />
              </div>
            </Link>
          ))
        )}
      </motion.div>

      {/* Security Section */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${T.border}`, background: '#F8FAFC' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <Lock size={14} style={{ color: '#2563EB' }} />
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: T.heading }}>Security</div>
            <div className="text-xs" style={{ color: T.muted }}>Manage your account security settings</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
            <CheckCircle2 size={9} /> Verified
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Account Status',    value: 'Active & Verified', icon: CheckCircle2, color: T.green, bg: T.greenLt },
              { label: 'Encryption',        value: '256-bit SSL',       icon: Lock,         color: '#2563EB', bg: '#EFF6FF' },
              { label: 'Member Since',      value: memberSince,         icon: Calendar,     color: '#7C3AED', bg: '#F5F3FF' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.bg }}>
                  <item.icon size={13} style={{ color: item.color }} />
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: T.muted }}>{item.label}</div>
                  <div className="text-xs font-bold" style={{ color: T.heading }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl"
            style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FEF3C7' }}>
                <KeyRound size={13} style={{ color: '#D97706' }} />
              </div>
              <div>
                <div className="text-xs font-bold" style={{ color: T.heading }}>Password</div>
                <div className="text-[11px]" style={{ color: T.muted }}>Send a secure reset link to your email address</div>
              </div>
            </div>
            {pwResetSent ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0" style={{ color: T.green }}>
                <CheckCircle size={13} /> Reset email sent!
              </div>
            ) : (
              <button onClick={handlePasswordReset} disabled={pwResetLoading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:brightness-105 shrink-0 disabled:opacity-60"
                style={{ background: '#D97706' }}>
                {pwResetLoading ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                Change Password
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Official badges footer */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl px-5 py-4"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { label: 'Federally Recognized Nonprofit', sub: '501(c)(3) Status' },
            { label: 'IRS Tax-Exempt', sub: 'EIN: 88-3456789' },
            { label: '256-bit SSL', sub: 'Encrypted & Secure' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
              <Shield size={12} style={{ color: T.green }} />
              <div>
                <div className="text-[10px] font-bold" style={{ color: T.heading }}>{b.label}</div>
                <div className="text-[9px]" style={{ color: T.muted }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
