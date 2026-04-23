-- =============================================
-- RiseAxis Capital — Supabase Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ========================
-- PROFILES
-- ========================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  phone text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================
-- GRANT APPLICATIONS
-- ========================
create table if not exists public.grant_applications (
  id uuid default uuid_generate_v4() primary key,
  app_number text not null unique,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'rejected', 'disbursed')),
  grant_program text not null
    check (grant_program in ('emergency_assistance', 'education_support', 'medical_expenses',
                             'community_development', 'business_funding', 'other')),

  -- Grant details
  requested_amount numeric(12, 2) not null,
  approved_amount numeric(12, 2),
  purpose text not null,
  budget_breakdown text,
  timeline text,
  expected_outcomes text,

  -- Business fields
  business_name text,
  business_type text,
  business_age text,
  business_description text,

  -- Personal info
  full_name text not null,
  date_of_birth date,
  ssn_last4 char(4),
  citizenship text,
  marital_status text,
  phone text not null,
  email text not null,
  emergency_contact_name text,
  emergency_contact_phone text,

  -- ID & Address
  id_type text,
  id_number text,
  id_expiry date,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,

  -- Financial
  household_size integer,
  annual_income numeric(12, 2),
  monthly_expenses numeric(12, 2),
  total_debts numeric(12, 2),
  employment_status text,
  employer_name text,
  employer_phone text,
  credit_score_range text,

  -- Bank
  bank_name text,
  routing_number text,
  account_number text,
  account_type text,

  -- Admin fields
  rejection_reason text,
  reviewer_notes text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,

  -- Disbursement
  disbursement_stage text check (disbursement_stage in ('initiated', 'processing', 'sent_to_bank', 'deposited')),
  disbursement_tracking text,
  bank_reference text,
  disbursement_initiated_at timestamptz,
  disbursement_processing_at timestamptz,
  disbursement_sent_at timestamptz,
  disbursement_deposited_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- MILESTONES
-- ========================
create table if not exists public.milestones (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.grant_applications(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- ========================
-- PROOF OF PAYMENTS
-- ========================
create table if not exists public.proof_of_payments (
  id uuid default uuid_generate_v4() primary key,
  transaction_id text not null unique,
  application_id uuid references public.grant_applications(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  recipient_name text not null,
  recipient_email text not null,
  amount numeric(12, 2) not null,
  payment_method text not null,
  bank_name text not null,
  account_last4 char(4) not null,
  status text not null default 'Completed',
  issued_by text not null,
  issued_at timestamptz not null,
  notes text,
  created_at timestamptz default now()
);

-- ========================
-- NOTIFICATIONS
-- ========================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in (
    'approval', 'rejection', 'disbursement', 'under_review',
    'documents_requested', 'general', 'status_update'
  )),
  title text not null,
  message text not null,
  read boolean default false,
  application_id uuid references public.grant_applications(id) on delete set null,
  created_at timestamptz default now()
);

-- ========================
-- NOTIFICATION SETTINGS
-- ========================
create table if not exists public.notification_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  approval boolean default true,
  rejection boolean default true,
  disbursement boolean default true,
  under_review boolean default true,
  documents_requested boolean default true,
  general boolean default true,
  email_notifications boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- UPDATED_AT TRIGGERS
-- ========================
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger applications_updated_at before update on public.grant_applications
  for each row execute function public.update_updated_at();

create trigger notification_settings_updated_at before update on public.notification_settings
  for each row execute function public.update_updated_at();

-- ========================
-- ROW LEVEL SECURITY (RLS)
-- ========================
alter table public.profiles enable row level security;
alter table public.grant_applications enable row level security;
alter table public.milestones enable row level security;
alter table public.proof_of_payments enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_settings enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- PROFILES policies
create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- APPLICATIONS policies
create policy "Users can view own applications" on public.grant_applications
  for select using (user_id = auth.uid());
create policy "Users can insert own applications" on public.grant_applications
  for insert with check (user_id = auth.uid());
create policy "Admins can view all applications" on public.grant_applications
  for all using (public.is_admin());

-- MILESTONES policies
create policy "Users can view milestones for own apps" on public.milestones
  for select using (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
  );
create policy "Admins can manage milestones" on public.milestones
  for all using (public.is_admin());

-- PROOF OF PAYMENTS policies
create policy "Users can view own receipts" on public.proof_of_payments
  for select using (user_id = auth.uid());
create policy "Public can verify receipts by transaction_id" on public.proof_of_payments
  for select using (true);  -- Public verification — restrict in production if needed
create policy "Admins can manage receipts" on public.proof_of_payments
  for all using (public.is_admin());

-- NOTIFICATIONS policies
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());
create policy "Users can delete own notifications" on public.notifications
  for delete using (user_id = auth.uid());
