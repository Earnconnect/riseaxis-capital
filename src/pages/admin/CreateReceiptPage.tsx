import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ChevronLeft, Loader2, CreditCard } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { generateTransactionId, formatCurrency } from '@/lib/utils'
import type { GrantApplication } from '@/types'

const T = {
  card: '#FFFFFF', border: '#EDE9E3',
  heading: '#0F172A', sub: '#64748B', muted: '#94A3B8',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const schema = z.object({
  application_id: z.string().min(1, 'Select an application'),
  amount: z.number({ invalid_type_error: 'Enter amount' }).positive(),
  payment_method: z.string().min(1, 'Select payment method'),
  bank_name: z.string().min(2, 'Enter bank name'),
  account_last4: z.string().length(4, 'Enter last 4 digits'),
  notes: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const fieldClass = `w-full h-10 px-3 rounded-xl text-sm outline-none transition-all`
const fieldStyle = { background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }

export default function CreateReceiptPage() {
  const navigate = useNavigate()
  const [approvedApps, setApprovedApps] = useState<GrantApplication[]>([])
  const [selectedApp,  setSelectedApp]  = useState<GrantApplication | null>(null)
  const [submitting,   setSubmitting]   = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    supabase
      .from('grant_applications')
      .select('*')
      .in('status', ['approved','disbursed'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setApprovedApps(data as GrantApplication[]) })
  }, [])

  function onAppSelect(id: string) {
    const app = approvedApps.find(a => a.id === id)
    if (app) {
      setSelectedApp(app)
      setValue('application_id', id)
      setValue('amount', app.approved_amount || app.requested_amount)
      if (app.bank_name)      setValue('bank_name',     app.bank_name)
      if (app.account_number) setValue('account_last4', app.account_number.slice(-4))
    }
  }

  async function onSubmit(data: FormData) {
    if (!selectedApp) return
    setSubmitting(true)
    const txId = generateTransactionId()
    const { error } = await supabase.from('proof_of_payments').insert({
      transaction_id: txId,
      application_id: data.application_id,
      user_id:        selectedApp.user_id,
      recipient_name: selectedApp.full_name,
      recipient_email:selectedApp.email,
      amount:         data.amount,
      payment_method: data.payment_method,
      bank_name:      data.bank_name,
      account_last4:  data.account_last4,
      status:         'Completed',
      issued_by:      'RiseAxis Capital',
      issued_at:      new Date().toISOString(),
      notes:          data.notes,
    })
    if (!error) {
      await supabase.from('notifications').insert({
        user_id:        selectedApp.user_id,
        type:           'disbursement',
        title:          'Payment Receipt Issued',
        message:        `A payment receipt for ${formatCurrency(data.amount)} has been issued. Transaction ID: ${txId}`,
        application_id: selectedApp.id,
      })
      navigate('/admin/payments')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-[1440px] mx-auto px-5 lg:px-8 py-8">
      <div className="max-w-2xl space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/admin/payments"
            className="flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-xl transition-all hover:bg-slate-100"
            style={{ color: T.sub }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: T.heading }}>Create Payment Receipt</h1>
            <p className="text-sm mt-0.5" style={{ color: T.sub }}>Issue an official proof of payment</p>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-6"
          style={{ background: T.card, border: `1px solid ${T.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Application select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>
                Approved Application *
              </Label>
              <Select onValueChange={onAppSelect}>
                <SelectTrigger className="h-10 rounded-xl text-sm"
                  style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}>
                  <SelectValue placeholder="Select approved application" />
                </SelectTrigger>
                <SelectContent>
                  {approvedApps.map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.app_number} — {a.full_name} ({formatCurrency(a.approved_amount || a.requested_amount)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.application_id && <p className="text-xs text-red-500">{errors.application_id.message}</p>}
            </div>

            {/* Selected app preview */}
            {selectedApp && (
              <div className="p-3.5 rounded-xl"
                style={{ background: T.greenLt, border: `1px solid ${T.greenBd}` }}>
                <div className="text-sm font-semibold" style={{ color: T.heading }}>{selectedApp.full_name}</div>
                <div className="text-xs mt-0.5" style={{ color: T.sub }}>{selectedApp.email}</div>
                <div className="font-mono text-[10px] mt-1" style={{ color: T.muted }}>{selectedApp.app_number}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>Amount ($) *</Label>
                <input type="number" step="0.01" className={fieldClass} style={fieldStyle}
                  {...register('amount', { valueAsNumber: true })} />
                {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>Payment Method *</Label>
                <Select onValueChange={v => setValue('payment_method', v)}>
                  <SelectTrigger className="h-10 rounded-xl text-sm"
                    style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {['ACH Transfer','Wire Transfer','Direct Deposit','Check','Zelle'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.payment_method && <p className="text-xs text-red-500">{errors.payment_method.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>Bank Name *</Label>
                <input className={fieldClass} style={fieldStyle} placeholder="e.g. Chase"
                  {...register('bank_name')} />
                {errors.bank_name && <p className="text-xs text-red-500">{errors.bank_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>Account Last 4 *</Label>
                <input className={fieldClass} style={fieldStyle} placeholder="XXXX" maxLength={4}
                  {...register('account_last4')} />
                {errors.account_last4 && <p className="text-xs text-red-500">{errors.account_last4.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: T.muted }}>Notes</Label>
              <textarea rows={3} className="w-full text-sm rounded-xl p-3 resize-none outline-none transition-all"
                style={{ background: '#F8FAFC', border: `1px solid ${T.border}`, color: T.heading }}
                placeholder="Optional notes about this payment…"
                {...register('notes')} />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:brightness-105"
              style={{ background: 'linear-gradient(135deg, #16A34A, #15803D)', boxShadow: '0 4px 16px rgba(22,163,74,0.25)' }}>
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Receipt…</>
                : <><CreditCard className="w-4 h-4" /> Issue Payment Receipt</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
