import { useState, useEffect } from 'react'
import { Loader2, Save, Bell, Mail, CheckCircle2, User, Lock, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { NotificationSettings } from '@/types'

const S = {
  page: '#FAF8F5', white: '#FFFFFF', heading: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const inputCls = 'w-full h-10 rounded-xl px-3.5 text-sm outline-none transition-all'
const inputStyle = { background: S.page, border: `1px solid ${S.border}`, color: S.heading }
const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = S.green
  e.target.style.boxShadow   = `0 0 0 3px ${S.greenLt}`
  e.target.style.background  = '#fff'
}
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = S.border
  e.target.style.boxShadow   = 'none'
  e.target.style.background  = S.page
}

function SectionCard({ title, icon, subtitle, children, delay = 0 }: {
  title: string; icon: React.ReactNode; subtitle?: string; children: React.ReactNode; delay?: number
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="rounded-2xl p-6"
      style={{ background: S.white, border: `1px solid ${S.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom: `1px solid ${S.border}` }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: S.greenLt, border: `1px solid ${S.greenBd}` }}>
          <span style={{ color: S.green }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: S.heading }}>{title}</h2>
          {subtitle && <p className="text-xs mt-0.5" style={{ color: S.muted }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.div>
  )
}

function ToggleRow({ label, description, checked, onChange, last }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void; last?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3.5"
      style={{ borderBottom: last ? 'none' : `1px solid ${S.border}` }}>
      <div>
        <div className="text-sm font-medium" style={{ color: S.heading }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: S.muted }}>{description}</div>
      </div>
      <button onClick={() => onChange(!checked)}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ml-6"
        style={{ background: checked ? 'linear-gradient(135deg, #16A34A, #15803D)' : S.border }}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

export default function NotificationSettingsPage() {
  const { user, profile, refreshProfile } = useAuth()

  /* ── Profile state ──────────────────────────────────── */
  const [fullName,  setFullName]  = useState('')
  const [phone,     setPhone]     = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved,  setProfileSaved]  = useState(false)

  /* ── Password state ─────────────────────────────────── */
  const [newPw,      setNewPw]      = useState('')
  const [confirmPw,  setConfirmPw]  = useState('')
  const [showNew,    setShowNew]    = useState(false)
  const [showConf,   setShowConf]   = useState(false)
  const [pwSaving,   setPwSaving]   = useState(false)
  const [pwSaved,    setPwSaved]    = useState(false)
  const [pwError,    setPwError]    = useState('')

  /* ── Notification settings ──────────────────────────── */
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
    approval: true, rejection: true, disbursement: true,
    under_review: true, documents_requested: true, general: true,
    email_notifications: true,
  })
  const [notifLoading, setNotifLoading] = useState(true)
  const [notifSaving,  setNotifSaving]  = useState(false)
  const [notifSaved,   setNotifSaved]   = useState(false)

  useEffect(() => {
    if (user) {
      fetchSettings()
      setFullName(profile?.full_name || '')
      setPhone(profile?.phone || '')
    }
  }, [user, profile])

  async function fetchSettings() {
    const { data } = await supabase
      .from('notification_settings').select('*').eq('user_id', user!.id).single()
    if (data) setSettings(data as NotificationSettings)
    setNotifLoading(false)
  }

  async function saveProfile() {
    if (!user) return
    setProfileSaving(true)
    await supabase.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() }).eq('id', user.id)
    await refreshProfile()
    setProfileSaving(false)
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  async function changePassword() {
    setPwError('')
    if (!newPw || newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPw })
    setPwSaving(false)
    if (error) { setPwError(error.message); return }
    setPwSaved(true)
    setNewPw(''); setConfirmPw('')
    setTimeout(() => setPwSaved(false), 3000)
  }

  async function saveNotifications() {
    if (!user) return
    setNotifSaving(true)
    const { data: existing } = await supabase.from('notification_settings').select('id').eq('user_id', user.id).single()
    if (existing) {
      await supabase.from('notification_settings').update({ ...settings, updated_at: new Date().toISOString() }).eq('user_id', user.id)
    } else {
      await supabase.from('notification_settings').insert({ ...settings, user_id: user.id })
    }
    setNotifSaving(false)
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  const SaveBtn = ({ saving, saved, onClick, label = 'Save Changes' }: {
    saving: boolean; saved: boolean; onClick: () => void; label?: string
  }) => (
    <button onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
      style={saved
        ? { background: S.greenLt, border: `1px solid ${S.greenBd}`, color: S.green }
        : { background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff', boxShadow: '0 4px 14px rgba(22,163,74,0.2)' }
      }>
      {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
        : saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
        : <><Save className="w-4 h-4" /> {label}</>}
    </button>
  )

  if (notifLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
        <div className="max-w-2xl space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl p-6 animate-pulse"
              style={{ background: S.white, border: `1px solid ${S.border}` }}>
              <div className="h-4 w-32 rounded bg-slate-100 mb-4" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${S.border}` }}>
                  <div className="space-y-1">
                    <div className="h-4 w-40 rounded bg-slate-100" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                  <div className="h-6 w-11 rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-2xl space-y-5">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: S.green }}>
            Your Account
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: S.heading }}>Account Settings</h1>
          <p className="text-sm mt-0.5" style={{ color: S.muted }}>Manage your profile, security, and notification preferences</p>
        </motion.div>

        {/* ── Profile Card ─────────────────────────────────── */}
        <SectionCard title="Personal Information" icon={<User size={15} />}
          subtitle="Update your display name and contact number" delay={0.05}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: S.muted }}>Full Name</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                className={inputCls} style={inputStyle} placeholder="Your full name"
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: S.muted }}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel"
                className={inputCls} style={inputStyle} placeholder="(000) 000-0000"
                onFocus={focusIn} onBlur={focusOut} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: S.muted }}>Email Address</label>
              <input value={profile?.email || ''} disabled
                className={inputCls + ' cursor-not-allowed opacity-60'}
                style={{ ...inputStyle, background: '#F1F5F9' }} />
              <p className="text-xs" style={{ color: S.muted }}>Email cannot be changed. Contact support to update it.</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <SaveBtn saving={profileSaving} saved={profileSaved} onClick={saveProfile} label="Save Profile" />
          </div>
        </SectionCard>

        {/* ── Password Card ─────────────────────────────────── */}
        <SectionCard title="Password & Security" icon={<Lock size={15} />}
          subtitle="Change your password to keep your account secure" delay={0.1}>

          {pwSaved && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
              style={{ background: S.greenLt, border: `1px solid ${S.greenBd}` }}>
              <CheckCircle2 size={14} style={{ color: S.green }} />
              <span className="text-sm font-semibold" style={{ color: S.green }}>Password updated successfully!</span>
            </div>
          )}
          {pwError && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-700">{pwError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: S.muted }}>New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPw}
                  onChange={e => setNewPw(e.target.value)} placeholder="Minimum 8 characters"
                  className={inputCls + ' pr-10'} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.muted }}>
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {newPw.length > 0 && (
                <div className="flex gap-1.5 mt-1">
                  {['Length ≥ 8', 'Uppercase', 'Number', 'Symbol'].map((req, i) => {
                    const met = [newPw.length >= 8, /[A-Z]/.test(newPw), /\d/.test(newPw), /[^A-Za-z0-9]/.test(newPw)][i]
                    return (
                      <span key={req} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: met ? S.greenLt : '#F1F5F9', color: met ? S.green : S.muted, border: `1px solid ${met ? S.greenBd : S.border}` }}>
                        {req}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: S.muted }}>Confirm New Password</label>
              <div className="relative">
                <input type={showConf ? 'text' : 'password'} value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password"
                  className={inputCls + ' pr-10'} style={inputStyle} onFocus={focusIn} onBlur={focusOut} />
                <button type="button" onClick={() => setShowConf(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: S.muted }}>
                  {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={changePassword} disabled={pwSaving || !newPw || !confirmPw}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: '#1E293B', color: '#fff' }}>
              {pwSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Lock size={14} /> Update Password</>}
            </button>
          </div>

          {/* Security info */}
          <div className="mt-5 pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ borderTop: `1px solid ${S.border}` }}>
            {[
              { icon: Shield, label: '256-bit SSL',   sub: 'All data encrypted in transit' },
              { icon: Lock,   label: 'Secure Storage', sub: 'Passwords never stored in plain text' },
              { icon: CheckCircle2, label: 'IRS Compliant', sub: 'FISMA & SOC 2 Type II' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl"
                style={{ background: '#F8FAFC', border: `1px solid ${S.border}` }}>
                <item.icon size={13} style={{ color: S.green, marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div className="text-xs font-semibold" style={{ color: S.heading }}>{item.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: S.muted }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ── In-App Notifications ──────────────────────────── */}
        <SectionCard title="In-App Notifications" icon={<Bell size={15} />}
          subtitle="Choose which updates appear in your notification center" delay={0.15}>
          <ToggleRow label="Application Approved" description="Notify me when my application is approved"
            checked={!!settings.approval} onChange={() => setSettings(p => ({ ...p, approval: !p.approval }))} />
          <ToggleRow label="Application Rejected" description="Notify me when my application is rejected"
            checked={!!settings.rejection} onChange={() => setSettings(p => ({ ...p, rejection: !p.rejection }))} />
          <ToggleRow label="Funds Disbursed" description="Notify me when funds are sent to my account"
            checked={!!settings.disbursement} onChange={() => setSettings(p => ({ ...p, disbursement: !p.disbursement }))} />
          <ToggleRow label="Application Under Review" description="Notify me when my application enters review"
            checked={!!settings.under_review} onChange={() => setSettings(p => ({ ...p, under_review: !p.under_review }))} />
          <ToggleRow label="Documents Requested" description="Notify me when additional documents are needed"
            checked={!!settings.documents_requested} onChange={() => setSettings(p => ({ ...p, documents_requested: !p.documents_requested }))} />
          <ToggleRow label="General Messages" description="Receive general announcements and updates from our team"
            checked={!!settings.general} onChange={() => setSettings(p => ({ ...p, general: !p.general }))} last />
          <div className="flex justify-end mt-4">
            <SaveBtn saving={notifSaving} saved={notifSaved} onClick={saveNotifications} label="Save Preferences" />
          </div>
        </SectionCard>

        {/* ── Email Notifications ───────────────────────────── */}
        <SectionCard title="Email Notifications" icon={<Mail size={15} />}
          subtitle="Control whether we send email copies of notifications" delay={0.2}>
          <ToggleRow
            label="Email Notifications"
            description="Receive email copies of important updates at your registered address"
            checked={!!settings.email_notifications}
            onChange={() => setSettings(p => ({ ...p, email_notifications: !p.email_notifications }))}
            last />
          <div className="flex justify-end mt-4">
            <SaveBtn saving={notifSaving} saved={notifSaved} onClick={saveNotifications} label="Save Preferences" />
          </div>
        </SectionCard>

        {/* ── Danger Zone ───────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl p-6"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-100">
              <AlertTriangle size={15} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-red-800">Danger Zone</h2>
              <p className="text-xs text-red-500 mt-0.5">Irreversible and destructive actions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-800">Delete Account</div>
              <p className="text-xs text-red-500 mt-0.5">
                Permanently delete your account and all application data. This cannot be undone.
              </p>
            </div>
            <a href="mailto:grants@riseaxiscapital.com?subject=Account%20Deletion%20Request"
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 transition-all hover:bg-red-200"
              style={{ background: '#FEE2E2', border: '1px solid #FECACA', whiteSpace: 'nowrap' }}>
              Request Deletion
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