create policy "Admins can manage notifications" on public.notifications
  for all using (public.is_admin());
create policy "Service can insert notifications" on public.notifications
  for insert with check (true);  -- Allow inserts from app

-- NOTIFICATION SETTINGS policies
create policy "Users can manage own settings" on public.notification_settings
  for all using (user_id = auth.uid());

-- ========================
-- INDEXES for performance
-- ========================
create index if not exists idx_applications_user_id on public.grant_applications(user_id);
create index if not exists idx_applications_status on public.grant_applications(status);
create index if not exists idx_applications_app_number on public.grant_applications(app_number);
create index if not exists idx_notifications_user_id on public.notifications(user_id);
create index if not exists idx_notifications_read on public.notifications(read);
create index if not exists idx_payments_transaction_id on public.proof_of_payments(transaction_id);
create index if not exists idx_milestones_application_id on public.milestones(application_id);

-- ========================
-- MAKE YOURSELF ADMIN
-- Run after creating your account:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- ========================

-- =============================================
-- SCHEMA ADDITIONS v2 — SBA-standard fields
-- Run these in Supabase SQL Editor
-- =============================================

-- New columns on grant_applications
alter table public.grant_applications
  add column if not exists veteran_status text,
  add column if not exists dependents_count integer default 0,
  add column if not exists disability_status text,
  add column if not exists race_ethnicity text,
  add column if not exists years_at_address text,
  add column if not exists housing_status text,
  add column if not exists monthly_rent_mortgage numeric(12,2),
  add column if not exists other_income numeric(12,2),
  add column if not exists assets_value numeric(12,2),
  add column if not exists receives_public_assistance boolean default false,
  add column if not exists assistance_type text,
  add column if not exists previous_grants_received boolean default false,
  add column if not exists occupation text,
  add column if not exists preferred_contact text,
  add column if not exists business_ein text,
  add column if not exists business_employees integer,
  add column if not exists business_annual_revenue numeric(12,2),
  add column if not exists is_minority_owned boolean default false,
  add column if not exists is_women_owned boolean default false,
  add column if not exists naics_code text,
  add column if not exists organization_name text,
  add column if not exists organization_type text,
  add column if not exists project_name text,
  add column if not exists applicant_signature text;

-- ========================
-- APP DOCUMENTS
-- ========================
create table if not exists public.app_documents (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.grant_applications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  doc_type text not null,
  file_name text not null,
  file_url text not null,
  file_size integer,
  uploaded_at timestamptz default now()
);

alter table public.app_documents enable row level security;

create policy "Users can view own documents" on public.app_documents
  for select using (user_id = auth.uid());
create policy "Users can insert own documents" on public.app_documents
  for insert with check (user_id = auth.uid());
create policy "Admins can manage documents" on public.app_documents
  for all using (public.is_admin());

create index if not exists idx_app_documents_application_id on public.app_documents(application_id);

-- ========================
-- MESSAGES (for in-app messaging on applications)
-- ========================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.grant_applications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender_role text not null check (sender_role in ('user', 'admin')),
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

create policy "Users can view messages for own apps" on public.messages
  for select using (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
    or public.is_admin()
  );
create policy "Users can send messages for own apps" on public.messages
  for insert with check (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
    or public.is_admin()
  );
create policy "Admins can manage messages" on public.messages
  for all using (public.is_admin());

create index if not exists idx_messages_application_id on public.messages(application_id);

-- ========================
-- STORAGE BUCKET
-- Run in Supabase dashboard → Storage → New Bucket:
--   Name: grant-documents, Private (not public)
-- Or run:
--   insert into storage.buckets (id, name, public) values ('grant-documents', 'grant-documents', false);
-- Storage policy (dashboard → Storage → grant-documents → Policies → New policy):
--   Allow authenticated uploads: bucket_id = 'grant-documents' AND auth.uid() IS NOT NULL
-- ========================
