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

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

drop trigger if exists applications_updated_at on public.grant_applications;
create trigger applications_updated_at before update on public.grant_applications
  for each row execute function public.update_updated_at();

drop trigger if exists notification_settings_updated_at on public.notification_settings;
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
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (id = auth.uid());
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (id = auth.uid());
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- APPLICATIONS policies
drop policy if exists "Users can view own applications" on public.grant_applications;
create policy "Users can view own applications" on public.grant_applications
  for select using (user_id = auth.uid());
drop policy if exists "Users can insert own applications" on public.grant_applications;
create policy "Users can insert own applications" on public.grant_applications
  for insert with check (user_id = auth.uid());
drop policy if exists "Admins can view all applications" on public.grant_applications;
create policy "Admins can view all applications" on public.grant_applications
  for all using (public.is_admin());

-- MILESTONES policies
drop policy if exists "Users can view milestones for own apps" on public.milestones;
create policy "Users can view milestones for own apps" on public.milestones
  for select using (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
  );
drop policy if exists "Admins can manage milestones" on public.milestones;
create policy "Admins can manage milestones" on public.milestones
  for all using (public.is_admin());

-- PROOF OF PAYMENTS policies
drop policy if exists "Users can view own receipts" on public.proof_of_payments;
create policy "Users can view own receipts" on public.proof_of_payments
  for select using (user_id = auth.uid());
drop policy if exists "Public can verify receipts by transaction_id" on public.proof_of_payments;
create policy "Public can verify receipts by transaction_id" on public.proof_of_payments
  for select using (true);  -- Public verification — restrict in production if needed
drop policy if exists "Admins can manage receipts" on public.proof_of_payments;
create policy "Admins can manage receipts" on public.proof_of_payments
  for all using (public.is_admin());

-- NOTIFICATIONS policies
drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());
drop policy if exists "Users can delete own notifications" on public.notifications;
create policy "Users can delete own notifications" on public.notifications
  for delete using (user_id = auth.uid());
drop policy if exists "Admins can manage notifications" on public.notifications;
create policy "Admins can manage notifications" on public.notifications
  for all using (public.is_admin());
drop policy if exists "Service can insert notifications" on public.notifications;
create policy "Service can insert notifications" on public.notifications
  for insert with check (true);  -- Allow inserts from app

-- NOTIFICATION SETTINGS policies
drop policy if exists "Users can manage own settings" on public.notification_settings;
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

drop policy if exists "Users can view own documents" on public.app_documents;
create policy "Users can view own documents" on public.app_documents
  for select using (user_id = auth.uid());
drop policy if exists "Users can insert own documents" on public.app_documents;
create policy "Users can insert own documents" on public.app_documents
  for insert with check (user_id = auth.uid());
drop policy if exists "Admins can manage documents" on public.app_documents;
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

drop policy if exists "Users can view messages for own apps" on public.messages;
create policy "Users can view messages for own apps" on public.messages
  for select using (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "Users can send messages for own apps" on public.messages;
create policy "Users can send messages for own apps" on public.messages
  for insert with check (
    exists (select 1 from public.grant_applications where id = application_id and user_id = auth.uid())
    or public.is_admin()
  );
drop policy if exists "Admins can manage messages" on public.messages;
create policy "Admins can manage messages" on public.messages
  for all using (public.is_admin());

create index if not exists idx_messages_application_id on public.messages(application_id);

-- =============================================
-- SCHEMA ADDITIONS v3 — wallet, support, announcements
-- These tables are queried by the app but were missing from v1/v2.
-- This section is re-runnable (drop policy if exists before each create).
-- =============================================

-- ========================
-- APP_DOCUMENTS reconciliation
-- Two pages write this table with different column names:
--   ApplyOnlinePage.tsx        -> file_name, file_url
--   ApplicationDetailPage.tsx  -> name, file_path, status
-- Readers use both spellings. Support both, and keep the pairs mirrored
-- so a row written by either page reads correctly from the other.
-- ========================
alter table public.app_documents
  add column if not exists name text,
  add column if not exists file_path text,
  add column if not exists status text default 'uploaded'
    check (status in ('uploaded', 'verified', 'rejected'));

-- The original NOT NULLs block ApplicationDetailPage inserts, which never
-- supply file_name/file_url. The mirror trigger below fills them in.
alter table public.app_documents alter column file_name drop not null;
alter table public.app_documents alter column file_url  drop not null;

create or replace function public.sync_app_document_columns()
returns trigger language plpgsql as $$
begin
  new.name      := coalesce(new.name,      new.file_name);
  new.file_name := coalesce(new.file_name, new.name);
  new.file_path := coalesce(new.file_path, new.file_url);
  new.file_url  := coalesce(new.file_url,  new.file_path);
  new.status    := coalesce(new.status, 'uploaded');
  return new;
end;
$$;

drop trigger if exists app_documents_sync on public.app_documents;
create trigger app_documents_sync
  before insert or update on public.app_documents
  for each row execute function public.sync_app_document_columns();

-- ========================
-- WALLETS
-- ========================
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  balance numeric(12, 2) not null default 0,
  total_received numeric(12, 2) not null default 0,
  total_withdrawn numeric(12, 2) not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- WALLET TRANSACTIONS
-- ========================
create table if not exists public.wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  wallet_id uuid references public.wallets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('credit', 'withdrawal')),
  amount numeric(12, 2) not null,
  description text not null,
  status text not null default 'pending'
    check (status in ('completed', 'pending', 'approved', 'rejected')),

  -- Withdrawal payout details
  method text check (method in ('ach', 'debit_card')),
  bank_name text,
  routing_number text,
  account_number_last4 char(4),
  account_type text check (account_type in ('checking', 'savings')),
  card_last4 char(4),
  card_holder_name text,

  application_id uuid references public.grant_applications(id) on delete set null,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- SUPPORT TICKETS
