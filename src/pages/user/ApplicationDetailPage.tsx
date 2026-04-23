import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft, FileText, MessageSquare, CheckSquare, Banknote,
  CreditCard, Upload, Download, Trash2, Send, CheckCircle2,
  Clock, XCircle, AlertTriangle, Shield, Loader2, Save,
  Plus, Lock, GraduationCap, HeartPulse, Briefcase,
  Building2, Users, DollarSign, Star, RefreshCw,
  File, Image, FileCheck, Eye, EyeOff, Edit3,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatCurrency, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication, Milestone } from '@/types'

/* ── Types ───────────────────────────────────────── */
interface AppMessage {
  id: string
  application_id: string
  user_id: string
  sender_type: 'user' | 'support' | 'system'
  sender_name: string
  content: string
  created_at: string
}
interface AppDocument {
  id: string
  application_id: string
  user_id: string
  name: string
  doc_type: string
  file_path: string
  file_size: number
  status: 'uploaded' | 'verified' | 'rejected'
  uploaded_at: string
}

type Tab = 'overview' | 'documents' | 'messages' | 'milestones' | 'disbursement' | 'bank'

/* ── Theme ───────────────────────────────────────── */
const T = {
  bg: '#FAF8F5', white: '#FFFFFF', head: '#0F172A', body: '#475569',
  muted: '#94A3B8', border: '#EDE9E3', green: '#16A34A',
  greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  card: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
  lift: '0 8px 32px rgba(0,0,0,0.1)',
}
const SC = (s: string) => ({ pending:'#D97706',under_review:'#2563EB',approved:'#16A34A',rejected:'#DC2626',disbursed:'#7C3AED' }[s]??'#94A3B8')
const SB = (s: string) => ({ pending:'#FFFBEB',under_review:'#EFF6FF',approved:'#F0FDF4',rejected:'#FEF2F2',disbursed:'#F5F3FF' }[s]??'#F8FAFC')
const SD = (s: string) => ({ pending:'#FDE68A',under_review:'#BFDBFE',approved:'#BBF7D0',rejected:'#FECACA',disbursed:'#DDD6FE' }[s]??'#E2E8F0')

const PROG_ICONS: Record<string, React.FC<{ size?: number; style?: React.CSSProperties }>> = {
  emergency_assistance: Shield, education_support: GraduationCap,
  medical_expenses: HeartPulse, community_development: Users,
  business_funding: Briefcase, other: Building2,
}

const PIPELINE = [
  { label: 'Submitted',  statuses: ['pending','under_review','approved','rejected','disbursed'] },
  { label: 'In Review',  statuses: ['under_review','approved','rejected','disbursed'] },
  { label: 'Decision',   statuses: ['approved','rejected','disbursed'] },
  { label: 'Funded',     statuses: ['disbursed'] },
]

const DISB_STAGES = [
  { key: 'initiated',    label: 'Initiated',    desc: 'Transfer initiated',    field: 'disbursement_initiated_at' },
  { key: 'processing',   label: 'Processing',   desc: 'Bank processing funds', field: 'disbursement_processing_at' },
  { key: 'sent_to_bank', label: 'Sent to Bank', desc: 'Wire sent to your bank',field: 'disbursement_sent_at' },
  { key: 'deposited',    label: 'Deposited',    desc: 'Funds in your account', field: 'disbursement_deposited_at' },
]

const DOC_TYPES = [
  'Government-issued Photo ID',
  'Proof of Current Address',
  'Proof of Need / Emergency',
  'Income Verification',
  'Bank Statement (3 months)',
  'Medical Records / Bills',
  'Business Plan / Documents',
  'Other Supporting Document',
]

function Pill({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap"
      style={{ background: SB(status), color: SC(status), border: `1px solid ${SD(status)}` }}>
      {getStatusLabel(status)}
    </span>
  )
}

function Sk({ w = 'w-20', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`${h} ${w} rounded-lg animate-pulse`} style={{ background: '#EDE9E3' }} />
}

