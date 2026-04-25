import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  User, Mail, Phone, Calendar, Shield, FileText, CheckCircle2,
  DollarSign, ChevronRight, Save, Loader2, AlertCircle, CheckCircle,
  Lock, KeyRound, MapPin, Heart, Briefcase, UserCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  navy: '#1E3A5F',
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY','DC',
]

function statusVariant(s: string): Parameters<typeof Badge>[0]['variant'] {
  const m: Record<string, string> = { pending: 'pending', under_review: 'review', approved: 'approved', rejected: 'rejected', disbursed: 'disbursed' }
  return (m[s] || 'default') as Parameters<typeof Badge>[0]['variant']
}

function Field({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: T.sub }}>
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: T.muted }} />}
        {children}
      </div>
    </div>
  )
}

const inputCls = (hasIcon = true) =>
  `w-full h-9 ${hasIcon ? 'pl-9' : 'pl-3'} pr-3 rounded-xl text-sm outline-none transition-all`
const inputStyle = { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }
const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = T.green
    e.currentTarget.style.background = '#fff'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = T.border
    e.currentTarget.style.background = '#F8FAFC'
  },
}

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()

  // Personal
  const [fullName,   setFullName]   = useState('')
  const [phone,      setPhone]      = useState('')
  const [dob,        setDob]        = useState('')
  const [marital,    setMarital]    = useState('')
  // Identity
  const [ssnLast4,   setSsnLast4]   = useState('')
  const [citizenship, setCitizenship] = useState('')
  const [employment, setEmployment] = useState('')
  const [income,     setIncome]     = useState('')
  // Address
  const [addr1,      setAddr1]      = useState('')
  const [addr2,      setAddr2]      = useState('')
  const [city,       setCity]       = useState('')
  const [state,      setState]      = useState('')
  const [zip,        setZip]        = useState('')
  const [yearsAddr,  setYearsAddr]  = useState('')
  const [housing,    setHousing]    = useState('')
  // Emergency contact
  const [ecName,     setEcName]     = useState('')
  const [ecPhone,    setEcPhone]    = useState('')

  const [saving,         setSaving]         = useState(false)
  const [saved,          setSaved]          = useState(false)
  const [error,          setError]          = useState('')
  const [pwResetSent,    setPwResetSent]    = useState(false)
  const [pwResetLoading, setPwResetLoading] = useState(false)

  const [apps,        setApps]        = useState<GrantApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(true)

  const initials    = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'

  useEffect(() => {
    if (!profile) return
    setFullName(profile.full_name || '')
    setPhone(profile.phone || '')
    setDob(profile.date_of_birth || '')
    setMarital(profile.marital_status || '')
    setSsnLast4(profile.ssn_last4 || '')
    setCitizenship(profile.citizenship || '')
    setEmployment(profile.employment_status || '')
    setIncome(profile.annual_income ? String(profile.annual_income) : '')
    setAddr1(profile.address_line1 || '')
    setAddr2(profile.address_line2 || '')
    setCity(profile.city || '')
    setState(profile.state || '')
    setZip(profile.zip_code || '')
    setYearsAddr(profile.years_at_address || '')
    setHousing(profile.housing_status || '')
    setEcName(profile.emergency_contact_name || '')
    setEcPhone(profile.emergency_contact_phone || '')
  }, [profile])

  useEffect(() => {
    if (!user) return
    supabase
      .from('grant_applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setApps(data as GrantApplication[]); setLoadingApps(false) })
  }, [user])

  // Completeness
  const COMPLETENESS_FIELDS = [
    { label: 'Full Name',     done: !!fullName.trim() },
    { label: 'Phone',         done: !!phone.trim() },
    { label: 'Date of Birth', done: !!dob },
    { label: 'SSN Last 4',    done: !!ssnLast4.trim() },
    { label: 'Home Address',  done: !!addr1.trim() },
    { label: 'City & State',  done: !!(city.trim() && state) },
    { label: 'ZIP Code',      done: !!zip.trim() },
    { label: 'Emergency Contact', done: !!ecName.trim() },
  ]
  const completePct = Math.round((COMPLETENESS_FIELDS.filter(f => f.done).length / COMPLETENESS_FIELDS.length) * 100)

  async function handleSave() {
    if (!user) return
    setSaving(true); setError('')
    const { error: err } = await supabase.from('profiles').update({
      full_name:              fullName.trim(),
      phone:                  phone.trim(),
      date_of_birth:          dob || null,
      marital_status:         marital || null,
      ssn_last4:              ssnLast4.trim() || null,
      citizenship:            citizenship || null,
      employment_status:      employment || null,
      annual_income:          income ? Number(income) : null,
      address_line1:          addr1.trim() || null,
      address_line2:          addr2.trim() || null,
      city:                   city.trim() || null,
      state:                  state || null,
      zip_code:               zip.trim() || null,
      years_at_address:       yearsAddr || null,
      housing_status:         housing || null,
      emergency_contact_name:  ecName.trim() || null,
      emergency_contact_phone: ecPhone.trim() || null,
    }).eq('id', user.id)
    setSaving(false)
    if (err) { setError(err.message); return }
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  async function handlePasswordReset() {
    if (!user?.email) return
    setPwResetLoading(true)
    await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin + '/login' })
    setPwResetLoading(false); setPwResetSent(true)
  }

  const totalApps    = apps.length
  const approvedApps = apps.filter(a => ['approved', 'disbursed'].includes(a.status)).length
  const fundsReceived = apps.filter(a => a.status === 'disbursed').reduce((s, a) => s + (a.approved_amount || 0), 0)
  const recentApps   = apps.slice(0, 3)

  const pctColor = completePct === 100 ? T.green : completePct >= 60 ? '#D97706' : '#DC2626'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: T.green }}>Account</div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: T.heading }}>My Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: T.sub }}>Complete your profile to speed up grant application reviews</p>
      </motion.div>

      {/* Completeness card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}
        className="rounded-2xl p-5"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-bold" style={{ color: T.heading }}>Profile Completeness</div>
            <div className="text-xs" style={{ color: T.sub }}>A complete profile reduces review time by up to 40%</div>
          </div>
          <div className="text-2xl font-black" style={{ color: pctColor }}>{completePct}%</div>
        </div>
        <div className="h-2 rounded-full mb-4" style={{ background: T.border }}>
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${completePct}%`, background: pctColor }} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {COMPLETENESS_FIELDS.map(f => (
            <div key={f.label} className="flex items-center gap-1.5">
              {f.done
                ? <CheckCircle2 size={12} style={{ color: T.green, shrink: 0 }} />
                : <div className="w-3 h-3 rounded-full border-2 shrink-0" style={{ borderColor: T.muted }} />
              }
              <span className="text-[11px] font-medium truncate" style={{ color: f.done ? T.heading : T.muted }}>
                {f.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Avatar banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div className="px-6 py-5 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
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

        {/* ── Section 1: Personal Information ── */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <User size={14} style={{ color: T.green }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Personal Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Legal Name" icon={User}>
              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="First Middle Last" className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Phone Number" icon={Phone}>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="(555) 000-0000" className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Date of Birth" icon={Calendar}>
              <input type="date" value={dob} onChange={e => setDob(e.target.value)}
                className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Marital Status">
              <select value={marital} onChange={e => setMarital(e.target.value)}
                className={`${inputCls(false)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select…</option>
                {['Single','Married','Divorced','Widowed','Separated','Domestic Partnership'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Email Address (read-only)" icon={Mail}>
              <input value={profile?.email || ''} readOnly className={inputCls()}
                style={{ ...inputStyle, background: '#F1F5F9', cursor: 'not-allowed', color: T.muted }} />
            </Field>
            <Field label="Member Since" icon={Calendar}>
              <input value={memberSince} readOnly className={inputCls()}
                style={{ ...inputStyle, background: '#F1F5F9', cursor: 'not-allowed', color: T.muted }} />
            </Field>
          </div>
        </div>

        {/* ── Section 2: Identity & Employment ── */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={14} style={{ color: T.green }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Identity & Employment</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="SSN — Last 4 Digits" icon={Shield}>
              <input value={ssnLast4} onChange={e => setSsnLast4(e.target.value.replace(/\D/g,'').slice(0,4))}
                placeholder="XXXX" maxLength={4} className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Citizenship Status">
              <select value={citizenship} onChange={e => setCitizenship(e.target.value)}
                className={`${inputCls(false)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select…</option>
                {['U.S. Citizen','Lawful Permanent Resident','Other'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Employment Status" icon={Briefcase}>
              <select value={employment} onChange={e => setEmployment(e.target.value)}
                className={`${inputCls(true)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select…</option>
                {['Employed Full-Time','Employed Part-Time','Self-Employed','Unemployed','Retired','Student','Disabled'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Annual Household Income ($)" icon={DollarSign}>
              <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                placeholder="e.g. 42000" min="0" className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
          </div>
        </div>

        {/* ── Section 3: Home Address ── */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={14} style={{ color: T.green }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Home Address</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Street Address" icon={MapPin}>
                <input value={addr1} onChange={e => setAddr1(e.target.value)}
                  placeholder="123 Main Street" className={inputCls()} style={inputStyle} {...focusHandlers} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Apt / Suite / Unit (optional)">
                <input value={addr2} onChange={e => setAddr2(e.target.value)}
                  placeholder="Apt 4B" className={inputCls(false)} style={inputStyle} {...focusHandlers} />
              </Field>
            </div>
            <Field label="City">
              <input value={city} onChange={e => setCity(e.target.value)}
                placeholder="City" className={inputCls(false)} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="State">
              <select value={state} onChange={e => setState(e.target.value)}
                className={`${inputCls(false)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select state…</option>
                {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="ZIP Code">
              <input value={zip} onChange={e => setZip(e.target.value.replace(/\D/g,'').slice(0,5))}
                placeholder="00000" maxLength={5} className={inputCls(false)} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Years at This Address">
              <select value={yearsAddr} onChange={e => setYearsAddr(e.target.value)}
                className={`${inputCls(false)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select…</option>
                {['Less than 1 year','1–2 years','3–5 years','6–10 years','More than 10 years'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="Housing Status">
              <select value={housing} onChange={e => setHousing(e.target.value)}
                className={`${inputCls(false)} appearance-none`} style={inputStyle} {...focusHandlers}>
                <option value="">Select…</option>
                {['Own','Rent','Staying with Family/Friends','Temporary Housing','Other'].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* ── Section 4: Emergency Contact ── */}
        <div className="px-6 pt-5 pb-5">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={14} style={{ color: T.green }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: T.muted }}>Emergency Contact</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name" icon={User}>
              <input value={ecName} onChange={e => setEcName(e.target.value)}
                placeholder="Full name" className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
            <Field label="Contact Phone" icon={Phone}>
              <input value={ecPhone} onChange={e => setEcPhone(e.target.value)}
                placeholder="(555) 000-0000" className={inputCls()} style={inputStyle} {...focusHandlers} />
            </Field>
          </div>
        </div>

        {/* Error / save controls */}
        <div className="px-6 pb-6 space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: T.green }}>
                <CheckCircle size={13} /> Profile saved
              </span>
            )}
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 14px rgba(22,163,74,0.25)' }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving…' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats strip */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-3">
        {[
          { label: 'Applications', value: totalApps, icon: FileText, bg: '#EFF6FF', color: '#3B82F6', border: '#BFDBFE' },
          { label: 'Approved',     value: approvedApps, icon: CheckCircle2, bg: '#F0FDF4', color: T.green, border: T.greenBd },
          { label: 'Funds Received', value: formatCurrency(fundsReceived), icon: DollarSign, bg: '#F5F3FF', color: '#8B5CF6', border: '#DDD6FE' },
        ].map((s, i) => (
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
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
                <FileText size={13} style={{ color: '#3B82F6' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: T.sub }}>
                    {app.app_number}
                  </span>
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

      {/* Security */}
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
              { label: 'Account Status', value: 'Active & Verified', icon: CheckCircle2, color: T.green,    bg: T.greenLt },
              { label: 'Encryption',     value: '256-bit SSL',       icon: Lock,         color: '#2563EB',  bg: '#EFF6FF' },
              { label: 'Member Since',   value: memberSince,          icon: Calendar,     color: '#7C3AED',  bg: '#F5F3FF' },
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

    </div>
  )
}
