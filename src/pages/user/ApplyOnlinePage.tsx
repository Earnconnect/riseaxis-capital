import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2, ChevronRight, ChevronLeft, Loader2, Save,
  Shield, AlertTriangle, Upload, FileText, GraduationCap,
  HeartPulse, Briefcase, Building2, Users, Lock, DollarSign,
  Edit3, Star, Phone, Mail, Clock, MessageSquare,
  LayoutDashboard, Info, X, XCircle,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { generateAppNumber } from '@/lib/utils'

const DRAFT_KEY = 'riseaxis_application_draft_v2'

const S = {
  page: '#FAF8F5', white: '#FFFFFF', head: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
  card: '0 1px 4px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
}

const ic = 'w-full h-10 rounded-xl px-3.5 text-sm text-slate-900 bg-[#F8FAFC] border border-[#EDE9E3] placeholder:text-slate-400 outline-none transition-all focus:border-[#16A34A] focus:ring-2 focus:ring-[#F0FDF4]'
const ta = 'w-full rounded-xl px-3.5 py-2.5 text-sm text-slate-900 bg-[#F8FAFC] border border-[#EDE9E3] placeholder:text-slate-400 outline-none transition-all resize-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#F0FDF4]'
const lc = 'block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5'
const ec = 'text-xs text-red-500 mt-1'

const STEPS = [
  { id: 1, label: 'Program',     short: 'Program'  },
  { id: 2, label: 'Purpose',     short: 'Purpose'  },
  { id: 3, label: 'Identity',    short: 'Identity' },
  { id: 4, label: 'ID & Address', short: 'Address' },
  { id: 5, label: 'Financial',   short: 'Finance'  },
  { id: 6, label: 'Documents',   short: 'Docs'     },
  { id: 7, label: 'Submit',      short: 'Submit'   },
]

const PROGRAMS = [
  {
    value: 'emergency_assistance', label: 'Emergency Assistance',
    range: '$5,000–$10,000', time: '3–5 days', icon: Shield,
    color: '#DC2626', bg: '#FEF2F2',
    desc: 'Urgent crises — eviction, utility shutoff, food insecurity, or natural disaster',
    requirements: ['Proof of emergency (notice/bill)', 'Government photo ID', 'Bank account for ACH'],
    eligibility: ['US residents 18+', 'Annual income under $75K', 'Documented financial crisis'],
  },
  {
    value: 'education_support', label: 'Education Support',
    range: '$8,000–$15,000', time: '7–10 days', icon: GraduationCap,
    color: '#2563EB', bg: '#EFF6FF',
    desc: 'Tuition, books, fees, and equipment for enrolled or admitted students',
    requirements: ['Enrollment/acceptance letter', 'Tuition bill or statement', 'Government photo ID'],
    eligibility: ['Enrolled in accredited institution', 'US residents 16+', 'Demonstrated financial need'],
  },
  {
    value: 'medical_expenses', label: 'Medical Expenses',
    range: '$10,000–$25,000', time: '5–7 days', icon: HeartPulse,
    color: '#DB2777', bg: '#FDF2F8',
    desc: 'Medical bills, prescriptions, treatments, procedures, and durable medical equipment',
    requirements: ['Medical bills or treatment plan', 'Government photo ID', 'Insurance denial (if any)'],
    eligibility: ['US residents 18+', 'Documented medical need', 'Uninsured or underinsured'],
  },
  {
    value: 'community_development', label: 'Community Development',
    range: '$15,000–$25,000', time: '10–14 days', icon: Users,
    color: '#16A34A', bg: '#F0FDF4',
    desc: 'Projects benefiting local communities, nonprofits, and civic programs',
    requirements: ['Project proposal & budget', 'Organization registration', 'Community impact statement'],
    eligibility: ['Registered nonprofit or community org', 'US-based project', 'Serves 50+ members'],
  },
  {
    value: 'business_funding', label: 'Business Funding',
    range: '$5,000–$50,000', time: '10–15 days', icon: Briefcase,
    color: '#7C3AED', bg: '#F5F3FF',
    desc: 'Startup costs, equipment, inventory, operating expenses, or expansion capital',
    requirements: ['Business plan or description', 'Business registration (if exists)', 'Government photo ID'],
    eligibility: ['US-based business', '0–5 years in operation', 'Under 50 employees'],
  },
  {
    value: 'other', label: 'Other Qualifying Need',
    range: 'Custom Amount', time: '7–14 days', icon: Building2,
    color: '#D97706', bg: '#FFFBEB',
    desc: 'For qualifying needs not covered by the specific programs listed above',
    requirements: ['Detailed written explanation', 'Supporting documentation', 'Government photo ID'],
    eligibility: ['US residents 18+', 'Legitimate documented need', 'Not covered by other programs'],
  },
]

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
]

const DOC_TYPES = [
  { key: 'photo_id',        label: 'Government-issued Photo ID',               required: true  },
  { key: 'proof_address',   label: 'Proof of Current Address',                  required: true  },
  { key: 'proof_need',      label: 'Proof of Need / Supporting Evidence',        required: true  },
  { key: 'income_verify',   label: 'Income Verification (pay stub / tax return)', required: false },
  { key: 'bank_statement',  label: 'Recent Bank Statement (last 90 days)',       required: false },
  { key: 'additional',      label: 'Additional Supporting Document',             required: false },
]

const DEFAULT_FORM = {
  grant_program: '',
  // Step 2
  requested_amount: '', purpose: '', budget_breakdown: '', timeline: '', expected_outcomes: '',
  business_name: '', business_type: '', business_age: '', business_description: '',
  business_ein: '', business_employees: '', business_annual_revenue: '',
  is_minority_owned: false, is_women_owned: false, naics_code: '',
  organization_name: '', organization_type: '', project_name: '',
  // Step 3
  full_name: '', date_of_birth: '', ssn_last4: '', citizenship: '', marital_status: '',
  phone: '', email: '', preferred_contact: '', occupation: '',
  emergency_contact_name: '', emergency_contact_phone: '',
  veteran_status: '', dependents_count: '0', disability_status: '', race_ethnicity: '',
  // Step 4
  id_type: '', id_number: '', id_expiry: '',
  address_line1: '', address_line2: '', city: '', state: '', zip_code: '',
  years_at_address: '', housing_status: '',
  // Step 5
  household_size: '', annual_income: '', other_income: '', monthly_expenses: '',
  monthly_rent_mortgage: '', total_debts: '', assets_value: '',
  employment_status: '', employer_name: '', employer_phone: '', credit_score_range: '',
  receives_public_assistance: '', assistance_type: '', previous_grants_received: '',
  bank_name: '', routing_number: '', account_number: '', account_type: '',
  // Step 7
  applicant_signature: '',
}

interface DocFile {
  id: string
  file: File
  docType: string
}