/* ── Main Page ───────────────────────────────────── */
export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [app, setApp]               = useState<GrantApplication | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [docs, setDocs]             = useState<AppDocument[]>([])
  const [messages, setMessages]     = useState<AppMessage[]>([])
  const [loading, setLoading]       = useState(true)
  const [tab, setTab]               = useState<Tab>('overview')

  useEffect(() => { if (id && user) load() }, [id, user])

  async function load() {
    setLoading(true)
    const [appRes, msRes, docsRes, msgRes] = await Promise.all([
      supabase.from('grant_applications').select('*').eq('id', id!).eq('user_id', user!.id).single(),
      supabase.from('milestones').select('*').eq('application_id', id!).order('created_at'),
      supabase.from('app_documents').select('*').eq('application_id', id!).order('uploaded_at', { ascending: false }),
      supabase.from('messages').select('*').eq('application_id', id!).order('created_at'),
    ])
    if (appRes.data) setApp(appRes.data as GrantApplication)
    else { navigate('/applications'); return }
    if (msRes.data) setMilestones(msRes.data as Milestone[])
    if (docsRes.data) setDocs(docsRes.data as AppDocument[])
    if (msgRes.data) setMilestones(prev => { setMessages(msgRes.data as AppMessage[]); return prev })
    setLoading(false)
  }

  if (loading) return <LoadingState />
  if (!app) return null

  const ProgIcon = PROG_ICONS[app.grant_program] ?? Building2

  const TABS: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview',     label: 'Overview',     icon: <FileText size={14} /> },
    { key: 'documents',    label: 'Documents',    icon: <Upload size={14} />,      badge: docs.length },
    { key: 'messages',     label: 'Messages',     icon: <MessageSquare size={14} />, badge: messages.filter(m => m.sender_type !== 'user').length || undefined },
    { key: 'milestones',   label: 'Milestones',   icon: <Star size={14} />,        badge: milestones.length },
    { key: 'disbursement', label: 'Disbursement', icon: <Banknote size={14} /> },
    { key: 'bank',         label: 'Bank Account', icon: <CreditCard size={14} /> },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-5">

      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/applications" className="inline-flex items-center gap-1.5 text-sm font-semibold mb-4 transition-colors hover:opacity-70" style={{ color: T.muted }}>
          <ChevronLeft size={15} /> Back to My Applications
        </Link>

        <div className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${SC(app.status)}F0, ${SC(app.status)}BB)`,
            boxShadow: `0 8px 32px ${SC(app.status)}35`,
          }}>
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <ProgIcon size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-white/60 text-xs font-semibold mb-0.5 truncate">{getGrantProgramLabel(app.grant_program)}</p>
                <p className="text-2xl sm:text-3xl font-black text-white leading-none mb-1">{formatCurrency(app.requested_amount)}</p>
                <p className="font-mono text-white/40 text-xs">#{app.app_number}</p>
                {app.approved_amount && app.approved_amount !== app.requested_amount && (
                  <p className="text-white/80 text-sm font-semibold mt-1">Approved: {formatCurrency(app.approved_amount)}</p>
                )}
              </div>
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
              <Pill status={app.status} />
              <p className="text-white/50 text-xs">Submitted {formatDateShort(app.created_at)}</p>
              {app.reviewed_at && (
                <p className="text-white/50 text-xs hidden sm:block">Reviewed {formatDateShort(app.reviewed_at)}</p>
              )}
            </div>
          </div>

          {/* Mini pipeline */}
          {app.status !== 'rejected' && (
            <div className="relative mt-5 flex items-start">
              {PIPELINE.map((step, i) => {
                const done = step.statuses.includes(app.status)
                return (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold"
                        style={{ background: done ? '#fff' : 'rgba(255,255,255,0.2)', color: done ? SC(app.status) : 'rgba(255,255,255,0.4)' }}>
                        {done ? <CheckCircle2 size={11} /> : i + 1}
                      </div>
                      <span className="text-[9px] font-semibold mt-1 whitespace-nowrap"
                        style={{ color: done ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)' }}>{step.label}</span>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className="h-px flex-1 mx-1.5 mb-4 rounded"
                        style={{ background: PIPELINE[i+1].statuses.includes(app.status) ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
        <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all relative shrink-0"
              style={{
                background: tab === t.key ? T.head : T.white,
                color: tab === t.key ? '#fff' : T.muted,
                boxShadow: tab === t.key ? 'none' : T.card,
              }}>
              {t.icon}
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                  style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : T.greenLt, color: tab === t.key ? '#fff' : T.green }}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>

          {tab === 'overview'     && <OverviewTab app={app} />}
          {tab === 'documents'    && <DocumentsTab app={app} docs={docs} setDocs={setDocs} user={user} profile={profile} />}
          {tab === 'messages'     && <MessagesTab app={app} messages={messages} setMessages={setMessages} user={user} profile={profile} />}
          {tab === 'milestones'   && <MilestonesTab milestones={milestones} />}
          {tab === 'disbursement' && <DisbursementTab app={app} />}
          {tab === 'bank'         && <BankTab app={app} setApp={setApp} />}

        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ── Overview Tab ───────────────────────────────── */
function OverviewTab({ app }: { app: GrantApplication }) {
  return (
    <div className="space-y-5">
      {/* Rejection notice */}
      {app.status === 'rejected' && (
        <div className="rounded-2xl p-5" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={16} style={{ color: '#DC2626' }} />
            <h3 className="text-sm font-bold" style={{ color: '#DC2626' }}>Application Not Approved</h3>
          </div>
          {app.rejection_reason && (
            <p className="text-sm leading-relaxed mb-3" style={{ color: '#7F1D1D' }}>{app.rejection_reason}</p>
          )}
          <Link to="/apply" className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg"
            style={{ background: '#DC2626', color: '#fff' }}>
            <RefreshCw size={12} /> Submit New Application
          </Link>
        </div>
      )}

      {/* Reviewer notes */}
      {app.reviewer_notes && (
        <div className="rounded-2xl p-5" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} style={{ color: '#D97706' }} />
            <h3 className="text-sm font-bold" style={{ color: '#92400E' }}>Notes from Reviewer</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#92400E' }}>{app.reviewer_notes}</p>
        </div>
      )}

      {/* Details grid */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>Application Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'App Number',        value: `#${app.app_number}` },
            { label: 'Grant Program',     value: getGrantProgramLabel(app.grant_program) },
            { label: 'Amount Requested',  value: formatCurrency(app.requested_amount) },
            ...(app.approved_amount ? [{ label: 'Amount Approved', value: formatCurrency(app.approved_amount) }] : []),
            { label: 'Status',            value: getStatusLabel(app.status) },
            { label: 'Submitted',         value: formatDateShort(app.created_at) },
            ...(app.reviewed_at ? [{ label: 'Reviewed', value: formatDateShort(app.reviewed_at) }] : []),
            ...(app.employment_status ? [{ label: 'Employment', value: app.employment_status }] : []),
            ...(app.city && app.state ? [{ label: 'Location', value: `${app.city}, ${app.state}` }] : []),
            ...(app.household_size ? [{ label: 'Household Size', value: String(app.household_size) }] : []),
            ...(app.annual_income ? [{ label: 'Annual Income', value: formatCurrency(app.annual_income) }] : []),
            ...(app.credit_score_range ? [{ label: 'Credit Range', value: app.credit_score_range }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: T.muted }}>{label}</p>
              <p className="text-xs font-semibold" style={{ color: T.head }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Purpose */}
      {app.purpose && (
        <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: T.head }}>Grant Purpose</h2>
          <p className="text-sm leading-relaxed" style={{ color: T.body }}>{app.purpose}</p>
          {app.budget_breakdown && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="text-xs font-bold mb-2" style={{ color: T.muted }}>BUDGET BREAKDOWN</p>
              <p className="text-sm leading-relaxed" style={{ color: T.body }}>{app.budget_breakdown}</p>
            </div>
          )}
          {app.expected_outcomes && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="text-xs font-bold mb-2" style={{ color: T.muted }}>EXPECTED OUTCOMES</p>
              <p className="text-sm leading-relaxed" style={{ color: T.body }}>{app.expected_outcomes}</p>
            </div>
          )}
        </div>
      )}

      {/* Personal info (masked) */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Full Name',    value: app.full_name },
            { label: 'Email',        value: app.email },
            { label: 'Phone',        value: app.phone },
            ...(app.citizenship ? [{ label: 'Citizenship', value: app.citizenship }] : []),
            ...(app.id_type ? [{ label: 'ID Type', value: app.id_type }] : []),
            ...(app.address_line1 ? [{ label: 'Address', value: [app.address_line1, app.city, app.state].filter(Boolean).join(', ') }] : []),
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: T.muted }}>{label}</p>
              <p className="text-xs font-semibold" style={{ color: T.head }}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Documents Tab ──────────────────────────────── */
