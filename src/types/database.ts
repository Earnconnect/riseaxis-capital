export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          phone: string | null
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          phone?: string | null
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string
          phone?: string | null
          role?: 'admin' | 'user'
          updated_at?: string
        }
      }
      grant_applications: {
        Row: {
          id: string
          app_number: string
          user_id: string
          status: string
          grant_program: string
          requested_amount: number
          approved_amount: number | null
          purpose: string
          budget_breakdown: string | null
          timeline: string | null
          expected_outcomes: string | null
          business_name: string | null
          business_type: string | null
          business_age: string | null
          business_description: string | null
          full_name: string
          date_of_birth: string | null
          ssn_last4: string | null
          citizenship: string | null
          marital_status: string | null
          phone: string
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id_type: string | null
          id_number: string | null
          id_expiry: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          household_size: number | null
          annual_income: number | null
          monthly_expenses: number | null
          total_debts: number | null
          employment_status: string | null
          employer_name: string | null
          employer_phone: string | null
          credit_score_range: string | null
          bank_name: string | null
          routing_number: string | null
          account_number: string | null
          account_type: string | null
          rejection_reason: string | null
          reviewer_notes: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          disbursement_stage: string | null
          disbursement_tracking: string | null
          bank_reference: string | null
          disbursement_initiated_at: string | null
          disbursement_processing_at: string | null
          disbursement_sent_at: string | null
          disbursement_deposited_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['grant_applications']['Row']> & {
          app_number: string
          user_id: string
          grant_program: string
          requested_amount: number
          purpose: string
          full_name: string
          phone: string
          email: string
        }
        Update: Partial<Database['public']['Tables']['grant_applications']['Row']>
      }
      milestones: {
        Row: {
          id: string
          application_id: string
          title: string
          description: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          application_id: string
          title: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
        }
        Update: {
          title?: string
          description?: string | null
          completed?: boolean
          completed_at?: string | null
        }
      }
      proof_of_payments: {
        Row: {
          id: string
          transaction_id: string
          application_id: string
          user_id: string
          recipient_name: string
          recipient_email: string
          amount: number
          payment_method: string
          bank_name: string
          account_last4: string
          status: string
          issued_by: string
          issued_at: string
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['proof_of_payments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['proof_of_payments']['Row']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          application_id: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          application_id?: string | null
        }
        Update: {
          read?: boolean
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          approval: boolean
          rejection: boolean
          disbursement: boolean
          under_review: boolean
          documents_requested: boolean
          general: boolean
          email_notifications: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          approval?: boolean
          rejection?: boolean
          disbursement?: boolean
          under_review?: boolean
          documents_requested?: boolean
          general?: boolean
          email_notifications?: boolean
        }
        Update: Partial<Database['public']['Tables']['notification_settings']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
