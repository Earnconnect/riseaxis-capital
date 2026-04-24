import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ChevronLeft, CheckCircle2, XCircle, Clock, Send,
  Plus, Trash2, Edit2, Loader2, DollarSign, User,
  MapPin, CreditCard, Briefcase, FileText, Bell,
  CheckSquare, AlertTriangle, Upload, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, formatDateShort, getGrantProgramLabel, getStatusLabel } from '@/lib/utils'
import type { GrantApplication, Milestone } from '@/types'

const T = {
  page: '#FAF8F5', card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const DISBURSEMENT_STAGES = [
  { key: 'initiated',    label: 'Initiated' },
  { key: 'processing',   label: 'Processing' },
  { key: 'sent_to_bank', label: 'Sent to Bank' },
  { key: 'deposited',    label: 'Deposited to Account' },
]

function statusVariant(status: string): Parameters<typeof Badge>[0]['variant'] {
  const map: Record<string, string> = { pending:'pending', under_review:'review', approved:'approved', rejected:'rejected', disbursed:'disbursed' }
  return (map[status] || 'default') as Parameters<typeof Badge>[0]['variant']
}

export default function ReviewApplicationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  interface AppDoc { id: string; name: string; doc_type: string; file_path: string; file_size: number; status: 'uploaded'|'verified'|'rejected'; uploaded_at: string }

  const [app, setApp]           = useState<GrantApplication | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [docs, setDocs]         = useState<AppDoc[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [docSaving, setDocSaving] = useState<string | null>(null)

  const [approveOpen,   setApproveOpen]   = useState(false)
  const [rejectOpen,    setRejectOpen]    = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)
  const [commOpen,      setCommOpen]      = useState(false)

  const [approveAmount,  setApproveAmount]  = useState('')
  const [rejectReason,   setRejectReason]   = useState('')
  const [reviewerNotes,  setReviewerNotes]  = useState('')
  const [newMilestone,   setNewMilestone]   = useState({ title: '', description: '' })
  const [commSubject,    setCommSubject]    = useState('')
  const [commMessage,    setCommMessage]    = useState('')

  useEffect(() => { fetchApp() }, [id])

  async function fetchApp() {
    if (!id) return
    const [appRes, msRes, docsRes] = await Promise.all([
      supabase.from('grant_applications').select('*').eq('id', id).single(),
      supabase.from('milestones').select('*').eq('application_id', id).order('created_at'),
      supabase.from('app_documents').select('*').eq('application_id', id).order('uploaded_at', { ascending: false }),
    ])
    if (appRes.data) {
      setApp(appRes.data as GrantApplication)
      setApproveAmount(String(appRes.data.requested_amount))
      setReviewerNotes(appRes.data.reviewer_notes || '')
    }
    if (msRes.data) setMilestones(msRes.data as Milestone[])
    if (docsRes.data) setDocs(docsRes.data as AppDoc[])
    setLoading(false)
  }

  async function reviewDoc(doc: AppDoc, status: 'verified' | 'rejected') {
    if (!app) return
    setDocSaving(doc.id)
    await supabase.from('app_documents').update({ status }).eq('id', doc.id)
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...d, status } : d))
    await supabase.from('notifications').insert({
      user_id: app.user_id,
      type: 'documents_requested',
      title: status === 'verified' ? 'Document Verified' : 'Document Needs Attention',
      message: status === 'verified'
        ? `Your document "${doc.name}" has been verified for application ${app.app_number}.`
        : `Your document "${doc.name}" was not accepted for application ${app.app_number}. Please re-upload.`,
      application_id: app.id,
    })
    setDocSaving(null)
  }

  async function downloadDoc(doc: AppDoc) {
    const { data } = await supabase.storage.from('grant-documents').createSignedUrl(doc.file_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function updateStatus(status: string, extra: Record<string, unknown> = {}) {
    if (!app) return
    setSaving(true)
    const { error } = await supabase
      .from('grant_applications')
      .update({ status, reviewed_at: new Date().toISOString(), ...extra })
      .eq('id', app.id)
    if (!error) {
      const messages: Record<string, { title: string; message: string }> = {
        approved:     { title: 'Application Approved',      message: `Congratulations! Your application ${app.app_number} has been approved for ${formatCurrency(Number(approveAmount))}.` },
        rejected:     { title: 'Application Update',        message: `Your application ${app.app_number} has been reviewed. Please see the details in your dashboard.` },
        under_review: { title: 'Application Under Review',  message: `Your application ${app.app_number} is now under review by our team.` },
      }
      if (messages[status]) {
        await supabase.from('notifications').insert({
          user_id: app.user_id,
          type: status === 'approved' ? 'approval' : status === 'rejected' ? 'rejection' : 'under_review',
          ...messages[status],
          application_id: app.id,
        })
      }
      await fetchApp()
    }
    setSaving(false)
    setApproveOpen(false)
    setRejectOpen(false)
  }

  async function saveNotes() {
    if (!app) return
    setSaving(true)
    await supabase.from('grant_applications').update({ reviewer_notes: reviewerNotes }).eq('id', app.id)
    setSaving(false)
  }

  async function updateDisbursement(stage: string) {
    if (!app) return
    setSaving(true)
    const stageField = `disbursement_${stage === 'initiated' ? 'initiated' : stage === 'processing' ? 'processing' : stage === 'sent_to_bank' ? 'sent' : 'deposited'}_at`
    await supabase.from('grant_applications').update({
      disbursement_stage: stage,
      status: stage === 'deposited' ? 'disbursed' : 'approved',
      [stageField]: new Date().toISOString(),
    }).eq('id', app.id)
    if (stage === 'deposited') {
      await supabase.from('notifications').insert({
        user_id: app.user_id,
        type: 'disbursement',
        title: 'Funds Deposited',
        message: `Your grant of ${formatCurrency(app.approved_amount || 0)} has been deposited. Application: ${app.app_number}`,
        application_id: app.id,
      })
    }
    await fetchApp()
    setSaving(false)
  }

  async function addMilestone() {
    if (!app || !newMilestone.title) return
    await supabase.from('milestones').insert({
      application_id: app.id,
      title: newMilestone.title,
      description: newMilestone.description,
    })
    setNewMilestone({ title: '', description: '' })
    setMilestoneOpen(false)
    await fetchApp()
  }

  async function toggleMilestone(m: Milestone) {
    await supabase.from('milestones').update({
      completed: !m.completed,
      completed_at: !m.completed ? new Date().toISOString() : null,
    }).eq('id', m.id)
    await fetchApp()
  }

  async function deleteMilestone(milestoneId: string) {
    await supabase.from('milestones').delete().eq('id', milestoneId)
    await fetchApp()
  }

  async function sendCommunication() {
    if (!app || !commMessage) return
    setSaving(true)
    await supabase.from('notifications').insert({
      user_id: app.user_id,
      type: 'general',
      title: commSubject || 'Message from RiseAxis Capital',
      message: commMessage,
      application_id: app.id,
    })
    setCommOpen(false)
    setCommSubject('')
    setCommMessage('')
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 rounded animate-pulse bg-slate-100" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 rounded animate-pulse bg-slate-100" />
            <div className="h-3 w-28 rounded animate-pulse bg-slate-100" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl p-5 space-y-3 animate-pulse"
                style={{ background: '#fff', border: `1px solid ${T.border}` }}>
                <div className="h-4 w-32 mb-4 bg-slate-100 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="space-y-1">
                      <div className="h-3 w-20 rounded bg-slate-100" />
                      <div className="h-4 w-32 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="text-center py-24" style={{ color: T.muted }}>
        Application not found.
      </div>
    )
  }

  const stageIndex = DISBURSEMENT_STAGES.findIndex(s => s.key === app.disbursement_stage)
  const completedMilestones = milestones.filter(m => m.completed).length

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-8 space-y-5">

      {/* Back + Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/applications"
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: T.sub }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold truncate" style={{ color: T.heading }}>{app.full_name}</h1>
              <Badge variant={statusVariant(app.status)}>{getStatusLabel(app.status)}</Badge>
            </div>
            <div className="text-xs font-mono mt-0.5" style={{ color: T.muted }}>{app.app_number}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCommOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:bg-slate-100"
            style={{ color: T.sub, border: `1px solid ${T.border}` }}>
            <Bell className="w-3.5 h-3.5" /> Message
          </button>
          {app.status === 'pending' && (
            <button onClick={() => updateStatus('under_review')} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}>
              <Clock className="w-3.5 h-3.5" /> Under Review
            </button>
          )}
          {['pending','under_review'].includes(app.status) && (
            <>
              <button onClick={() => setApproveOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
              <button onClick={() => setRejectOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                <XCircle className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection notice */}
      {app.status === 'rejected' && app.rejection_reason && (
        <div className="rounded-xl px-5 py-4 flex items-start gap-3"
          style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-red-700 mb-0.5">Rejection Reason</div>
            <p className="text-sm text-red-600">{app.rejection_reason}</p>
          </div>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: Applicant details */}
        <div className="lg:col-span-2 space-y-4">

          <Section title="Grant Details" icon={FileText}>
            <InfoGrid>
              <InfoItem label="Program"           value={getGrantProgramLabel(app.grant_program)} />
              <InfoItem label="Requested Amount"  value={formatCurrency(app.requested_amount)} highlight />
              {app.approved_amount != null && <InfoItem label="Approved Amount" value={formatCurrency(app.approved_amount)} highlight />}
              <InfoItem label="Applied On"        value={formatDate(app.created_at)} />
              {app.reviewed_at && <InfoItem label="Reviewed On" value={formatDate(app.reviewed_at)} />}
              {app.timeline     && <InfoItem label="Timeline"   value={app.timeline} />}
            </InfoGrid>
            <div className="mt-4">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Purpose</div>
              <p className="text-sm leading-relaxed p-3 rounded-xl" style={{ background: '#F8FAFC', color: T.sub }}>{app.purpose}</p>
            </div>
            {app.budget_breakdown && (
              <div className="mt-3">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: T.muted }}>Budget Breakdown</div>
                <p className="text-sm p-3 rounded-xl" style={{ background: '#F8FAFC', color: T.sub }}>{app.budget_breakdown}</p>
              </div>
            )}
          </Section>

          <Section title="Personal Information" icon={User}>
            <InfoGrid>
              <InfoItem label="Full Name"   value={app.full_name} />
              <InfoItem label="Email"       value={app.email} />
              <InfoItem label="Phone"       value={app.phone} />
              {app.date_of_birth   && <InfoItem label="Date of Birth"    value={formatDate(app.date_of_birth)} />}
              {app.ssn_last4       && <InfoItem label="SSN (Last 4)"     value={`***-**-${app.ssn_last4}`} />}
              {app.citizenship     && <InfoItem label="Citizenship"       value={app.citizenship} />}
              {app.marital_status  && <InfoItem label="Marital Status"    value={app.marital_status} />}
              {app.emergency_contact_name && <InfoItem label="Emergency Contact" value={app.emergency_contact_name} />}
            </InfoGrid>
          </Section>

          <Section title="ID & Address" icon={MapPin}>
            <InfoGrid>
              {app.id_type   && <InfoItem label="ID Type"  value={app.id_type} />}
              {app.id_number && <InfoItem label="ID Number" value={app.id_number} />}
              {app.id_expiry && <InfoItem label="Expiry"    value={app.id_expiry} />}
            </InfoGrid>
            {app.address_line1 && (
              <div className="mt-3 text-sm p-3 rounded-xl" style={{ background: '#F8FAFC', color: T.sub }}>
                {app.address_line1}{app.address_line2 ? `, ${app.address_line2}` : ''}<br />
                {app.city}, {app.state} {app.zip_code}
              </div>
            )}
          </Section>

          <Section title="Financial Disclosure" icon={DollarSign}>
            <InfoGrid>
              {app.household_size   != null && <InfoItem label="Household Size"   value={String(app.household_size)} />}
              {app.annual_income    != null && <InfoItem label="Annual Income"    value={formatCurrency(app.annual_income!)} />}
              {app.monthly_expenses != null && <InfoItem label="Monthly Expenses" value={formatCurrency(app.monthly_expenses!)} />}
              {app.total_debts      != null && <InfoItem label="Total Debts"      value={formatCurrency(app.total_debts!)} />}
              {app.employment_status && <InfoItem label="Employment"  value={app.employment_status} />}
              {app.credit_score_range && <InfoItem label="Credit Score" value={app.credit_score_range} />}
              {app.employer_name     && <InfoItem label="Employer"     value={app.employer_name} />}
            </InfoGrid>
          </Section>

          <Section title="Bank Information" icon={CreditCard}>
            <InfoGrid>
              {app.bank_name      && <InfoItem label="Bank"         value={app.bank_name} />}
              {app.routing_number && <InfoItem label="Routing #"    value={`***${app.routing_number.slice(-4)}`} />}
              {app.account_number && <InfoItem label="Account #"    value={`****${app.account_number.slice(-4)}`} />}
              {app.account_type   && <InfoItem label="Account Type" value={app.account_type} />}
            </InfoGrid>
          </Section>

          {app.business_name && (
            <Section title="Business Information" icon={Briefcase}>
              <InfoGrid>
                <InfoItem label="Business Name" value={app.business_name} />
                {app.business_type && <InfoItem label="Type" value={app.business_type} />}
              </InfoGrid>
              {app.business_description && (
                <p className="mt-3 text-sm p-3 rounded-xl" style={{ background: '#F8FAFC', color: T.sub }}>
                  {app.business_description}
                </p>
              )}
            </Section>
          )}

          {/* Documents Review */}
          <Section title={`Uploaded Documents (${docs.length})`} icon={Upload}>
            {docs.length === 0 ? (
              <p className="text-xs py-2" style={{ color: T.muted }}>No documents uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {docs.map(doc => {
                  const sc = { uploaded: '#D97706', verified: '#16A34A', rejected: '#DC2626' }[doc.status]
                  const sb = { uploaded: '#FFFBEB', verified: '#F0FDF4', rejected: '#FEF2F2' }[doc.status]
                  const sd = { uploaded: '#FDE68A', verified: '#BBF7D0', rejected: '#FECACA' }[doc.status]
                  return (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: T.heading }}>{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px]" style={{ color: T.muted }}>{doc.doc_type}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: sb, color: sc, border: `1px solid ${sd}` }}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => downloadDoc(doc)} title="Download"
                          className="p-1.5 rounded-lg transition-all hover:bg-slate-200"
                          style={{ color: T.muted }}>
                          <Download size={13} />
                        </button>
                        {doc.status !== 'verified' && (
                          <button onClick={() => reviewDoc(doc, 'verified')} disabled={docSaving === doc.id}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                            style={{ background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>
                            {docSaving === doc.id ? '…' : '✓ Verify'}
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button onClick={() => reviewDoc(doc, 'rejected')} disabled={docSaving === doc.id}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>
                            {docSaving === doc.id ? '…' : '✗ Reject'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Reviewer Notes */}
          <div className="rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <h3 className="text-sm font-bold mb-3" style={{ color: T.heading }}>Reviewer Notes</h3>
            <textarea
              rows={4}
              value={reviewerNotes}
              onChange={e => setReviewerNotes(e.target.value)}
              placeholder="Add internal notes..."
              className="w-full text-sm rounded-xl p-3 resize-none outline-none transition-all"
              style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
              onFocus={e => { e.currentTarget.style.borderColor = T.green; e.currentTarget.style.background = '#fff' }}
              onBlur={e  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = '#F8FAFC' }}
            />
            <button onClick={saveNotes} disabled={saving}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-95"
              style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Edit2 className="w-3.5 h-3.5" />}
              Save Notes
            </button>
          </div>

          {/* Milestone Manager */}
          <div className="rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold" style={{ color: T.heading }}>Milestones</h3>
                {milestones.length > 0 && (
                  <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>
                    {completedMilestones}/{milestones.length} completed
                  </p>
                )}
              </div>
              <button onClick={() => setMilestoneOpen(true)}
                className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:bg-slate-100"
                style={{ color: T.sub, border: `1px solid ${T.border}` }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {milestones.length > 0 && (
              <div className="w-full rounded-full h-1.5 mb-3" style={{ background: '#F1F5F9' }}>
                <div className="h-1.5 rounded-full transition-all"
                  style={{ width: `${milestones.length ? (completedMilestones/milestones.length)*100 : 0}%`, background: T.green }} />
              </div>
            )}

            {milestones.length === 0 ? (
              <p className="text-xs" style={{ color: T.muted }}>No milestones yet. Add one to track progress.</p>
            ) : (
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.id} className="flex items-start gap-2 p-2.5 rounded-xl"
                    style={{ background: '#F8FAFC', border: `1px solid ${T.border}` }}>
                    <button onClick={() => toggleMilestone(m)} className="mt-0.5 shrink-0">
                      {m.completed
                        ? <CheckSquare className="w-4 h-4" style={{ color: T.green }} />
                        : <div className="w-4 h-4 rounded border-2" style={{ borderColor: '#CBD5E1' }} />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium ${m.completed ? 'line-through' : ''}`}
                        style={{ color: m.completed ? T.muted : T.heading }}>
                        {m.title}
                      </div>
                      {m.description && <div className="text-[10px] mt-0.5" style={{ color: T.muted }}>{m.description}</div>}
                    </div>
                    <button onClick={() => deleteMilestone(m.id)}
                      className="shrink-0 transition-colors hover:text-red-500" style={{ color: T.muted }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disbursement Tracker */}
          {['approved','disbursed'].includes(app.status) && (
            <div className="rounded-2xl p-5" style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: T.heading }}>Disbursement</h3>
              {app.approved_amount && (
                <div className="rounded-xl px-4 py-3 mb-4 flex items-center justify-between"
                  style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                  <span className="text-xs font-semibold" style={{ color: T.green }}>Approved Amount</span>
                  <span className="text-sm font-bold" style={{ color: T.green }}>{formatCurrency(app.approved_amount)}</span>
                </div>
              )}
              <div className="space-y-3">
                {DISBURSEMENT_STAGES.map((stage, i) => {
                  const isCompleted = i <= stageIndex
                  const isCurrent   = i === stageIndex + 1
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                        style={isCompleted
                          ? { background: 'linear-gradient(135deg, #16A34A, #15803D)', color: '#fff' }
                          : isCurrent
                          ? { background: T.greenLt, border: `2px solid ${T.greenBd}`, color: T.green }
                          : { background: '#F1F5F9', color: T.muted }
                        }>
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <div className="flex-1 text-xs font-medium"
                        style={{ color: isCompleted ? T.green : isCurrent ? T.heading : T.muted }}>
                        {stage.label}
                      </div>
                      {isCurrent && (
                        <button onClick={() => updateDisbursement(stage.key)} disabled={saving}
                          className="text-xs px-2.5 h-6 rounded-lg font-semibold transition-all hover:brightness-95"
                          style={{ background: T.greenLt, color: T.green, border: `1px solid ${T.greenBd}` }}>
                          {saving ? '…' : 'Mark'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Approve Dialog ─────────────────────────────────────── */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Approved Amount ($)</Label>
              <input type="number" value={approveAmount} onChange={e => setApproveAmount(e.target.value)}
                placeholder="Enter approved amount"
                className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
              <p className="text-xs" style={{ color: T.muted }}>Requested: {formatCurrency(app.requested_amount)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApproveOpen(false)}>Cancel</Button>
            <Button onClick={() => updateStatus('approved', { approved_amount: Number(approveAmount) })} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ──────────────────────────────────────── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Reason for Rejection *</Label>
              <textarea rows={4} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why this application is being rejected..."
                className="w-full text-sm rounded-xl p-3 resize-none outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive"
              onClick={() => updateStatus('rejected', { rejection_reason: rejectReason })}
              disabled={saving || !rejectReason}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Milestone Dialog ───────────────────────────────── */}
      <Dialog open={milestoneOpen} onOpenChange={setMilestoneOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <input value={newMilestone.title} onChange={e => setNewMilestone(p => ({ ...p, title: e.target.value }))}
                placeholder="Milestone title"
                className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea rows={3} value={newMilestone.description}
                onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))}
                placeholder="Optional description"
                className="w-full text-sm rounded-xl p-3 resize-none outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMilestoneOpen(false)}>Cancel</Button>
            <Button onClick={addMilestone} disabled={!newMilestone.title}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Send Communication Dialog ──────────────────────────── */}
      <Dialog open={commOpen} onOpenChange={setCommOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to Applicant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Quick Templates</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Documents Needed', msg: 'We need additional documents to process your application. Please upload them through your dashboard.' },
                  { label: 'Under Review',     msg: 'Your application is currently under review by our team. We will notify you of any updates.' },
                  { label: 'Info Request',     msg: 'We need additional information to complete your application review. Please contact us at grants@riseaxiscapital.com.' },
                ].map(t => (
                  <button key={t.label} onClick={() => { setCommSubject(t.label); setCommMessage(t.msg) }}
                    className="text-xs px-2.5 py-1 rounded-lg font-medium transition-colors hover:bg-slate-100"
                    style={{ background: '#F8FAFC', color: T.sub, border: `1px solid ${T.border}` }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <input value={commSubject} onChange={e => setCommSubject(e.target.value)}
                placeholder="Message subject"
                className="w-full h-10 px-3 rounded-xl text-sm outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
            <div className="space-y-1.5">
              <Label>Message *</Label>
              <textarea rows={4} value={commMessage} onChange={e => setCommMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full text-sm rounded-xl p-3 resize-none outline-none"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCommOpen(false)}>Cancel</Button>
            <Button onClick={sendCommunication} disabled={!commMessage || saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────────── */
const T_local = {
  card: '#FFFFFF', border: '#EDE9E3', heading: '#0F172A', muted: '#94A3B8', sub: '#64748B', green: '#16A34A',
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string; size?: number }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5"
      style={{ background: T_local.card, border: `1px solid ${T_local.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T_local.border}` }}>
        <Icon className="w-4 h-4" size={16} style={{ color: T_local.muted } as React.CSSProperties} />
        <h3 className="text-sm font-bold" style={{ color: T_local.heading }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</div>
}

function InfoItem({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs font-medium" style={{ color: T_local.muted }}>{label}</div>
      <div className="text-sm font-semibold mt-0.5" style={{ color: highlight ? T_local.green : T_local.heading }}>
        {value}
      </div>
    </div>
  )
}
