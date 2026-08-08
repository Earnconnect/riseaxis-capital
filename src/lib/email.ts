import { supabase } from './supabase'

// Event types the email endpoint knows how to render. Kept independent of
// the notifications.type enum so an event can have its own subject/template.
export type EmailEvent =
  | 'submitted'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'documents_requested'
  | 'additional_documents'
  | 'documents_confirmed'
  | 'disbursement_initiated'
  | 'disbursement_processing'
  | 'disbursement_sent'
  | 'disbursement_split'
  | 'disbursed'
  | 'message'
  | 'withdrawal_approved'
  | 'withdrawal_rejected'
  | 'withdrawal_completed'
  | 'custom'
  | 'support_reply'

interface EmailArgs {
  userId: string          // recipient (the notification's target user)
  event: EmailEvent
  title?: string          // reuses the in-app notification title
  message?: string        // reuses the in-app notification message
  applicationId?: string
  subject?: string        // overrides the email subject line (custom emails)
}

// Fire a transactional email via the /api/send-email serverless function.
// Best-effort: emails must never block or break the UI action that
// triggered them, so all failures are swallowed. The server derives the
// recipient address from userId under RLS — we never send an address here.
export async function sendEmailNotification(args: EmailArgs): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(args),
    })
  } catch {
    // ignore — the in-app notification is still the source of truth
  }
}
