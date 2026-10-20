"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getRekapData() {
  const supabase = createAdminClient();

  // 1. Ambil data booking lengkap dengan relasi paket
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(`
      *,
      packages (
        id,
        nama,
        harga_dasar
      )
    `)
    .order("tanggal_acara", { ascending: true });

  if (bookingsError) {
    console.error("Gagal mengambil data rekap booking:", bookingsError);
  }

  // 2. Ambil master data paket acara
  const { data: packages, error: packagesError } = await supabase
    .from("packages")
    .select("*")
    .order("harga_dasar", { ascending: true });

  if (packagesError) {
    console.error("Gagal mengambil master data paket:", packagesError);
  }

  return {
    bookings: bookings || [],
    packages: packages || [],
  };
}