export default function ApplyOnlinePage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]             = useState({ ...DEFAULT_FORM })
  const [step, setStep]             = useState(1)
  const [errs, setErrs]             = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [appNumber, setAppNumber]   = useState('')
  const [savedAt, setSavedAt]       = useState<Date | null>(null)
  const [certified, setCertified]   = useState(false)
  const [docFiles, setDocFiles]     = useState<DocFile[]>([])

  // Load draft on mount
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY)
    if (saved) {
      try {
        const p = JSON.parse(saved)
        const { _step, ...rest } = p
        setForm(f => ({ ...f, ...rest }))
        if (_step) setStep(_step)
      } catch { /* ignore corrupt draft */ }
    } else if (profile) {
      setForm(f => ({
        ...f,
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      }))
    }
  }, [profile])

  function updateForm(patch: Partial<typeof DEFAULT_FORM>) {
    setForm(f => {
      const next = { ...f, ...patch }
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...next, _step: step }))
      setSavedAt(new Date())
      return next
    })
  }

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (step === 1) {
      if (!form.grant_program) e._program = 'Please select a grant program to continue'
    }
    if (step === 2) {
      if (!form.requested_amount || parseFloat(form.requested_amount) <= 0)
        e.requested_amount = 'Enter a valid amount greater than $0'
      if (!form.purpose || form.purpose.length < 100)
        e.purpose = `Purpose must be at least 100 characters (${form.purpose.length}/100)`
    }
    if (step === 3) {
      if (!form.full_name || form.full_name.length < 3) e.full_name = 'Enter your full legal name'
      if (!form.date_of_birth) e.date_of_birth = 'Date of birth is required'
      if (!form.ssn_last4 || !/^\d{4}$/.test(form.ssn_last4)) e.ssn_last4 = 'Enter the last 4 digits of your SSN'
      if (!form.citizenship) e.citizenship = 'Select citizenship status'
      if (!form.phone || form.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a valid 10-digit phone number'
      if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address'
    }
    if (step === 4) {
      if (!form.id_type) e.id_type = 'Select an ID type'
      if (!form.id_number) e.id_number = 'Enter your ID number'
      if (!form.id_expiry) e.id_expiry = 'Enter expiry date'
      if (!form.address_line1 || form.address_line1.length < 5) e.address_line1 = 'Enter your street address'
      if (!form.city || form.city.length < 2) e.city = 'Enter your city'
      if (!form.state) e.state = 'Select your state'
      if (!form.zip_code || form.zip_code.replace(/\D/g, '').length < 5) e.zip_code = 'Enter a valid ZIP code'
    }
    if (step === 5) {
      if (!form.household_size || parseInt(form.household_size) < 1) e.household_size = 'Enter household size (at least 1)'
      if (form.annual_income === '') e.annual_income = 'Enter annual income (enter 0 if none)'
      if (form.monthly_expenses === '') e.monthly_expenses = 'Enter monthly expenses (enter 0 if none)'
      if (form.total_debts === '') e.total_debts = 'Enter total debts (enter 0 if none)'
      if (!form.employment_status) e.employment_status = 'Select employment status'
      if (!form.bank_name || form.bank_name.length < 2) e.bank_name = 'Enter your bank name'
      if (!form.routing_number || form.routing_number.replace(/\D/g, '').length !== 9)
        e.routing_number = 'Routing number must be exactly 9 digits'
      if (!form.account_number || form.account_number.length < 4) e.account_number = 'Enter your account number'
      if (!form.account_type) e.account_type = 'Select account type'
    }
    if (step === 7) {
      if (!certified) e._cert = 'You must certify the information above to submit'
      if (!form.applicant_signature.trim() || form.applicant_signature.trim().length < 3)
        e.applicant_signature = 'Type your full legal name as your electronic signature'
    }
    setErrs(e)
    return Object.keys(e).length === 0
  }

  function advance() {
    setSubmitError('')
    if (!validate()) {
      // scroll to first error
      const el = document.querySelector('[data-error]')
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (step === 7) { submitApp(); return }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form, _step: step + 1 }))
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goBack() {
    setErrs({})
    setSubmitError('')
    setStep(s => Math.max(1, s - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addDocFile(docType: string, file: File) {
    if (file.size > 10 * 1024 * 1024) { alert('File must be under 10MB'); return }
    setDocFiles(prev => [...prev, { id: crypto.randomUUID(), file, docType }])
  }

  function removeDocFile(id: string) {
    setDocFiles(prev => prev.filter(d => d.id !== id))
  }

  async function submitApp() {
    if (!user || submitting) return
    setSubmitting(true)
    setSubmitError('')

    const num = generateAppNumber()

    const { data: appData, error: appError } = await supabase
      .from('grant_applications')
      .insert({
        app_number: num,
        user_id: user.id,
        status: 'pending',
        grant_program: form.grant_program,
        requested_amount: parseFloat(form.requested_amount) || 0,
        purpose: form.purpose,
        budget_breakdown: form.budget_breakdown || null,
        timeline: form.timeline || null,
        expected_outcomes: form.expected_outcomes || null,
        // Business
        business_name: form.business_name || null,
        business_type: form.business_type || null,
        business_age: form.business_age || null,
        business_description: form.business_description || null,
        business_ein: form.business_ein || null,
        business_employees: form.business_employees ? parseInt(form.business_employees) : null,
        business_annual_revenue: form.business_annual_revenue ? parseFloat(form.business_annual_revenue) : null,
        is_minority_owned: form.is_minority_owned || false,
        is_women_owned: form.is_women_owned || false,
        naics_code: form.naics_code || null,
        organization_name: form.organization_name || null,
        organization_type: form.organization_type || null,
        project_name: form.project_name || null,
        // Personal
        full_name: form.full_name,
        date_of_birth: form.date_of_birth || null,
        ssn_last4: form.ssn_last4 || null,
        citizenship: form.citizenship || null,
        marital_status: form.marital_status || null,
        phone: form.phone,
        email: form.email,
        preferred_contact: form.preferred_contact || null,
        occupation: form.occupation || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        veteran_status: form.veteran_status || null,
        dependents_count: parseInt(form.dependents_count) || 0,
        disability_status: form.disability_status || null,
        race_ethnicity: form.race_ethnicity || null,
        // ID & Address
        id_type: form.id_type || null,
        id_number: form.id_number || null,
        id_expiry: form.id_expiry || null,
        address_line1: form.address_line1 || null,
        address_line2: form.address_line2 || null,
        city: form.city || null,
        state: form.state || null,
        zip_code: form.zip_code || null,
        years_at_address: form.years_at_address || null,
        housing_status: form.housing_status || null,
        // Financial
        household_size: parseInt(form.household_size) || null,
        annual_income: parseFloat(form.annual_income) || 0,
        other_income: form.other_income ? parseFloat(form.other_income) : null,
        monthly_expenses: parseFloat(form.monthly_expenses) || 0,
        monthly_rent_mortgage: form.monthly_rent_mortgage ? parseFloat(form.monthly_rent_mortgage) : null,
        total_debts: parseFloat(form.total_debts) || 0,
        assets_value: form.assets_value ? parseFloat(form.assets_value) : null,
        employment_status: form.employment_status || null,
        employer_name: form.employer_name || null,
        employer_phone: form.employer_phone || null,
        credit_score_range: form.credit_score_range || null,
        receives_public_assistance: form.receives_public_assistance === 'yes',
        assistance_type: form.assistance_type || null,
        previous_grants_received: form.previous_grants_received === 'yes',
        // Bank
        bank_name: form.bank_name || null,
        routing_number: form.routing_number || null,
        account_number: form.account_number || null,
        account_type: form.account_type || null,
        // Signature
        applicant_signature: form.applicant_signature,
      })
      .select('id')
      .single()

    if (appError) {
      setSubmitError(`Submission failed: ${appError.message}. Please try again or contact support at grants@riseaxiscapital.com`)
      setSubmitting(false)
      return
    }

    const appId = appData.id

    // Upload documents (silent failure — user can upload from dashboard later)
    for (const doc of docFiles) {
      const filePath = `${appId}/${Date.now()}-${doc.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
      const { data: storageData } = await supabase.storage
        .from('grant-documents')
        .upload(filePath, doc.file, { upsert: false })

      if (storageData) {
        await supabase.from('app_documents').insert({
          application_id: appId,
          user_id: user.id,
          doc_type: doc.docType,
          file_name: doc.file.name,
          file_url: storageData.path,
          file_size: doc.file.size,
        })
      }
    }

    // Notification
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'general',
      title: 'Application Received',
      message: `Your application ${num} has been received and is under initial review. Reference: ${num}`,
    })

    localStorage.removeItem(DRAFT_KEY)
    setAppNumber(num)
    setSubmitted(true)
    setSubmitting(false)
  }

  const prog = PROGRAMS.find(p => p.value === form.grant_program)
  const pct  = step === 1 ? 0 : ((step - 1) / 6) * 100

  if (submitted) return <SuccessScreen appNumber={appNumber} navigate={navigate} prog={prog} />

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: S.green }}>
          RiseAxis Capital · FY 2025–2026
        </p>
        <h1 className="text-2xl font-bold" style={{ color: S.head }}>Grant Application</h1>
        <p className="text-sm mt-0.5" style={{ color: S.muted }}>
          Complete all 7 sections. Your progress is auto-saved.
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl p-5 mb-6" style={{ background: S.white, boxShadow: S.card }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-bold" style={{ color: S.head }}>Step {step} of 7</span>
            <span className="text-sm ml-1.5" style={{ color: S.muted }}>— {STEPS[step - 1].label}</span>
          </div>
          {savedAt && (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: S.muted }}>
              <Save className="w-3 h-3" /> Saved {savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="h-2 rounded-full mb-4" style={{ background: S.border }}>
          <motion.div className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg,#16A34A,#22C55E)' }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <div className="flex gap-1">
          {STEPS.map(s => (
            <div key={s.id} className="flex-1 text-center text-[9px] sm:text-[10px] font-bold py-1.5 rounded-lg transition-all"
              style={{
                background: s.id === step ? S.head : s.id < step ? S.greenLt : '#F8FAFC',
                color: s.id === step ? '#fff' : s.id < step ? S.green : S.muted,
                border: s.id < step ? `1px solid ${S.greenBd}` : s.id === step ? 'none' : `1px solid ${S.border}`,
              }}>
              {s.id < step ? '✓' : s.id}
              <span className="hidden sm:inline ml-1">{s.id < step ? s.short : s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Form column */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl p-6 md:p-8" style={{ background: S.white, boxShadow: S.card }}>

              {/* ── Step 1: Program ───────────────────── */}
              {step === 1 && (
                <div className="space-y-5">
                  <StepTitle title="Choose Your Grant Program" />
                  <p className="text-sm" style={{ color: S.body }}>
                    Select the program that best matches your need. Each has different eligibility requirements and funding ranges.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROGRAMS.map(p => {
                      const Icon = p.icon
                      const sel = form.grant_program === p.value
                      return (
                        <button key={p.value} type="button"
                          onClick={() => { updateForm({ grant_program: p.value }); setErrs({}) }}
                          className="text-left p-4 rounded-2xl border-2 transition-all duration-150 w-full"
                          style={{
                            background: sel ? p.bg : S.white,
                            borderColor: sel ? p.color : S.border,
                            boxShadow: sel ? `0 4px 20px ${p.color}25` : 'none',
                          }}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: p.bg }}>
                              <Icon size={18} style={{ color: p.color }} />
                            </div>
                            {sel && (
                              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: p.color }}>
                                <CheckCircle2 size={11} className="text-white" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-bold mb-0.5" style={{ color: S.head }}>{p.label}</h3>
                          <p className="text-xs leading-relaxed mb-2.5" style={{ color: S.body }}>{p.desc}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: p.bg, color: p.color }}>{p.range}</span>
                            <span className="text-[10px]" style={{ color: S.muted }}>⏱ {p.time}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {errs._program && <p className="text-sm text-center font-medium text-amber-600">{errs._program}</p>}
                </div>
              )}

              {/* ── Step 2: Grant Purpose ─────────────── */}
              {step === 2 && (
                <div className="space-y-5">
                  <StepTitle title="Grant Purpose & Details" />
                  {prog && (
                    <div className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: prog.bg, border: `1px solid ${prog.color}30` }}>
                      <prog.icon size={14} style={{ color: prog.color }} />
                      <span className="text-xs font-bold" style={{ color: prog.color }}>{prog.label}</span>
                      <span className="text-xs" style={{ color: S.body }}>· {prog.range}</span>
                      <button type="button" onClick={() => setStep(1)}
                        className="ml-auto text-[10px] font-semibold underline" style={{ color: prog.color }}>
                        Change
                      </button>
                    </div>
                  )}
                  <div>
                    <label className={lc}>Requested Amount ($) *</label>
                    {prog && <p className="text-[10px] mb-1.5" style={{ color: S.muted }}>Eligible range: {prog.range}</p>}
                    <input type="number" placeholder="0.00" className={ic}
                      value={form.requested_amount}
                      onChange={e => updateForm({ requested_amount: e.target.value })} />
                    {errs.requested_amount && <p className={ec} data-error>{errs.requested_amount}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={lc + ' mb-0'}>Purpose & Description *</label>
                      <span className={`text-[10px] font-semibold ${form.purpose.length < 100 ? 'text-red-400' : form.purpose.length < 250 ? 'text-amber-500' : 'text-green-600'}`}>
                        {form.purpose.length} chars {form.purpose.length < 100 ? `· ${100 - form.purpose.length} more needed` : form.purpose.length < 250 ? '· Add more detail' : '· Excellent!'}
                      </span>
                    </div>
                    <textarea rows={6} className={ta}
                      value={form.purpose}
                      placeholder="Describe in detail how you plan to use this funding, why it is needed, and how it will impact your situation. Be as specific as possible — detailed applications receive priority review."
                      onChange={e => updateForm({ purpose: e.target.value })} />
                    {errs.purpose && <p className={ec} data-error>{errs.purpose}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={lc}>Budget Breakdown</label>
                      <textarea rows={3} className={ta} value={form.budget_breakdown}
                        placeholder="e.g., $3,000 rent, $1,500 utilities, $500 food…"
                        onChange={e => updateForm({ budget_breakdown: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Expected Outcomes</label>
                      <textarea rows={3} className={ta} value={form.expected_outcomes}
                        placeholder="What will change after receiving this grant?"
                        onChange={e => updateForm({ expected_outcomes: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className={lc}>Timeline / Urgency</label>
                    <input type="text" className={ic} value={form.timeline}
                      placeholder="e.g., Rent due in 5 days — eviction notice received Jan 15"
                      onChange={e => updateForm({ timeline: e.target.value })} />
                  </div>

                  {/* Business-specific fields */}
                  {form.grant_program === 'business_funding' && (
                    <div className="pt-5 space-y-4" style={{ borderTop: `1px solid ${S.border}` }}>
                      <StepTitle title="Business Information" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={lc}>Legal Business Name</label>
                          <input className={ic} placeholder="As registered with state" value={form.business_name}
                            onChange={e => updateForm({ business_name: e.target.value })} />
                        </div>
                        <div>
                          <label className={lc}>Business EIN <span className="font-normal text-slate-400">(if applicable)</span></label>
                          <input className={ic} placeholder="XX-XXXXXXX" value={form.business_ein}
                            onChange={e => updateForm({ business_ein: e.target.value })} />
                        </div>
                        <div>
                          <label className={lc}>Business Type *</label>
                          <Select value={form.business_type} onValueChange={v => updateForm({ business_type: v })}>
                            <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                              {['Sole Proprietorship','LLC','S-Corporation','C-Corporation','Partnership','Nonprofit 501(c)(3)','Other'].map(t => (
                                <SelectItem key={t} value={t} className="text-slate-700 focus:bg-slate-50">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={lc}>Years in Operation</label>
                          <Select value={form.business_age} onValueChange={v => updateForm({ business_age: v })}>
                            <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                              {['Pre-revenue / Startup','Less than 1 year','1–2 years','3–5 years','5+ years'].map(t => (
                                <SelectItem key={t} value={t} className="text-slate-700 focus:bg-slate-50">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={lc}>Number of Employees</label>
                          <input type="number" min={0} className={ic} placeholder="0" value={form.business_employees}
                            onChange={e => updateForm({ business_employees: e.target.value })} />
                        </div>
                        <div>
                          <label className={lc}>Annual Revenue ($)</label>
                          <input type="number" min={0} className={ic} placeholder="0" value={form.business_annual_revenue}
                            onChange={e => updateForm({ business_annual_revenue: e.target.value })} />
                        </div>
                        <div>
                          <label className={lc}>NAICS Code <span className="font-normal text-slate-400">(if known)</span></label>
                          <input className={ic} placeholder="e.g., 541511" value={form.naics_code}
                            onChange={e => updateForm({ naics_code: e.target.value })} />
                        </div>
                        <div className="md:col-span-2">
                          <label className={lc}>Business Description *</label>
                          <textarea rows={3} className={ta} value={form.business_description}
                            placeholder="Describe your products/services, target market, and how you will use the grant."
                            onChange={e => updateForm({ business_description: e.target.value })} />
                        </div>
                        <div className="md:col-span-2 flex flex-wrap gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_minority_owned}
                              onChange={e => updateForm({ is_minority_owned: e.target.checked })}
                              className="w-4 h-4 rounded accent-green-600" />
                            <span className="text-sm" style={{ color: S.body }}>Minority-owned business</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.is_women_owned}
                              onChange={e => updateForm({ is_women_owned: e.target.checked })}
                              className="w-4 h-4 rounded accent-green-600" />
                            <span className="text-sm" style={{ color: S.body }}>Women-owned business</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Community development — org fields */}
                  {form.grant_program === 'community_development' && (
                    <div className="pt-5 space-y-4" style={{ borderTop: `1px solid ${S.border}` }}>
                      <StepTitle title="Organization & Project Information" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={lc}>Organization Name *</label>
                          <input className={ic} placeholder="Legal organization name" value={form.organization_name}
                            onChange={e => updateForm({ organization_name: e.target.value })} />
                        </div>
                        <div>
                          <label className={lc}>Organization Type *</label>
                          <Select value={form.organization_type} onValueChange={v => updateForm({ organization_type: v })}>
                            <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                              {['Nonprofit 501(c)(3)','501(c)(4) Civic Org','Religious Organization','School / Educational Inst.','Government Agency','Community Group (Unincorporated)','Other'].map(t => (
                                <SelectItem key={t} value={t} className="text-slate-700 focus:bg-slate-50">{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <label className={lc}>Project Name *</label>
                          <input className={ic} placeholder="Name of your community project" value={form.project_name}
                            onChange={e => updateForm({ project_name: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Personal Identity & Demographics ── */}
              {step === 3 && (
                <div className="space-y-5">
                  <StepTitle title="Applicant Identity" />
                  <InfoBox icon={<Lock size={13} />} color="#16A34A" bg="#F0FDF4" border="#BBF7D0">
                    All personal information is encrypted in transit and at rest using AES-256. Your SSN digits are never stored in full.
                  </InfoBox>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={lc}>Full Legal Name *</label>
                      <input className={ic} placeholder="As it appears on your government-issued ID" value={form.full_name}
                        onChange={e => updateForm({ full_name: e.target.value })} />
                      {errs.full_name && <p className={ec} data-error>{errs.full_name}</p>}
                    </div>
                    <div>
                      <label className={lc}>Date of Birth *</label>
                      <input type="date" className={ic} value={form.date_of_birth}
                        onChange={e => updateForm({ date_of_birth: e.target.value })} />
                      {errs.date_of_birth && <p className={ec} data-error>{errs.date_of_birth}</p>}
                    </div>
                    <div>
                      <label className={lc}>SSN Last 4 Digits * <span className="font-normal text-slate-400">(not stored)</span></label>
                      <div className="relative">
                        <input type="password" className={ic + ' pr-10'} placeholder="••••" maxLength={4}
                          value={form.ssn_last4}
                          onChange={e => updateForm({ ssn_last4: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                        <Lock size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: S.muted }} />
                      </div>
                      {errs.ssn_last4 && <p className={ec} data-error>{errs.ssn_last4}</p>}
                    </div>
                    <div>
                      <label className={lc}>Citizenship Status *</label>
                      <Select value={form.citizenship} onValueChange={v => updateForm({ citizenship: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {['US Citizen','Permanent Resident (Green Card)','Visa Holder','DACA Recipient','Refugee / Asylee','Other'].map(s => (
                            <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errs.citizenship && <p className={ec} data-error>{errs.citizenship}</p>}
                    </div>
                    <div>
                      <label className={lc}>Marital Status</label>
                      <Select value={form.marital_status} onValueChange={v => updateForm({ marital_status: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {['Single','Married','Domestic Partnership','Divorced','Widowed','Separated','Prefer not to say'].map(s => (
                            <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={lc}>Phone Number *</label>
                      <input type="tel" className={ic} placeholder="(555) 000-0000" value={form.phone}
                        onChange={e => updateForm({ phone: e.target.value })} />
                      {errs.phone && <p className={ec} data-error>{errs.phone}</p>}
                    </div>
                    <div>
                      <label className={lc}>Email Address *</label>
                      <input type="email" className={ic} placeholder="you@example.com" value={form.email}
                        onChange={e => updateForm({ email: e.target.value })} />
                      {errs.email && <p className={ec} data-error>{errs.email}</p>}
                    </div>
                    <div>
                      <label className={lc}>Preferred Contact Method</label>
                      <Select value={form.preferred_contact} onValueChange={v => updateForm({ preferred_contact: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {['Email','Phone Call','Text/SMS'].map(s => (
                            <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={lc}>Occupation / Job Title</label>
                      <input className={ic} placeholder="e.g., Registered Nurse, Self-Employed, Student" value={form.occupation}
                        onChange={e => updateForm({ occupation: e.target.value })} />
                    </div>
                  </div>

                  {/* SBA Demographics */}
                  <div className="pt-5 space-y-4" style={{ borderTop: `1px solid ${S.border}` }}>
                    <div className="flex items-center gap-2">
                      <StepTitle title="Demographic Information" />
                    </div>
                    <InfoBox icon={<Info size={13} />} color="#2563EB" bg="#EFF6FF" border="#BFDBFE">
                      Demographic data is collected for statistical reporting purposes only per SBA/federal grant guidelines. Responses are voluntary and have no impact on your eligibility.
                    </InfoBox>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={lc}>Veteran Status</label>
                        <Select value={form.veteran_status} onValueChange={v => updateForm({ veteran_status: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {['Not a Veteran','Veteran','Service-Disabled Veteran','Spouse of Active Duty Member','Spouse of Veteran','Prefer not to say'].map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={lc}>Number of Dependents</label>
                        <input type="number" min={0} className={ic} placeholder="0" value={form.dependents_count}
                          onChange={e => updateForm({ dependents_count: e.target.value })} />
                      </div>
                      <div>
                        <label className={lc}>Disability Status</label>
                        <Select value={form.disability_status} onValueChange={v => updateForm({ disability_status: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {['No Disability','Physical Disability','Cognitive / Intellectual Disability','Sensory Disability','Multiple Disabilities','Prefer not to say'].map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={lc}>Race / Ethnicity</label>
                        <Select value={form.race_ethnicity} onValueChange={v => updateForm({ race_ethnicity: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {['American Indian / Alaska Native','Asian','Black / African American','Hispanic / Latino','Native Hawaiian / Pacific Islander','White / Caucasian','Two or More Races','Other','Prefer not to say'].map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency contact */}
                  <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ borderTop: `1px solid ${S.border}` }}>
                    <p className="md:col-span-2 text-xs font-semibold" style={{ color: S.body }}>
                      Emergency Contact <span style={{ color: S.muted }}>(Recommended)</span>
                    </p>
                    <div>
                      <label className={lc}>Contact Name</label>
                      <input className={ic} placeholder="Full name" value={form.emergency_contact_name}
                        onChange={e => updateForm({ emergency_contact_name: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Contact Phone</label>
                      <input type="tel" className={ic} placeholder="(555) 000-0000" value={form.emergency_contact_phone}
                        onChange={e => updateForm({ emergency_contact_phone: e.target.value })} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 4: ID & Address ──────────────── */}
              {step === 4 && (
                <div className="space-y-5">
                  <StepTitle title="Government ID & Residential Address" />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={lc}>ID Type *</label>
                      <Select value={form.id_type} onValueChange={v => updateForm({ id_type: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select ID" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {["Driver's License","State ID Card","US Passport","Military ID","Permanent Resident Card","Tribal ID"].map(t => (
                            <SelectItem key={t} value={t} className="text-slate-700 focus:bg-slate-50">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errs.id_type && <p className={ec} data-error>{errs.id_type}</p>}
                    </div>
                    <div>
                      <label className={lc}>ID Number *</label>
                      <input className={ic} placeholder="Document number" value={form.id_number}
                        onChange={e => updateForm({ id_number: e.target.value })} />
                      {errs.id_number && <p className={ec} data-error>{errs.id_number}</p>}
                    </div>
                    <div>
                      <label className={lc}>Expiry Date *</label>
                      <input type="date" className={ic} value={form.id_expiry}
                        onChange={e => updateForm({ id_expiry: e.target.value })} />
                      {errs.id_expiry && <p className={ec} data-error>{errs.id_expiry}</p>}
                    </div>
                  </div>

                  <div className="pt-5 space-y-4" style={{ borderTop: `1px solid ${S.border}` }}>
                    <StepTitle title="Current Residential Address" />
                    <div>
                      <label className={lc}>Street Address *</label>
                      <input className={ic} placeholder="1234 Main Street" value={form.address_line1}
                        onChange={e => updateForm({ address_line1: e.target.value })} />
                      {errs.address_line1 && <p className={ec} data-error>{errs.address_line1}</p>}
                    </div>
                    <div>
                      <label className={lc}>Apt, Suite, Unit <span className="font-normal text-slate-400">(optional)</span></label>
                      <input className={ic} placeholder="Apt 2B" value={form.address_line2}
                        onChange={e => updateForm({ address_line2: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={lc}>City *</label>
                        <input className={ic} value={form.city}
                          onChange={e => updateForm({ city: e.target.value })} />
                        {errs.city && <p className={ec} data-error>{errs.city}</p>}
                      </div>
                      <div>
                        <label className={lc}>State *</label>
                        <Select value={form.state} onValueChange={v => updateForm({ state: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} className="max-h-60">
                            {US_STATES.map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errs.state && <p className={ec} data-error>{errs.state}</p>}
                      </div>
                      <div>
                        <label className={lc}>ZIP Code *</label>
                        <input className={ic} placeholder="90210" maxLength={10} value={form.zip_code}
                          onChange={e => updateForm({ zip_code: e.target.value })} />
                        {errs.zip_code && <p className={ec} data-error>{errs.zip_code}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={lc}>Years at Current Address</label>
                        <Select value={form.years_at_address} onValueChange={v => updateForm({ years_at_address: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {['Less than 6 months','6–12 months','1–2 years','2–5 years','5+ years'].map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className={lc}>Housing Status</label>
                        <Select value={form.housing_status} onValueChange={v => updateForm({ housing_status: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            {['Own (with mortgage)','Own (paid off)','Renting','Section 8 / Subsidized','Living with family/friends','Temporary/Transitional Housing','Experiencing Homelessness'].map(s => (
                              <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 5: Financial & Bank ──────────── */}
              {step === 5 && (
                <div className="space-y-5">
                  <StepTitle title="Financial Disclosure" />
                  <InfoBox icon={<AlertTriangle size={13} />} color="#D97706" bg="#FFFBEB" border="#FDE68A">
                    Financial information is used solely to assess grant eligibility. Providing false information is a federal offense under 18 U.S.C. § 1001.
                  </InfoBox>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={lc}>Household Size *</label>
                      <input type="number" min={1} className={ic} placeholder="Number of people in household" value={form.household_size}
                        onChange={e => updateForm({ household_size: e.target.value })} />
                      {errs.household_size && <p className={ec} data-error>{errs.household_size}</p>}
                    </div>
                    <div>
                      <label className={lc}>Employment Status *</label>
                      <Select value={form.employment_status} onValueChange={v => updateForm({ employment_status: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {['Full-time Employed','Part-time Employed','Self-Employed / Freelance','Gig Worker / Contract','Unemployed — Seeking Work','Unemployed — Not Seeking','Student','Retired','Disabled / Unable to Work','Caregiver (unpaid)'].map(s => (
                            <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errs.employment_status && <p className={ec} data-error>{errs.employment_status}</p>}
                    </div>
                    <div>
                      <label className={lc}>Employer Name <span className="font-normal text-slate-400">(if employed)</span></label>
                      <input className={ic} placeholder="Current employer" value={form.employer_name}
                        onChange={e => updateForm({ employer_name: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Employer Phone</label>
                      <input type="tel" className={ic} placeholder="(555) 000-0000" value={form.employer_phone}
                        onChange={e => updateForm({ employer_phone: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Annual Household Income ($) *</label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.annual_income}
                        onChange={e => updateForm({ annual_income: e.target.value })} />
                      {errs.annual_income && <p className={ec} data-error>{errs.annual_income}</p>}
                    </div>
                    <div>
                      <label className={lc}>Other Income Sources ($) <span className="font-normal text-slate-400">(SSI, alimony, etc.)</span></label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.other_income}
                        onChange={e => updateForm({ other_income: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Total Monthly Expenses ($) *</label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.monthly_expenses}
                        onChange={e => updateForm({ monthly_expenses: e.target.value })} />
                      {errs.monthly_expenses && <p className={ec} data-error>{errs.monthly_expenses}</p>}
                    </div>
                    <div>
                      <label className={lc}>Monthly Rent / Mortgage ($)</label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.monthly_rent_mortgage}
                        onChange={e => updateForm({ monthly_rent_mortgage: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Total Outstanding Debts ($) *</label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.total_debts}
                        onChange={e => updateForm({ total_debts: e.target.value })} />
                      {errs.total_debts && <p className={ec} data-error>{errs.total_debts}</p>}
                    </div>
                    <div>
                      <label className={lc}>Total Assets Value ($) <span className="font-normal text-slate-400">(savings, property, etc.)</span></label>
                      <input type="number" min={0} className={ic} placeholder="0" value={form.assets_value}
                        onChange={e => updateForm({ assets_value: e.target.value })} />
                    </div>
                    <div>
                      <label className={lc}>Credit Score Range</label>
                      <Select value={form.credit_score_range} onValueChange={v => updateForm({ credit_score_range: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Approximate range" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          {['300–579 (Poor)','580–669 (Fair)','670–739 (Good)','740–799 (Very Good)','800+ (Exceptional)','No Credit History','Unknown'].map(s => (
                            <SelectItem key={s} value={s} className="text-slate-700 focus:bg-slate-50">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className={lc}>Receive Public Assistance?</label>
                      <Select value={form.receives_public_assistance} onValueChange={v => updateForm({ receives_public_assistance: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          <SelectItem value="yes" className="text-slate-700 focus:bg-slate-50">Yes</SelectItem>
                          <SelectItem value="no" className="text-slate-700 focus:bg-slate-50">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {form.receives_public_assistance === 'yes' && (
                      <div>
                        <label className={lc}>Type of Assistance</label>
                        <input className={ic} placeholder="e.g., SNAP, Medicaid, TANF, SSI" value={form.assistance_type}
                          onChange={e => updateForm({ assistance_type: e.target.value })} />
                      </div>
                    )}
                    <div className={form.receives_public_assistance === 'yes' ? '' : 'md:col-span-2'}>
                      <label className={lc}>Previously Received a Grant?</label>
                      <Select value={form.previous_grants_received} onValueChange={v => updateForm({ previous_grants_received: v })}>
                        <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                          <SelectItem value="yes" className="text-slate-700 focus:bg-slate-50">Yes</SelectItem>
                          <SelectItem value="no" className="text-slate-700 focus:bg-slate-50">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bank account */}
                  <div className="pt-5 space-y-4" style={{ borderTop: `1px solid ${S.border}` }}>
                    <StepTitle title="Bank Account for Disbursement" />
                    <InfoBox icon={<Shield size={13} />} color="#16A34A" bg="#F0FDF4" border="#BBF7D0">
                      Bank details are encrypted using 256-bit SSL and used solely for grant disbursement via ACH direct deposit. No charges will be made to your account.
                    </InfoBox>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={lc}>Bank Name *</label>
                        <input className={ic} placeholder="e.g., Chase, Bank of America, Wells Fargo, Credit Union" value={form.bank_name}
                          onChange={e => updateForm({ bank_name: e.target.value })} />
                        {errs.bank_name && <p className={ec} data-error>{errs.bank_name}</p>}
                      </div>
                      <div>
                        <label className={lc}>Routing Number * <span className="font-normal text-slate-400">(9 digits)</span></label>
                        <div className="relative">
                          <input className={ic + ' pr-10'} placeholder="000000000" maxLength={9} value={form.routing_number}
                            onChange={e => updateForm({ routing_number: e.target.value.replace(/\D/g, '').slice(0, 9) })} />
                          <Lock size={11} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: S.muted }} />
                        </div>
                        {errs.routing_number && <p className={ec} data-error>{errs.routing_number}</p>}
                      </div>
                      <div>
                        <label className={lc}>Account Number *</label>
                        <div className="relative">
                          <input type="password" className={ic + ' pr-10'} placeholder="Account number" value={form.account_number}
                            onChange={e => updateForm({ account_number: e.target.value })} />
                          <Lock size={11} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: S.muted }} />
                        </div>
                        {errs.account_number && <p className={ec} data-error>{errs.account_number}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className={lc}>Account Type *</label>
                        <Select value={form.account_type} onValueChange={v => updateForm({ account_type: v })}>
                          <SelectTrigger className="h-10 rounded-xl text-sm text-slate-900 bg-[#F8FAFC] border-[#EDE9E3]">
                            <SelectValue placeholder="Select account type" />
                          </SelectTrigger>
                          <SelectContent style={{ background: '#fff', border: '1px solid #E2E8F0', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
                            <SelectItem value="checking" className="text-slate-700 focus:bg-slate-50">Checking (Recommended — fastest ACH)</SelectItem>
                            <SelectItem value="savings" className="text-slate-700 focus:bg-slate-50">Savings</SelectItem>
                            <SelectItem value="business_checking" className="text-slate-700 focus:bg-slate-50">Business Checking</SelectItem>
                          </SelectContent>
                        </Select>
                        {errs.account_type && <p className={ec} data-error>{errs.account_type}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 6: Documents ─────────────────── */}
              {step === 6 && (
                <div className="space-y-5">
                  <StepTitle title="Supporting Documents" />
                  <InfoBox icon={<Upload size={13} />} color="#2563EB" bg="#EFF6FF" border="#BFDBFE">
                    Upload documents now for faster processing, or skip and upload from your dashboard after submission. Accepted formats: PDF, JPG, PNG. Max 10MB per file.
                  </InfoBox>

                  <div className="space-y-3">
                    {DOC_TYPES.map(docType => {
                      const uploaded = docFiles.filter(d => d.docType === docType.key)
                      return (
                        <DocUploadRow
                          key={docType.key}
                          docType={docType}
                          uploaded={uploaded}
                          onAdd={(file) => addDocFile(docType.key, file)}
                          onRemove={removeDocFile}
                        />
                      )
                    })}
                  </div>

                  {docFiles.length > 0 && (
                    <div className="p-3 rounded-xl" style={{ background: S.greenLt, border: `1px solid ${S.greenBd}` }}>
                      <p className="text-xs font-semibold" style={{ color: S.green }}>
                        <CheckCircle2 className="inline w-3.5 h-3.5 mr-1" />
                        {docFiles.length} document{docFiles.length !== 1 ? 's' : ''} queued for upload
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 7: Review & Submit ───────────── */}
              {step === 7 && (
                <div className="space-y-4">
                  <StepTitle title="Review & Submit" />
                  <p className="text-sm" style={{ color: S.body }}>Review all information before submitting. Click Edit on any section to make corrections.</p>

                  {[
                    { label: 'Grant Program', goTo: 1, icon: FileText, color: '#16A34A', bg: '#F0FDF4', fields: [
                      { k: 'Program', v: prog?.label || '—' },
                      { k: 'Amount Requested', v: form.requested_amount ? `$${Number(form.requested_amount).toLocaleString()}` : '—' },
                    ]},
                    { label: 'Grant Purpose', goTo: 2, icon: FileText, color: '#2563EB', bg: '#EFF6FF', fields: [
                      { k: 'Purpose', v: form.purpose ? form.purpose.slice(0, 80) + '…' : '—' },
                      { k: 'Timeline', v: form.timeline || '—' },
                    ]},
                    { label: 'Applicant Identity', goTo: 3, icon: Users, color: '#7C3AED', bg: '#F5F3FF', fields: [
                      { k: 'Full Name', v: form.full_name || '—' },
                      { k: 'Date of Birth', v: form.date_of_birth || '—' },
                      { k: 'Citizenship', v: form.citizenship || '—' },
                      { k: 'Veteran Status', v: form.veteran_status || '—' },
                      { k: 'Phone', v: form.phone || '—' },
                      { k: 'Email', v: form.email || '—' },
                    ]},
                    { label: 'ID & Address', goTo: 4, icon: Shield, color: '#D97706', bg: '#FFFBEB', fields: [
                      { k: 'ID Type', v: form.id_type || '—' },
                      { k: 'ID Number', v: form.id_number ? '••••' + form.id_number.slice(-3) : '—' },
                      { k: 'Address', v: [form.address_line1, form.city, form.state, form.zip_code].filter(Boolean).join(', ') || '—' },
                      { k: 'Housing Status', v: form.housing_status || '—' },
                    ]},
                    { label: 'Financial & Bank', goTo: 5, icon: DollarSign, color: '#DB2777', bg: '#FDF2F8', fields: [
                      { k: 'Employment', v: form.employment_status || '—' },
                      { k: 'Annual Income', v: form.annual_income ? `$${Number(form.annual_income).toLocaleString()}` : '—' },
                      { k: 'Household Size', v: form.household_size || '—' },
                      { k: 'Bank', v: form.bank_name || '—' },
                      { k: 'Account Type', v: form.account_type || '—' },
                    ]},
                    { label: 'Documents', goTo: 6, icon: Upload, color: '#2563EB', bg: '#EFF6FF', fields: [
                      { k: 'Files Attached', v: docFiles.length > 0 ? `${docFiles.length} file${docFiles.length !== 1 ? 's' : ''} queued` : 'None — upload from dashboard' },
                    ]},
                  ].map(({ label, goTo, icon: Icon, color, bg, fields }) => (
                    <div key={label} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${S.border}` }}>
                      <div className="flex items-center justify-between px-4 py-3" style={{ background: bg }}>
                        <div className="flex items-center gap-2">
                          <Icon size={13} style={{ color }} />
                          <span className="text-xs font-bold" style={{ color }}>{label}</span>
                        </div>
                        <button type="button" onClick={() => { setErrs({}); setStep(goTo) }}
                          className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.7)', color }}>
                          <Edit3 size={9} /> Edit
                        </button>
                      </div>
                      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                        {fields.map(({ k, v }) => (
                          <div key={k}>
                            <span className="text-[10px] font-semibold" style={{ color: S.muted }}>{k}: </span>
                            <span className="text-xs" style={{ color: S.head }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* E-signature */}
                  <div className="p-5 rounded-xl space-y-4" style={{ background: '#F8FAFC', border: `1px solid ${S.border}` }}>
                    <div>
                      <p className="text-sm font-bold mb-1" style={{ color: S.head }}>Electronic Signature</p>
                      <p className="text-xs leading-relaxed" style={{ color: S.body }}>
                        By typing your full legal name below, you are signing this application electronically. Your signature constitutes a legally binding agreement.
                      </p>
                    </div>
                    <div>
                      <label className={lc}>Full Legal Name (Electronic Signature) *</label>
                      <input className={ic} placeholder="Type your full name exactly as it appears on your ID"
                        value={form.applicant_signature}
                        onChange={e => updateForm({ applicant_signature: e.target.value })} />
                      {errs.applicant_signature && <p className={ec} data-error>{errs.applicant_signature}</p>}
                    </div>
                  </div>

                  {/* Certification */}
                  <div className="p-4 rounded-xl space-y-3" style={{ background: '#F8FAFC', border: `1px solid ${S.border}` }}>
                    <p className="text-xs leading-relaxed" style={{ color: S.body }}>
                      <strong style={{ color: S.head }}>Certification:</strong> By submitting, I certify under penalty of perjury that all information provided is true, accurate, and complete to the best of my knowledge. I understand that providing false or misleading information constitutes fraud and may result in civil and criminal penalties under 18 U.S.C. § 1001.
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: S.body }}>
                      <strong style={{ color: S.head }}>Tax Notice:</strong> Grants exceeding $600 in a calendar year may be reported to the IRS via Form 1099-MISC. You may be responsible for applicable taxes on grant funds received.
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: S.body }}>
                      <strong style={{ color: S.head }}>Consent:</strong> I authorize RiseAxis Capital to verify the information provided, contact references, and share information with financial institutions as required for disbursement.
                    </p>
                    <label className="flex items-start gap-2.5 cursor-pointer" onClick={() => setCertified(c => !c)}>
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all"
                        style={{ background: certified ? S.green : 'transparent', borderColor: certified ? S.green : S.border }}>
                        {certified && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className="text-xs select-none" style={{ color: S.body }}>
                        I have read, understand, and agree to all statements above. I certify this application is complete and truthful.
                      </span>
                    </label>
                    {errs._cert && <p className="text-xs text-red-500 font-medium" data-error>{errs._cert}</p>}
                  </div>
                </div>
              )}

              {/* Submit error */}
              {submitError && (
                <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 leading-relaxed">{submitError}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6 mt-6" style={{ borderTop: `1px solid ${S.border}` }}>
                <button type="button" onClick={goBack} disabled={step === 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                  style={{ background: '#F8FAFC', border: `1px solid ${S.border}`, color: S.body }}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button type="button" onClick={advance}
                  disabled={(step === 1 && !form.grant_program) || (step === 7 && submitting)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-105 disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  ) : step === 7 ? (
                    <><CheckCircle2 className="w-4 h-4" /> Submit Application</>
                  ) : step === 6 ? (
                    <>Review & Submit <ChevronRight className="w-4 h-4" /></>
                  ) : (
                    <>Next Step <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-24">
          <ApplySidebar step={step} prog={prog} />
        </div>
      </div>
    </div>
  )
}

/* ── Document Upload Row ────────────────────────── */
function DocUploadRow({
  docType, uploaded, onAdd, onRemove,
}: {
  docType: { key: string; label: string; required: boolean }
  uploaded: { id: string; file: File }[]
  onAdd: (file: File) => void
  onRemove: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="rounded-xl p-4" style={{ background: '#F8FAFC', border: `1px solid #EDE9E3` }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{docType.label}</p>
          <p className="text-[10px] font-semibold mt-0.5" style={{ color: docType.required ? '#DC2626' : '#94A3B8' }}>
            {docType.required ? 'Required' : 'Optional'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:brightness-95"
          style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A' }}>
          <Upload size={11} /> Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) onAdd(file)
            e.target.value = ''
          }}
        />
      </div>
      {uploaded.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {uploaded.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
              <FileText size={13} style={{ color: '#16A34A', flexShrink: 0 }} />
              <span className="text-xs flex-1 truncate" style={{ color: '#0F172A' }}>{doc.file.name}</span>
              <span className="text-[10px]" style={{ color: '#94A3B8' }}>{(doc.file.size / 1024).toFixed(0)} KB</span>
              <button type="button" onClick={() => onRemove(doc.id)}
                className="text-slate-400 hover:text-red-500 transition-colors ml-1">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Sidebar ────────────────────────────────────── */
function ApplySidebar({ step, prog }: { step: number; prog: typeof PROGRAMS[0] | undefined }) {
  const tips: Record<number, { title: string; items: string[] }> = {
    1: { title: 'Choosing the Right Program', items: [
      'Select the program that most closely matches your primary need.',
      'Emergency grants have the fastest processing — typically 3–5 business days.',
      'Business funding grants have the highest ceiling at $50,000.',
      'If unsure, choose "Other" and explain your need in full detail.',
    ]},
    2: { title: 'Writing a Strong Purpose', items: [
      'Aim for 250+ characters — detailed applications receive priority review.',
      'Be specific: include dates, amounts owed, and consequences of not receiving funding.',
      'Explain the root cause and how this grant will resolve your situation.',
      'Include a clear budget breakdown to show exactly how funds will be used.',
    ]},
    3: { title: 'Identity Verification', items: [
      'Use your full legal name exactly as it appears on your government ID.',
      'All personal data is AES-256 encrypted — your SSN digits are never stored in full.',
      'Demographic data is voluntary and does not affect eligibility or outcome.',
      "Ensure your phone and email are accurate — we'll contact you at these.",
    ]},
    4: { title: 'ID & Address Tips', items: [
      "Accepted IDs: Driver's license, state ID, passport, military ID, or green card.",
      'Your ID must be currently valid (not expired) at time of application.',
      'Address must match your current residence — not a PO Box.',
      'Utility bill, lease, or bank statement accepted as proof of address.',
    ]},
    5: { title: 'Financial & Bank Tips', items: [
      'Annual income is total household income from ALL sources before taxes.',
      'A checking account is preferred for fastest ACH direct deposit.',
      'Your routing number is the 9-digit code printed at the bottom-left of your checks.',
      'We do not perform credit checks — credit range is used for program matching only.',
    ]},
    6: { title: 'Document Upload Tips', items: [
      'Upload clear, legible scans or photos in PDF, JPG, or PNG format.',
      'Files must be under 10MB each. Compress large PDFs if needed.',
      'Required documents must be uploaded before your application is reviewed.',
      'You can skip now and upload from your dashboard after submission.',
    ]},
    7: { title: 'Before You Submit', items: [
      'Review all sections carefully — editing requires re-submission if already approved.',
      'Ensure your bank account info is 100% accurate to avoid disbursement delays.',
      'Your electronic signature has the same legal weight as a handwritten signature.',
      'You will receive email + portal notification within minutes of submission.',
    ]},
  }
  const t = tips[step]

  return (
    <>
      {prog && step > 1 && (
        <div className="rounded-2xl p-5" style={{ background: S.white, boxShadow: S.card }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: prog.bg }}>
              <prog.icon size={16} style={{ color: prog.color }} />
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: prog.color }}>{prog.label}</p>
              <p className="text-[10px]" style={{ color: S.muted }}>{prog.range}</p>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: S.muted }}>Requirements</p>
            {prog.requirements.map(r => (
              <div key={r} className="flex items-start gap-1.5">
                <CheckCircle2 size={11} className="mt-0.5 shrink-0" style={{ color: prog.color }} />
                <span className="text-xs" style={{ color: S.body }}>{r}</span>
              </div>
            ))}
          </div>
          <div className="space-y-1.5 pt-3" style={{ borderTop: `1px solid ${S.border}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: S.muted }}>Eligibility</p>
            {prog.eligibility.map(e => (
              <div key={e} className="flex items-start gap-1.5">
                <Info size={10} className="mt-0.5 shrink-0" style={{ color: prog.color }} />
                <span className="text-xs" style={{ color: S.body }}>{e}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold" style={{ color: prog.color }}>
            <Clock size={11} /> Avg. processing: {prog.time}
          </div>
        </div>
      )}

      {t && (
        <div className="rounded-2xl p-5" style={{ background: S.white, boxShadow: S.card }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: S.greenLt }}>
              <Star size={13} style={{ color: S.green }} />
            </div>
            <p className="text-xs font-bold" style={{ color: S.head }}>{t.title}</p>
          </div>
          <div className="space-y-2.5">
            {t.items.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: S.greenLt }}>
                  <span className="text-[8px] font-black" style={{ color: S.green }}>{i + 1}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: S.body }}>{item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl p-4" style={{ background: '#0F172A' }}>
        <p className="text-xs font-bold text-white mb-3">Security & Privacy</p>
        {[
          { icon: <Lock size={12} />, label: '256-bit SSL encryption' },
          { icon: <Shield size={12} />, label: 'AES-256 data at rest' },
          { icon: <CheckCircle2 size={12} />, label: 'SOC 2 Type II compliant' },
          { icon: <FileText size={12} />, label: 'GDPR & CCPA ready' },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-2 py-1.5">
            <span style={{ color: '#4ADE80' }}>{icon}</span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4" style={{ background: S.white, boxShadow: S.card }}>
        <p className="text-xs font-bold mb-3" style={{ color: S.head }}>Need Help?</p>
        <a href="tel:7022747227" className="flex items-center gap-2.5 p-2.5 rounded-xl mb-2 transition-all"
          style={{ background: S.greenLt }}
          onMouseEnter={e => e.currentTarget.style.background = S.greenBd}
          onMouseLeave={e => e.currentTarget.style.background = S.greenLt}>
          <Phone size={12} style={{ color: S.green }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: S.head }}>(702) 274-7227</p>
            <p className="text-[10px]" style={{ color: S.muted }}>Mon–Fri · 9AM–6PM EST</p>
          </div>
        </a>
        <a href="mailto:grants@riseaxiscapital.com" className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all"
          style={{ background: '#EFF6FF' }}
          onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
          onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}>
          <Mail size={12} style={{ color: '#2563EB' }} />
          <div>
            <p className="text-xs font-semibold" style={{ color: S.head }}>Email Support</p>
            <p className="text-[10px]" style={{ color: S.muted }}>Response within 24 hours</p>
          </div>
        </a>
        <Link to="/apply/chat" className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: '#F8FAFC', border: `1px solid ${S.border}`, color: S.body }}>
          <MessageSquare size={11} /> Chat with AI Assistant
        </Link>
      </div>
    </>
  )
}

/* ── Success Screen ─────────────────────────────── */
function SuccessScreen({ appNumber, navigate, prog }: {
  appNumber: string
  navigate: (path: string) => void
  prog: typeof PROGRAMS[0] | undefined
}) {
  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-10 text-center mb-6"
          style={{ background: S.white, boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(22,163,74,0.12)' }} />
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: S.greenLt, border: `2px solid ${S.greenBd}` }}>
              <CheckCircle2 className="w-10 h-10" style={{ color: S.green }} />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: S.green }}>Application Submitted</p>
          <h2 className="text-2xl font-bold mb-2" style={{ color: S.head }}>You're all set!</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: S.muted }}>
            Your application has been received and assigned a reference number. Our team will begin review within 1–2 business days.
          </p>
          <div className="rounded-xl p-4 mb-6" style={{ background: S.greenLt, border: `1px solid ${S.greenBd}` }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: S.green }}>Application Reference Number</p>
            <p className="font-mono font-black text-2xl" style={{ color: S.green }}>{appNumber}</p>
            <p className="text-xs mt-1" style={{ color: '#15803D' }}>Save this number for your records</p>
          </div>
          {prog && (
            <div className="flex items-center justify-center gap-2 mb-4 p-3 rounded-xl" style={{ background: prog.bg }}>
              <prog.icon size={14} style={{ color: prog.color }} />
              <span className="text-xs font-bold" style={{ color: prog.color }}>{prog.label}</span>
              <span className="text-xs" style={{ color: S.body }}>· Estimated {prog.time}</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl p-6 mb-5" style={{ background: S.white, boxShadow: S.card }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: S.head }}>What Happens Next</h3>
          <div className="space-y-0">
            {[
              { step: '01', title: 'Initial Review', desc: 'Our team verifies your identity and document completeness.', time: '1–2 business days', color: '#2563EB', bg: '#EFF6FF' },
              { step: '02', title: 'Program Assessment', desc: 'Application is matched to the best grant program and evaluated.', time: '2–5 business days', color: '#7C3AED', bg: '#F5F3FF' },
              { step: '03', title: 'Decision & Notification', desc: 'You receive a decision via email and portal notification.', time: '1–2 business days', color: '#D97706', bg: '#FFFBEB' },
              { step: '04', title: 'Fund Disbursement', desc: 'Approved funds are transferred via ACH to your bank account.', time: '1–3 business days', color: '#16A34A', bg: '#F0FDF4' },
            ].map(({ step: s, title, desc, time, color, bg }, i, arr) => (
              <div key={s} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <span className="text-[10px] font-black" style={{ color }}>{s}</span>
                  </div>
                  {i < arr.length - 1 && <div className="w-px flex-1 my-1.5" style={{ background: S.border }} />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-bold" style={{ color: S.head }}>{title}</p>
                  <p className="text-xs leading-relaxed mb-1" style={{ color: S.body }}>{desc}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>⏱ {time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)', boxShadow: '0 4px 20px rgba(22,163,74,0.25)' }}>
            <LayoutDashboard size={15} /> My Dashboard
          </button>
          <button onClick={() => navigate('/applications')}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: S.white, border: `1px solid ${S.border}`, color: S.body, boxShadow: S.card }}>
            <FileText size={15} /> Track Application
          </button>
          <Link to="/apply/chat"
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
            style={{ background: S.white, border: `1px solid ${S.border}`, color: S.body, boxShadow: S.card }}>
            <MessageSquare size={15} /> AI Assistant
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

/* ── Helpers ────────────────────────────────────── */
function StepTitle({ title }: { title: string }) {
  return (
    <div className="pb-3 mb-1" style={{ borderBottom: `1px solid ${S.border}` }}>
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(135deg,#16A34A,#15803D)' }} />
        <h3 className="text-base font-bold" style={{ color: S.head }}>{title}</h3>
      </div>
    </div>
  )
}

function InfoBox({ icon, color, bg, border, children }: {
  icon: React.ReactNode; color: string; bg: string; border: string; children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs leading-relaxed"
      style={{ background: bg, border: `1px solid ${border}`, color }}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <span>{children}</span>
    </div>
  )
}
