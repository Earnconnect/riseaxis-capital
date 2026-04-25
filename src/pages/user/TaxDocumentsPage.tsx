import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Download, Info, DollarSign, Calendar,
  CheckCircle2, AlertTriangle, Loader2, Shield,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { GrantApplication } from '@/types'

const T = {
  bg: '#FAF8F5', white: '#FFFFFF', navy: '#0F172A',
  body: '#475569', muted: '#94A3B8', border: '#EDE9E3',
  green: '#16A34A', greenLt: '#F0FDF4', greenBd: '#BBF7D0',
}

const PROGRAM_LABELS: Record<string, string> = {
  emergency_assistance:  'Emergency Assistance',
  education_support:     'Education Support',
  medical_expenses:      'Medical Expenses',
  community_development: 'Community Development',
  business_funding:      'Business Funding',
  other:                 'Other',
}

export default function TaxDocumentsPage() {
  const { user, profile } = useAuth()
  const [apps, setApps]       = useState<GrantApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('grant_applications')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['approved', 'disbursed'])
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApps((data as GrantApplication[]) ?? []); setLoading(false) })
  }, [user])

  const taxableApps = apps.filter(a => (a.approved_amount ?? a.requested_amount) >= 600)
  const totalReceived = apps.reduce((sum, a) => sum + (a.approved_amount ?? 0), 0)

  function generateCSV(app: GrantApplication) {
    const amount = app.approved_amount ?? app.requested_amount
    const year   = new Date(app.updated_at).getFullYear()
    const rows = [
      ['Form 1099-MISC Tax Summary'],
      ['Prepared by', 'RiseAxis Capital Funding Program'],
      ['EIN', '27-0964813'],
      ['Tax Year', String(year)],
      [''],
      ['Recipient Name',      app.full_name],
      ['Recipient Address',   [app.address_line1, app.city, app.state, app.zip_code].filter(Boolean).join(', ')],
      ['Application Number',  app.app_number],
      ['Grant Program',       PROGRAM_LABELS[app.grant_program] ?? app.grant_program],
      ['Amount (Box 3)',       `$${amount.toLocaleString()}`],
      ['Taxable',             amount >= 600 ? 'Yes (reported to IRS)' : 'No (under $600 threshold)'],
      [''],
      ['This document is for informational purposes. Consult a tax professional for advice.'],
    ]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `1099-MISC_${app.app_number}_${year}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: T.bg }}>
      <Loader2 size={24} className="animate-spin" style={{ color: T.green }} />
    </div>
  )

  return (
    <div className="px-5 lg:px-8 py-8 max-w-[1440px]" style={{ background: T.bg, minHeight: '100vh' }}>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: T.navy }}>Tax Documents</h1>
        <p className="text-sm" style={{ color: T.muted }}>1099-MISC summaries for grants over $600</p>
      </motion.div>

      {/* IRS notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
        className="rounded-2xl p-4 mb-6 flex items-start gap-3"
        style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <AlertTriangle size={16} className="shrink-0 mt-0.5" style={{ color: '#D97706' }} />
        <div className="text-sm" style={{ color: '#92400E' }}>
          <span className="font-semibold">IRS Reporting:</span> Grants of $600 or more are reported to the IRS on Form 1099-MISC under Box 3 (Other Income).
          RiseAxis Capital's EIN is <span className="font-mono font-semibold">27-0964813</span>. Please consult a tax professional for guidance on reporting.
        </div>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Received',    value: `$${totalReceived.toLocaleString()}`,    icon: DollarSign, color: T.green },
          { label: 'Reportable Grants', value: taxableApps.length,                       icon: FileText,   color: '#DC2626' },
          { label: 'Total Grants',      value: apps.length,                              icon: CheckCircle2, color: '#2563EB' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-4 flex items-center gap-3" style={{ background: T.white, border: `1px solid ${T.border}` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-lg font-bold" style={{ color: T.navy }}>{s.value}</div>
              <div className="text-xs" style={{ color: T.muted }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Documents list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <h2 className="font-bold text-sm" style={{ color: T.navy }}>Grant Records</h2>
        </div>

        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText size={40} style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>No approved grants yet</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: T.border }}>
            {apps.map(app => {
              const amount  = app.approved_amount ?? app.requested_amount
              const taxable = amount >= 600
              const year    = new Date(app.updated_at).getFullYear()
              return (
                <div key={app.id} className="px-5 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: taxable ? '#FEF2F2' : T.greenLt, border: `1px solid ${taxable ? '#FECACA' : T.greenBd}` }}>
                    <FileText size={16} style={{ color: taxable ? '#DC2626' : T.green }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold" style={{ color: T.navy }}>
                        {taxable ? `Form 1099-MISC · ${year}` : `Grant Record · ${year}`}
                      </span>
                      <span className="text-[10px] font-mono" style={{ color: T.muted }}>#{app.app_number}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-xs" style={{ color: T.muted }}>
                      <span>{PROGRAM_LABELS[app.grant_program] ?? app.grant_program}</span>
                      <span className="font-semibold" style={{ color: T.navy }}>${amount.toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${taxable ? '' : ''}`}
                        style={{ background: taxable ? '#FEF2F2' : T.greenLt, color: taxable ? '#DC2626' : T.green }}>
                        {taxable ? 'IRS Reportable' : 'Under $600 threshold'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: T.muted }}>
                      <Calendar size={11} />
                      {new Date(app.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <button
                      onClick={() => generateCSV(app)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-105 text-white ml-2"
                      style={{ background: `linear-gradient(135deg, ${T.green}, #15803D)` }}>
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mt-6 rounded-2xl p-5 flex items-start gap-3" style={{ background: T.white, border: `1px solid ${T.border}` }}>
        <Shield size={16} className="shrink-0 mt-0.5" style={{ color: T.muted }} />
        <div className="text-xs leading-relaxed" style={{ color: T.muted }}>
          <span className="font-semibold" style={{ color: T.body }}>Disclaimer:</span> This document center provides summary information only.
          Official IRS Form 1099-MISC statements are mailed to your address on file by January 31st of each year for grants received in the prior tax year.
          For questions about your tax obligations, consult a qualified tax professional or CPA. RiseAxis Capital is not a tax advisor.
        </div>
      </div>
    </div>
  )
}