-- ========================
create table if not exists public.support_tickets (
  id uuid default uuid_generate_v4() primary key,
  ticket_number text not null unique,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_name text,
  user_email text,
  subject text not null,
  category text not null,
  message text not null,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'resolved', 'closed')),
  admin_response text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ========================
-- ANNOUNCEMENTS (site-wide banner)
-- ========================
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  message text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success')),
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- updated_at triggers for the new tables
drop trigger if exists wallets_updated_at on public.wallets;
create trigger wallets_updated_at before update on public.wallets
  for each row execute function public.update_updated_at();

drop trigger if exists wallet_transactions_updated_at on public.wallet_transactions;
create trigger wallet_transactions_updated_at before update on public.wallet_transactions
  for each row execute function public.update_updated_at();

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at before update on public.support_tickets
  for each row execute function public.update_updated_at();

-- ========================
-- RLS for the new tables
-- ========================
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.announcements enable row level security;

-- WALLETS
drop policy if exists "Users can view own wallet" on public.wallets;
create policy "Users can view own wallet" on public.wallets
  for select using (user_id = auth.uid());
-- WalletPage.tsx debits the balance client-side when a withdrawal is requested
drop policy if exists "Users can update own wallet" on public.wallets;
create policy "Users can update own wallet" on public.wallets
  for update using (user_id = auth.uid());
drop policy if exists "Admins can manage wallets" on public.wallets;
create policy "Admins can manage wallets" on public.wallets
  for all using (public.is_admin());

-- WALLET TRANSACTIONS
drop policy if exists "Users can view own transactions" on public.wallet_transactions;
create policy "Users can view own transactions" on public.wallet_transactions
  for select using (user_id = auth.uid());
drop policy if exists "Users can create own transactions" on public.wallet_transactions;
create policy "Users can create own transactions" on public.wallet_transactions
  for insert with check (user_id = auth.uid());
drop policy if exists "Admins can manage transactions" on public.wallet_transactions;
create policy "Admins can manage transactions" on public.wallet_transactions
  for all using (public.is_admin());

-- SUPPORT TICKETS
drop policy if exists "Users can view own tickets" on public.support_tickets;
create policy "Users can view own tickets" on public.support_tickets
  for select using (user_id = auth.uid());
drop policy if exists "Users can create own tickets" on public.support_tickets;
create policy "Users can create own tickets" on public.support_tickets
  for insert with check (user_id = auth.uid());
drop policy if exists "Admins can manage tickets" on public.support_tickets;
create policy "Admins can manage tickets" on public.support_tickets
  for all using (public.is_admin());

-- ANNOUNCEMENTS — readable by anyone (banner shows pre-login), admin-managed
drop policy if exists "Anyone can read announcements" on public.announcements;
create policy "Anyone can read announcements" on public.announcements
  for select using (true);
drop policy if exists "Admins can manage announcements" on public.announcements;
create policy "Admins can manage announcements" on public.announcements
  for all using (public.is_admin());

