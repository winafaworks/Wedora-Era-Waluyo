-- Migration: Create Activity Logs table for WEDORA Era Waluyo
-- Catatan: Digunakan untuk menyimpan rekam jejak audit:
-- 1. Aktivitas Login (LOGIN_SUCCESS, LOGIN_FAILED, LOGOUT)
-- 2. Penambahan Data Booking (BOOKING_CREATED)
-- 3. Edit / Pembaruan Data Booking (BOOKING_UPDATED, BOOKING_DELETED)

create table if not exists public.activity_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  event text not null,
  actor text not null,
  description text not null,
  status text not null default 'info', -- 'success' | 'warning' | 'danger' | 'info'
  ip text,
  device text,
  details jsonb
);

-- Index untuk performa query pencarian dan sorting
create index if not exists idx_activity_logs_timestamp on public.activity_logs (timestamp desc);
create index if not exists idx_activity_logs_event on public.activity_logs (event);
create index if not exists idx_activity_logs_actor on public.activity_logs (actor);

-- Enable RLS
alter table public.activity_logs enable row level security;

-- Policy RLS: Hanya user yang sudah terotentikasi (Admin) yang dapat membaca dan menambah log
create policy "Authenticated users can read activity logs"
  on public.activity_logs
  for select
  to authenticated
  using (true);

create policy "Authenticated users can insert activity logs"
  on public.activity_logs
  for insert
  to authenticated
  with check (true);