function DocumentsTab({ app, docs, setDocs, user, profile }: {
  app: GrantApplication
  docs: AppDocument[]
  setDocs: React.Dispatch<React.SetStateAction<AppDocument[]>>
  user: { id: string } | null
  profile: { full_name: string; email: string; phone?: string } | null
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]     = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [selectedType, setSelectedType] = useState(DOC_TYPES[0])
  const [uploadErr, setUploadErr]   = useState('')
  const [deleting, setDeleting]     = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length || !user) return
    const file = files[0]
    if (file.size > 10 * 1024 * 1024) { setUploadErr('File must be under 10MB'); return }
    const allowed = ['application/pdf','image/jpeg','image/png','image/webp','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) { setUploadErr('Accepted: PDF, JPG, PNG, DOCX only'); return }
    setUploadErr(''); setUploading(true)

    const path = `${user.id}/${app.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { data: uploadData, error: uploadErr2 } = await supabase.storage
      .from('grant-documents').upload(path, file, { contentType: file.type })

    if (uploadErr2) {
      setUploadErr('Upload failed — please try again or contact support.')
      setUploading(false); return
    }

    const { data: docData, error: dbErr } = await supabase.from('app_documents').insert({
      application_id: app.id,
      user_id: user.id,
      name: file.name,
      doc_type: selectedType,
      file_path: uploadData?.path || path,
      file_size: file.size,
      status: 'uploaded',
    }).select().single()

    if (!dbErr && docData) {
      setDocs(prev => [docData as AppDocument, ...prev])
    } else {
      setUploadErr('File uploaded but record failed. Contact support.')
    }
    setUploading(false)
  }

  async function deleteDoc(doc: AppDocument) {
    setDeleting(doc.id)
    await supabase.storage.from('grant-documents').remove([doc.file_path])
    await supabase.from('app_documents').delete().eq('id', doc.id)
    setDocs(prev => prev.filter(d => d.id !== doc.id))
    setDeleting(null)
  }

  async function downloadDoc(doc: AppDocument) {
    const { data } = await supabase.storage.from('grant-documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  function fmtSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  function fileIcon(name: string) {
    if (/\.(jpg|jpeg|png|webp|gif)$/i.test(name)) return <Image size={16} style={{ color: '#7C3AED' }} />
    if (/\.pdf$/i.test(name)) return <FileCheck size={16} style={{ color: '#DC2626' }} />
    return <File size={16} style={{ color: '#2563EB' }} />
  }

  const statusColor = { uploaded: '#D97706', verified: '#16A34A', rejected: '#DC2626' }
  const statusBg    = { uploaded: '#FFFBEB', verified: '#F0FDF4', rejected: '#FEF2F2' }

  return (
    <div className="space-y-5">
      {/* Upload area */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>Upload Documents</h2>

        {/* Doc type selector */}
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Document Type</label>
          <select value={selectedType} onChange={e => setSelectedType(e.target.value)}
            className="w-full h-10 rounded-xl px-3.5 text-sm bg-[#F8FAFC] border border-[#EDE9E3] outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#F0FDF4] transition-all"
            style={{ color: T.head }}>
            {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center p-10 rounded-2xl cursor-pointer transition-all"
          style={{
            background: dragging ? T.greenLt : '#F8FAFC',
            border: `2px dashed ${dragging ? T.green : T.border}`,
          }}>
          <input ref={fileRef} type="file" className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
            onChange={e => handleFiles(e.target.files)} />
          {uploading ? (
            <><Loader2 size={28} className="animate-spin mb-2" style={{ color: T.green }} />
              <p className="text-sm font-semibold" style={{ color: T.green }}>Uploading…</p></>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: dragging ? T.greenBd : T.border }}>
                <Upload size={20} style={{ color: dragging ? T.green : T.muted }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: T.head }}>
                {dragging ? 'Drop to upload' : 'Click or drag & drop to upload'}
              </p>
              <p className="text-xs" style={{ color: T.muted }}>PDF, JPG, PNG, DOCX — max 10MB</p>
            </>
          )}
        </div>
        {uploadErr && <p className="text-xs text-red-500 mt-2">{uploadErr}</p>}
      </div>

      {/* Required docs checklist */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: T.head }}>Required Documents</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
            {docs.length} uploaded
          </span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Government-issued Photo ID', required: true },
            { name: 'Proof of Current Address', required: true },
            { name: 'Proof of Need / Supporting Evidence', required: true },
            { name: 'Income Verification (pay stub, tax return)', required: false },
            { name: 'Bank Statement (last 3 months)', required: false },
          ].map(req => {
            const uploaded = docs.some(d => d.doc_type.includes(req.name.split(' ')[0]))
            return (
              <div key={req.name} className="flex items-center gap-2.5 py-2.5"
                style={{ borderBottom: `1px solid ${T.border}` }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: uploaded ? T.green : T.border }}>
                  {uploaded && <CheckCircle2 size={11} className="text-white" />}
                </div>
                <span className="text-xs flex-1" style={{ color: uploaded ? T.head : T.muted }}>{req.name}</span>
                {req.required && !uploaded && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#FEE2E2', color: '#DC2626' }}>Required</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Uploaded files */}
      {docs.length > 0 && (
        <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>Uploaded Files</h2>
          <div className="space-y-2">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: T.white, border: `1px solid ${T.border}` }}>
                  {fileIcon(doc.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: T.head }}>{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: T.muted }}>{doc.doc_type}</span>
                    <span>·</span>
                    <span className="text-[10px]" style={{ color: T.muted }}>{fmtSize(doc.file_size)}</span>
                    <span>·</span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ background: statusBg[doc.status] || '#F8FAFC', color: statusColor[doc.status] || T.muted }}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => downloadDoc(doc)}
                    className="p-1.5 rounded-lg transition-all" title="Download"
                    style={{ color: T.muted }} onMouseEnter={e => e.currentTarget.style.background = T.border}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Download size={13} />
                  </button>
                  <button onClick={() => deleteDoc(doc)} disabled={deleting === doc.id}
                    className="p-1.5 rounded-lg transition-all" title="Delete"
                    style={{ color: '#DC2626' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {deleting === doc.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Messages Tab ───────────────────────────────── */
function MessagesTab({ app, messages, setMessages, user, profile }: {
  app: GrantApplication
  messages: AppMessage[]
  setMessages: React.Dispatch<React.SetStateAction<AppMessage[]>>
  user: { id: string } | null
  profile: { full_name: string; email: string; phone?: string } | null
}) {
  const [text, setText]       = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!text.trim() || !user) return
    setSending(true)
    const msg: Omit<AppMessage, 'id'> = {
      application_id: app.id,
      user_id: user.id,
      sender_type: 'user',
      sender_name: profile?.full_name || 'Applicant',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }
    const { data, error } = await supabase.from('messages').insert(msg).select().single()
    if (!error && data) {
      setMessages(prev => [...prev, data as AppMessage])
      setText('')
      // Also insert a notification so admin gets alerted
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'general',
        title: `Message re: Application #${app.app_number}`,
        message: text.trim(),
        application_id: app.id,
      })
    }
    setSending(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: T.white, boxShadow: T.card, height: 'calc(100svh - 18rem)', minHeight: '400px', maxHeight: '700px' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.greenLt }}>
          <MessageSquare size={15} style={{ color: T.green }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: T.head }}>Support Thread</p>
          <p className="text-xs" style={{ color: T.muted }}>Application #{app.app_number}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: T.green }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.green }} />
          Support online
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: T.greenLt }}>
              <MessageSquare size={20} style={{ color: T.green }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: T.head }}>No messages yet</p>
            <p className="text-xs text-center" style={{ color: T.muted }}>
              Send a message to our support team about this application. We respond within 24 hours.
            </p>
          </div>
        ) : (
          messages.map(m => {
            const isUser = m.sender_type === 'user'
            return (
              <div key={m.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-1 text-[10px] font-black"
                  style={isUser
                    ? { background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff' }
                    : { background: '#EFF6FF', color: '#2563EB', fontSize: 10 }}>
                  {isUser ? (m.sender_name?.[0] || 'U') : 'S'}
                </div>
                <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={isUser
                      ? { background: 'linear-gradient(135deg,#16A34A,#15803D)', color: '#fff', borderTopRightRadius: '4px' }
                      : { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.body, borderTopLeftRadius: '4px' }}>
                    {m.content}
                  </div>
                  <p className="text-[10px] px-1" style={{ color: T.muted }}>
                    {m.sender_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 p-2 rounded-2xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type your message to our support team…" disabled={sending}
            className="flex-1 h-9 rounded-xl px-3.5 text-sm bg-transparent border-none outline-none"
            style={{ color: T.head }} />
          <button onClick={send} disabled={sending || !text.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }}>
            {sending ? <Loader2 size={14} className="animate-spin text-white" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-[10px] text-center mt-1.5" style={{ color: T.muted }}>Our team responds within 24 hours on business days</p>
      </div>
    </div>
  )
}

/* ── Milestones Tab ─────────────────────────────── */
function MilestonesTab({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#FFFBEB' }}>
          <Star size={15} style={{ color: '#D97706' }} />
        </div>
        <div>
          <h2 className="text-sm font-bold" style={{ color: T.head }}>Application Milestones</h2>
          <p className="text-xs" style={{ color: T.muted }}>Set and tracked by our review team</p>
        </div>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: T.greenLt }}>
            <CheckSquare size={20} style={{ color: T.green }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: T.head }}>No milestones yet</p>
          <p className="text-xs" style={{ color: T.muted }}>
            Our team will add milestones as your application progresses through review.
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {milestones.map((m, i) => (
            <div key={m.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: m.completed ? T.greenLt : '#F8FAFC', border: `1px solid ${m.completed ? T.greenBd : T.border}` }}>
                  {m.completed
                    ? <CheckCircle2 size={16} style={{ color: T.green }} />
                    : <Clock size={16} style={{ color: T.muted }} />
                  }
                </div>
                {i < milestones.length - 1 && <div className="w-px flex-1 my-1.5" style={{ background: T.border }} />}
              </div>
              <div className="pb-5 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold" style={{ color: T.head }}>{m.title}</p>
                    {m.description && <p className="text-xs leading-relaxed mt-0.5" style={{ color: T.body }}>{m.description}</p>}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: m.completed ? T.greenLt : '#F8FAFC',
                      color: m.completed ? T.green : T.muted,
                      border: `1px solid ${m.completed ? T.greenBd : T.border}`,
                    }}>
                    {m.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                {m.completed && m.completed_at && (
                  <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: T.muted }}>
                    <CheckCircle2 size={9} /> {formatDateShort(m.completed_at)}
                  </p>
                )}
                <p className="text-[10px] mt-0.5" style={{ color: T.muted }}>Added {formatDateShort(m.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {milestones.length > 0 && (
        <div className="mt-4 pt-4 flex items-center gap-3" style={{ borderTop: `1px solid ${T.border}` }}>
          <div className="flex-1 h-2 rounded-full" style={{ background: T.border }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${(milestones.filter(m => m.completed).length / milestones.length) * 100}%`, background: 'linear-gradient(90deg,#16A34A,#22C55E)' }} />
          </div>
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: T.green }}>
            {milestones.filter(m => m.completed).length}/{milestones.length} Complete
          </span>
        </div>
      )}
    </div>
  )
}

/* ── Disbursement Tab ───────────────────────────── */
function DisbursementTab({ app }: { app: GrantApplication }) {
  const currentIdx = DISB_STAGES.findIndex(s => s.key === app.disbursement_stage)

  const stageDate = (field: string): string | undefined => {
    const map: Record<string, string | undefined> = {
      disbursement_initiated_at:  app.disbursement_initiated_at,
      disbursement_processing_at: app.disbursement_processing_at,
      disbursement_sent_at:       app.disbursement_sent_at,
      disbursement_deposited_at:  app.disbursement_deposited_at,
    }
    return map[field]
  }

  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#F5F3FF' }}>
            <Banknote size={15} style={{ color: '#7C3AED' }} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: T.head }}>Disbursement Status</h2>
            <p className="text-xs" style={{ color: T.muted }}>ACH bank transfer tracking</p>
          </div>
          {app.approved_amount && (
            <div className="ml-auto text-right">
              <p className="text-xl font-black" style={{ color: T.green }}>{formatCurrency(app.approved_amount)}</p>
              <p className="text-xs" style={{ color: T.muted }}>Approved amount</p>
            </div>
          )}
        </div>

        {!['approved','disbursed'].includes(app.status) ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ background: '#FFFBEB' }}>
              <Clock size={20} style={{ color: '#D97706' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: T.head }}>Disbursement Not Yet Initiated</p>
            <p className="text-xs" style={{ color: T.muted }}>
              {app.status === 'pending' || app.status === 'under_review'
                ? 'Your application is still under review. Disbursement will begin once approved.'
                : 'Your application was not approved for disbursement.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {DISB_STAGES.map((stage, i) => {
              const done = currentIdx >= i
              const current = currentIdx === i
              const date = stageDate(stage.field)
              return (
                <div key={stage.key} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center mt-0.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: done ? (current ? T.green : T.greenLt) : '#F8FAFC',
                        border: `1px solid ${done ? (current ? T.green : T.greenBd) : T.border}`,
                      }}>
                      {done
                        ? <CheckCircle2 size={16} style={{ color: current ? '#fff' : T.green }} />
                        : <span className="text-[11px] font-black" style={{ color: T.muted }}>{i + 1}</span>
                      }
                    </div>
                    {i < DISB_STAGES.length - 1 && <div className="w-px flex-1 min-h-[16px] mt-1.5" style={{ background: done && currentIdx > i ? T.greenBd : T.border }} />}
                  </div>
                  <div className="pb-4 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold" style={{ color: done ? T.head : T.muted }}>{stage.label}</p>
                        <p className="text-xs" style={{ color: T.muted }}>{stage.desc}</p>
                      </div>
                      {current && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                          style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                          Current Stage
                        </span>
                      )}
                    </div>
                    {date && <p className="text-[10px] mt-1 font-semibold" style={{ color: T.green }}>✓ {formatDateShort(date)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Tracking info */}
      {(app.disbursement_tracking || app.bank_reference) && (
        <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
          <h2 className="text-sm font-bold mb-4" style={{ color: T.head }}>Tracking Reference</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {app.disbursement_tracking && (
              <div className="p-3.5 rounded-xl" style={{ background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: '#7C3AED' }}>Transfer Reference</p>
                <p className="font-mono text-sm font-bold" style={{ color: T.head }}>{app.disbursement_tracking}</p>
              </div>
            )}
            {app.bank_reference && (
              <div className="p-3.5 rounded-xl" style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: T.green }}>Bank Reference</p>
                <p className="font-mono text-sm font-bold" style={{ color: T.head }}>{app.bank_reference}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank account used */}
      {app.bank_name && (
        <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: T.head }}>Disbursement Account</h2>
          <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#EFF6FF' }}>
              <CreditCard size={16} style={{ color: '#2563EB' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: T.head }}>{app.bank_name}</p>
              <p className="text-xs" style={{ color: T.muted }}>
                {app.account_type || 'Account'} · Routing ••••{app.routing_number?.slice(-4)} · Acct ••••••
              </p>
            </div>
          </div>
          <p className="text-xs mt-2" style={{ color: T.muted }}>
            To update your bank account before disbursement, go to the <strong>Bank Account</strong> tab.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── Bank Tab ───────────────────────────────────── */
function BankTab({ app, setApp }: { app: GrantApplication; setApp: React.Dispatch<React.SetStateAction<GrantApplication | null>> }) {
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [showAcct, setShowAcct] = useState(false)
  const [form, setForm]         = useState({
    bank_name:      app.bank_name || '',
    routing_number: app.routing_number || '',
    account_number: app.account_number || '',
    account_type:   app.account_type || '',
  })
  const [errs, setErrs] = useState<Record<string, string>>({})

  async function save() {
    const e: Record<string, string> = {}
    if (!form.bank_name.trim()) e.bank_name = 'Bank name is required'
    if (form.routing_number.length !== 9 || !/^\d+$/.test(form.routing_number)) e.routing_number = 'Must be exactly 9 digits'
    if (form.account_number.length < 4) e.account_number = 'Enter a valid account number'
    if (!form.account_type) e.account_type = 'Select account type'
    if (Object.keys(e).length) { setErrs(e); return }
    setErrs({})
    setSaving(true)
    const { error } = await supabase.from('grant_applications').update({
      bank_name: form.bank_name,
      routing_number: form.routing_number,
      account_number: form.account_number,
      account_type: form.account_type,
    }).eq('id', app.id)
    if (!error) {
      setApp(prev => prev ? { ...prev, ...form } : prev)
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  const ic = 'w-full h-10 rounded-xl px-3.5 text-sm bg-[#F8FAFC] border border-[#EDE9E3] outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#F0FDF4] transition-all'

  return (
    <div className="space-y-5">
      {/* Warning */}
      {['approved'].includes(app.status) && (
        <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
          <AlertTriangle size={15} style={{ color: '#D97706' }} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold" style={{ color: '#92400E' }}>Update before disbursement is initiated</p>
            <p className="text-xs mt-0.5" style={{ color: '#B45309' }}>
              Incorrect bank details will cause disbursement failure. Verify your information is accurate before funds are sent.
            </p>
          </div>
        </div>
      )}

      {/* Current bank info */}
      <div className="rounded-2xl p-6" style={{ background: T.white, boxShadow: T.card }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold" style={{ color: T.head }}>Bank Account on File</h2>
          {!editing && app.status !== 'disbursed' && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
              <Edit3 size={11} /> Update Bank
            </button>
          )}
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: T.green }}>
              <CheckCircle2 size={12} /> Saved successfully
            </span>
          )}
        </div>

        {!editing ? (
          <div className="space-y-3">
            {[
              { label: 'Bank Name',      value: app.bank_name || 'Not provided' },
              { label: 'Routing Number', value: app.routing_number ? `••••••${app.routing_number.slice(-3)}` : 'Not provided' },
              { label: 'Account Number', value: app.account_number ? (showAcct ? app.account_number : '••••••' + app.account_number.slice(-4)) : 'Not provided' },
              { label: 'Account Type',   value: app.account_type || 'Not provided' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5"
                style={{ borderBottom: `1px solid ${T.border}` }}>
                <span className="text-xs font-semibold" style={{ color: T.muted }}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: T.head }}>{value}</span>
                  {label === 'Account Number' && app.account_number && (
                    <button onClick={() => setShowAcct(s => !s)} style={{ color: T.muted }}>
                      {showAcct ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {app.status === 'disbursed' && (
              <div className="pt-2 flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
                <Lock size={11} /> Bank account is locked after disbursement
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#166534' }}>
              <Shield size={13} className="shrink-0 mt-0.5" />
              Bank details are encrypted using 256-bit SSL. Used solely for grant disbursement via ACH.
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Bank Name *</label>
              <input className={ic} style={{ color: T.head }} value={form.bank_name}
                placeholder="e.g. Chase, Bank of America"
                onChange={e => setForm(f => ({ ...f, bank_name: e.target.value }))} />
              {errs.bank_name && <p className="text-xs text-red-500 mt-1">{errs.bank_name}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Routing Number * (9 digits)</label>
                <div className="relative">
                  <input className={ic + ' pr-8'} style={{ color: T.head }} value={form.routing_number}
                    maxLength={9} placeholder="000000000"
                    onChange={e => setForm(f => ({ ...f, routing_number: e.target.value }))} />
                  <Lock size={11} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                </div>
                {errs.routing_number && <p className="text-xs text-red-500 mt-1">{errs.routing_number}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Account Number *</label>
                <div className="relative">
                  <input type="password" className={ic + ' pr-8'} style={{ color: T.head }} value={form.account_number}
                    placeholder="Account number"
                    onChange={e => setForm(f => ({ ...f, account_number: e.target.value }))} />
                  <Lock size={11} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
                </div>
                {errs.account_number && <p className="text-xs text-red-500 mt-1">{errs.account_number}</p>}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: T.muted }}>Account Type *</label>
              <select value={form.account_type}
                onChange={e => setForm(f => ({ ...f, account_type: e.target.value }))}
                className={ic} style={{ color: T.head }}>
                <option value="">Select account type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="business_checking">Business Checking</option>
              </select>
              {errs.account_type && <p className="text-xs text-red-500 mt-1">{errs.account_type}</p>}
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setEditing(false); setErrs({}) }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.body }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="rounded-2xl p-5" style={{ background: '#0F172A' }}>
        <p className="text-xs font-bold text-white mb-3">Bank Security Guarantee</p>
        {[
          'Your bank details are encrypted at rest using AES-256',
          'All transfers use secure ACH via NACHA-compliant rails',
          'Bank data is never shared with third parties',
          'Account numbers are masked in all displays and logs',
        ].map(item => (
          <div key={item} className="flex items-center gap-2 py-1.5">
            <CheckCircle2 size={11} style={{ color: '#4ADE80' }} />
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Loading State ──────────────────────────────── */
function LoadingState() {
  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8 space-y-5">
      <div className="h-8 w-40 rounded-xl animate-pulse" style={{ background: '#EDE9E3' }} />
      <div className="h-40 rounded-2xl animate-pulse" style={{ background: '#EDE9E3' }} />
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="h-10 flex-1 rounded-xl animate-pulse" style={{ background: '#EDE9E3' }} />)}
      </div>
      <div className="h-72 rounded-2xl animate-pulse" style={{ background: '#EDE9E3' }} />
    </div>
  )
}