-- Indexes
create index if not exists idx_wallets_user_id on public.wallets(user_id);
create index if not exists idx_wallet_txns_user_id on public.wallet_transactions(user_id);
create index if not exists idx_wallet_txns_type_status on public.wallet_transactions(type, status);
create index if not exists idx_support_tickets_user_id on public.support_tickets(user_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_announcements_active on public.announcements(active);

-- ========================
-- STORAGE BUCKET — grant-documents
-- ========================
insert into storage.buckets (id, name, public)
values ('grant-documents', 'grant-documents', false)
on conflict (id) do nothing;

-- The app uploads under two different path conventions:
--   ApplicationDetailPage.tsx -> <user_id>/<application_id>/<file>
--   ApplyOnlinePage.tsx       -> <application_id>/<file>
-- A user owns an object if the first folder is their uid, or is an
-- application belonging to them. Admins can reach everything.
create or replace function public.owns_storage_path(path text)
returns boolean language sql security definer stable as $$
  select
    (storage.foldername(path))[1] = auth.uid()::text
    or exists (
      select 1 from public.grant_applications
      where id::text = (storage.foldername(path))[1]
        and user_id = auth.uid()
    );
$$;

drop policy if exists "Users can upload own documents" on storage.objects;
create policy "Users can upload own documents" on storage.objects
  for insert with check (
    bucket_id = 'grant-documents'
    and auth.uid() is not null
    and (public.owns_storage_path(name) or public.is_admin())
  );

drop policy if exists "Users can read own documents" on storage.objects;
create policy "Users can read own documents" on storage.objects
  for select using (
    bucket_id = 'grant-documents'
    and (public.owns_storage_path(name) or public.is_admin())
  );

drop policy if exists "Users can delete own documents" on storage.objects;
create policy "Users can delete own documents" on storage.objects
  for delete using (
    bucket_id = 'grant-documents'
    and (public.owns_storage_path(name) or public.is_admin())
  );

-- =============================================
-- SCHEMA ADDITIONS v4 — public (no-login) application view
-- Emails link to /view/<token>. A per-application secret token lets the
-- applicant open a STATUS view without signing in. Sensitive fields
-- (SSN, bank, ID, detailed financials) are never exposed here — a link
-- can be forwarded, so only status-level data is returned.
-- =============================================

-- Secret, unguessable per-application token. Adding the column with a
-- volatile default backfills a distinct token for every existing row.
alter table public.grant_applications
  add column if not exists public_token uuid not null default uuid_generate_v4();

create unique index if not exists idx_applications_public_token
  on public.grant_applications(public_token);

-- SECURITY DEFINER so it can read past RLS, but it only ever returns the
-- safe columns below, and only for an exact token match. Executable by
-- anonymous visitors (the whole point is no login).
-- NOTE: v5 below redefines this with more columns. Drop first so a
-- re-run (where the v5 shape already exists) can't fail with
-- "cannot change return type of existing function".
drop function if exists public.get_application_public(uuid);
create or replace function public.get_application_public(p_token uuid)
returns table (
  app_number text,
  full_name text,
  status text,
  grant_program text,
  requested_amount numeric,
  approved_amount numeric,
  purpose text,
  created_at timestamptz,
  reviewed_at timestamptz,
  disbursement_stage text,
  disbursement_initiated_at timestamptz,
  disbursement_processing_at timestamptz,
  disbursement_sent_at timestamptz,
  disbursement_deposited_at timestamptz,
  rejection_reason text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    app_number, full_name, status, grant_program, requested_amount, approved_amount,
    purpose, created_at, reviewed_at, disbursement_stage,
    disbursement_initiated_at, disbursement_processing_at,
    disbursement_sent_at, disbursement_deposited_at, rejection_reason
  from public.grant_applications
  where public_token = p_token
$$;

revoke all on function public.get_application_public(uuid) from public;
grant execute on function public.get_application_public(uuid) to anon, authenticated;

-- =============================================
-- SCHEMA ADDITIONS v5 — admin requests for additional documents
-- Admin can ask an applicant for more/updated documents to finalize
-- disbursement, with an admin-set deadline. The applicant is notified
-- in-app and by email, and can see a live countdown.
-- =============================================

create table if not exists public.document_requests (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.grant_applications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  requested_docs text[] not null,          -- names of the documents needed
  note text,                               -- optional instructions from admin
  deadline timestamptz,                    -- admin-set due date/time
  status text not null default 'pending'
    check (status in ('pending', 'fulfilled', 'expired')),
  created_at timestamptz default now()
);

alter table public.document_requests enable row level security;

drop policy if exists "Users can view own document requests" on public.document_requests;
create policy "Users can view own document requests" on public.document_requests
  for select using (user_id = auth.uid());
drop policy if exists "Admins can manage document requests" on public.document_requests;
create policy "Admins can manage document requests" on public.document_requests
  for all using (public.is_admin());

create index if not exists idx_document_requests_application_id on public.document_requests(application_id);
create index if not exists idx_document_requests_status on public.document_requests(status);

-- Extend the public (no-login) view to surface the newest pending
-- document request + its deadline. Return type changes, so drop first.
drop function if exists public.get_application_public(uuid);
create or replace function public.get_application_public(p_token uuid)
returns table (
  app_number text,
  full_name text,
  status text,
  grant_program text,
  requested_amount numeric,
  approved_amount numeric,
  purpose text,
  created_at timestamptz,
  reviewed_at timestamptz,
  disbursement_stage text,
  disbursement_initiated_at timestamptz,
  disbursement_processing_at timestamptz,
  disbursement_sent_at timestamptz,
  disbursement_deposited_at timestamptz,
  rejection_reason text,
  requested_docs text[],
  docs_note text,
  docs_deadline timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    ga.app_number, ga.full_name, ga.status, ga.grant_program, ga.requested_amount, ga.approved_amount,
    ga.purpose, ga.created_at, ga.reviewed_at, ga.disbursement_stage,
    ga.disbursement_initiated_at, ga.disbursement_processing_at,
    ga.disbursement_sent_at, ga.disbursement_deposited_at, ga.rejection_reason,
    dr.requested_docs, dr.note, dr.deadline
  from public.grant_applications ga
  left join lateral (
    select requested_docs, note, deadline
    from public.document_requests
    where application_id = ga.id and status = 'pending'
    order by created_at desc
    limit 1
  ) dr on true
  where ga.public_token = p_token
$$;

revoke all on function public.get_application_public(uuid) from public;
grant execute on function public.get_application_public(uuid) to anon, authenticated;

-- =============================================
-- SCHEMA ADDITIONS v6 — split disbursement (installments)
-- A large grant can be released in several smaller deposits to stay
-- within a receiving bank's per-deposit limit. Each installment is its
-- own row; the applicant is told the schedule up front.
-- =============================================

create table if not exists public.disbursement_installments (
  id uuid default uuid_generate_v4() primary key,
  application_id uuid references public.grant_applications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  installment_number int not null,
  total_installments int not null,
  amount numeric(12, 2) not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'deposited')),
  scheduled_for date,
  deposited_at timestamptz,
  created_at timestamptz default now()
);

alter table public.disbursement_installments enable row level security;

drop policy if exists "Users can view own installments" on public.disbursement_installments;
create policy "Users can view own installments" on public.disbursement_installments
  for select using (user_id = auth.uid());
drop policy if exists "Admins can manage installments" on public.disbursement_installments;
create policy "Admins can manage installments" on public.disbursement_installments
  for all using (public.is_admin());

create index if not exists idx_installments_application_id on public.disbursement_installments(application_id);

-- =============================================
-- SCHEMA ADDITIONS v7 — live chat support
-- Applicants chat with admins in real time. One conversation per
-- applicant, keyed by user_id. Realtime is enabled so both sides see
-- new messages instantly.
-- =============================================

create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,  -- conversation owner (the applicant)
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role text not null check (sender_role in ('user', 'admin')),
  content text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.chat_messages enable row level security;

drop policy if exists "View own or admin chat" on public.chat_messages;
create policy "View own or admin chat" on public.chat_messages
  for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "Insert into own or admin chat" on public.chat_messages;
create policy "Insert into own or admin chat" on public.chat_messages
  for insert with check (
    (user_id = auth.uid() and sender_role = 'user') or public.is_admin()
  );
drop policy if exists "Admins manage chat" on public.chat_messages;
create policy "Admins manage chat" on public.chat_messages
  for all using (public.is_admin());

create index if not exists idx_chat_messages_user_id on public.chat_messages(user_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages(created_at);

-- Enable Supabase Realtime for this table (idempotent).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;
end $$;

-- ========================
-- MAKE YOURSELF ADMIN — run after creating your account:
--   update public.profiles set role = 'admin' where email = 'your@email.com';
-- ========================
