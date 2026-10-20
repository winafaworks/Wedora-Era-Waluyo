-- ==============================================================================
-- Migrasi: Penambahan Kolom Sesuai Lembar Jadwal Rias & Dekorasi Fisik Era Waluyo
-- ==============================================================================

alter table public.bookings
  add column if not exists jam_akad text,
  add column if not exists jam_adat text,
  add column if not exists jam_resepsi text,
  add column if not exists lokasi_makeup text,
  add column if not exists items_mua jsonb default '[]'::jsonb,
  add column if not exists items_dekorasi jsonb default '[]'::jsonb,
  add column if not exists items_adat jsonb default '[]'::jsonb,
  add column if not exists total_biaya numeric default 0,
  add column if not exists sisa_pembayaran numeric default 0;
