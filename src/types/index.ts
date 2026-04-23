export type UserRole = 'admin' | 'user'

export type ApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'disbursed'

export type GrantProgram =
  | 'emergency_assistance'
  | 'education_support'
  | 'medical_expenses'
  | 'community_development'
  | 'business_funding'
  | 'other'

export type DisbursementStage =
  | 'initiated'
  | 'processing'
  | 'sent_to_bank'
  | 'deposited'

export type NotificationType =
  | 'approval'
  | 'rejection'
  | 'disbursement'
  | 'under_review'
  | 'documents_requested'
  | 'general'
  | 'status_update'

export interface Profile {
  id: string
  email: string
  full_name: string
  phone?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface GrantApplication {
  id: string
  app_number: string
  user_id: string
  status: ApplicationStatus
  grant_program: GrantProgram

  // Grant details
  requested_amount: number
  approved_amount?: number
  purpose: string
  budget_breakdown?: string
  timeline?: string
  expected_outcomes?: string

  // Business fields (if business_funding)
  business_name?: string
  business_type?: string
  business_age?: string
  business_description?: string
  business_ein?: string
  business_employees?: number
  business_annual_revenue?: number
  is_minority_owned?: boolean
  is_women_owned?: boolean
  naics_code?: string
  organization_name?: string
  organization_type?: string
  project_name?: string

  // Personal info
  full_name: string
  date_of_birth?: string
  ssn_last4?: string
  citizenship?: string
  marital_status?: string
  phone: string
  email: string
  preferred_contact?: string
  occupation?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  // SBA demographics
  veteran_status?: string
  dependents_count?: number
  disability_status?: string
  race_ethnicity?: string

  // ID & Address
  id_type?: string
  id_number?: string
  id_expiry?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  years_at_address?: string
  housing_status?: string

  // Financial
  household_size?: number
  annual_income?: number
  other_income?: number
  monthly_expenses?: number
  monthly_rent_mortgage?: number
  total_debts?: number
  assets_value?: number
  employment_status?: string
  employer_name?: string
  employer_phone?: string
  credit_score_range?: string
  receives_public_assistance?: boolean
  assistance_type?: string
  previous_grants_received?: boolean
  applicant_signature?: string

  // Bank
  bank_name?: string
  routing_number?: string
  account_number?: string
  account_type?: string

  // Admin fields
  rejection_reason?: string
  reviewer_notes?: string
  reviewed_by?: string
  reviewed_at?: string

  // Disbursement
  disbursement_stage?: DisbursementStage
  disbursement_tracking?: string
  bank_reference?: string
  disbursement_initiated_at?: string
  disbursement_processing_at?: string
  disbursement_sent_at?: string
  disbursement_deposited_at?: string

  created_at: string
  updated_at: string
}

export interface AppDocument {
  id: string
  application_id: string
  user_id: string
  doc_type: string
  file_name: string
  file_url: string
  file_size?: number
  uploaded_at: string
}

export interface Milestone {
  id: string
  application_id: string
  title: string
  description?: string
  completed: boolean
  completed_at?: string
  created_at: string
}

export interface ProofOfPayment {
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
  notes?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  application_id?: string
  created_at: string
}

export interface NotificationSettings {
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

export interface ApplicationDraft {
  _step?: number
  grant_program?: string
  requested_amount?: string
  purpose?: string
  budget_breakdown?: string
  timeline?: string
  expected_outcomes?: string
  business_name?: string
  business_type?: string
  business_age?: string
  business_description?: string
  business_ein?: string
  business_employees?: string
  business_annual_revenue?: string
  is_minority_owned?: boolean
  is_women_owned?: boolean
  naics_code?: string
  organization_name?: string
  organization_type?: string
  project_name?: string
  full_name?: string
  date_of_birth?: string
  ssn_last4?: string
  citizenship?: string
  marital_status?: string
  phone?: string
  email?: string
  preferred_contact?: string
  occupation?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  veteran_status?: string
  dependents_count?: string
  disability_status?: string
  race_ethnicity?: string
  id_type?: string
  id_number?: string
  id_expiry?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  zip_code?: string
  years_at_address?: string
  housing_status?: string
  household_size?: string
  annual_income?: string
  other_income?: string
  monthly_expenses?: string
  monthly_rent_mortgage?: string
  total_debts?: string
  assets_value?: string
  employment_status?: string
  employer_name?: string
  employer_phone?: string
  credit_score_range?: string
  receives_public_assistance?: string
  assistance_type?: string
  previous_grants_received?: string
  bank_name?: string
  routing_number?: string
  account_number?: string
  account_type?: string
  applicant_signature?: string
}
