-- ==============================================================================
-- WEDORA — Migrasi Skema Awal Basis Data
-- Sesuai prd.md (Bagian 7: Model Data) dan agent.md (Bagian 8: Database & RLS)
-- ==============================================================================

-- 1. TABEL PAKET ACARA
create table if not exists public.packages (
    id uuid primary key default gen_random_uuid(),
    nama text not null,
    deskripsi text,
    harga_dasar numeric default 0,
    aktif boolean default true,
    dibuat_pada timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. TABEL BOOKING / PESANAN
create table if not exists public.bookings (
    id uuid primary key default gen_random_uuid(),
    nama_pelanggan text not null,
    no_wa text not null,
    tanggal_acara date not null,
    lokasi text not null,
    package_id uuid references public.packages(id) on delete set null,
    kebaya_baju text,
    ukuran text,
    dekorasi text,
    mc text,
    makeup text,
    fotografer text,
    video text,
    hiburan text,
    catatan_khusus text,
    dp_nominal numeric default 0,
    dp_diterima boolean default true,
    status text default 'belum_dikonfirmasi' check (status in ('belum_dikonfirmasi', 'dikonfirmasi', 'perlu_koreksi', 'dibatalkan')),
    token_konfirmasi text not null unique,
    dikonfirmasi_pada timestamptz,
    dibuat_oleh uuid references auth.users(id) on delete set null,
    dibuat_pada timestamptz default now(),
    updated_at timestamptz default now()
);

-- Indeks performa pencarian booking
create index if not exists idx_bookings_tanggal_acara on public.bookings (tanggal_acara);
create index if not exists idx_bookings_status on public.bookings (status);
create index if not exists idx_bookings_token_konfirmasi on public.bookings (token_konfirmasi);

-- 3. TABEL KATALOG ITEM (BUSANA, DEKORASI, LAYANAN)
create table if not exists public.catalog_items (
    id uuid primary key default gen_random_uuid(),
    jenis text not null check (jenis in ('busana', 'dekorasi', 'layanan')),
    nama text not null,
    ukuran text,
    deskripsi text,
    aktif boolean default true,
    dibuat_pada timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_catalog_items_jenis on public.catalog_items (jenis);

-- 4. TABEL FOTO KATALOG
create table if not exists public.catalog_photos (
    id uuid primary key default gen_random_uuid(),
    item_id uuid not null references public.catalog_items(id) on delete cascade,
    url text not null,
    urutan integer default 1,
    dibuat_pada timestamptz default now()
);

create index if not exists idx_catalog_photos_item on public.catalog_photos (item_id);

-- 5. TABEL RELASI ITEM KE BOOKING
create table if not exists public.booking_items (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    catalog_item_id uuid not null references public.catalog_items(id) on delete restrict,
    dibuat_pada timestamptz default now()
);

create index if not exists idx_booking_items_booking on public.booking_items (booking_id);

-- 6. TABEL TEMPLATE CHECKLIST PER PAKET
create table if not exists public.checklist_templates (
    id uuid primary key default gen_random_uuid(),
    package_id uuid not null references public.packages(id) on delete cascade,
    nama_barang text not null,
    dibuat_pada timestamptz default now()
);

-- 7. TABEL CHECKLIST ACARA
create table if not exists public.checklist_items (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    nama_barang text not null,
    dimuat boolean default false,
    dimuat_pada timestamptz,
    kembali boolean default false,
    kembali_pada timestamptz,
    dibuat_pada timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_checklist_items_booking on public.checklist_items (booking_id);

-- 8. TABEL CATATAN & KOREKSI PELANGGAN
create table if not exists public.customer_notes (
    id uuid primary key default gen_random_uuid(),
    booking_id uuid not null references public.bookings(id) on delete cascade,
    isi text not null,
    dibuat_pada timestamptz default now()
);

create index if not exists idx_customer_notes_booking on public.customer_notes (booking_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) - WAJIB DI SETIAP TABEL
-- ==============================================================================

alter table public.packages enable row level security;
alter table public.bookings enable row level security;
alter table public.catalog_items enable row level security;
alter table public.catalog_photos enable row level security;
alter table public.booking_items enable row level security;
alter table public.checklist_templates enable row level security;
alter table public.checklist_items enable row level security;
alter table public.customer_notes enable row level security;

-- Kebijakan untuk pengguna terautentikasi (Admin Era Waluyo)
create policy "Admin memiliki akses penuh ke packages"
    on public.packages for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke bookings"
    on public.bookings for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke catalog_items"
    on public.catalog_items for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke catalog_photos"
    on public.catalog_photos for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke booking_items"
    on public.booking_items for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke checklist_templates"
    on public.checklist_templates for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke checklist_items"
    on public.checklist_items for all
    to authenticated
    using (true)
    with check (true);

create policy "Admin memiliki akses penuh ke customer_notes"
    on public.customer_notes for all
    to authenticated
    using (true)
    with check (true);

-- ==============================================================================
-- STORAGE BUCKET: catalog-photos
-- ==============================================================================

insert into storage.buckets (id, name, public)
values ('catalog-photos', 'catalog-photos', true)
on conflict (id) do nothing;

create policy "Foto katalog dapat diakses publik"
    on storage.objects for select
    using (bucket_id = 'catalog-photos');

create policy "Admin dapat mengunggah foto katalog"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'catalog-photos');

create policy "Admin dapat memperbarui foto katalog"
    on storage.objects for update
    to authenticated
    using (bucket_id = 'catalog-photos');

create policy "Admin dapat menghapus foto katalog"
    on storage.objects for delete
    to authenticated
    using (bucket_id = 'catalog-photos');
