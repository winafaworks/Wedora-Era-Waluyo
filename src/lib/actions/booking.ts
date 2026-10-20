"use server";

import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { bookingSchema, BookingInput } from "@/lib/validations/booking";

// 1. Ambil atau inisialisasi paket acara
export async function getPackages() {
  const supabase = createAdminClient();
  const { data: packages, error } = await supabase
    .from("packages")
    .select("*")
    .order("harga_dasar", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data paket:", error);
    return [];
  }

  // Jika tabel paket masih kosong, inisialisasi paket bawaan Era Waluyo
  if (!packages || packages.length === 0) {
    const defaultPackages = [
      {
        nama: "Paket Basic Melati",
        deskripsi: "Busana akad nikah pengantin, rias tradisional MUA, dan bunga melati segar.",
        harga_dasar: 4500000,
      },
      {
        nama: "Paket Premium Gold Era Waluyo",
        deskripsi: "Busana akad & resepsi, dekorasi pelaminan 8 meter, MC, MUA, dan dokumentasi foto.",
        harga_dasar: 12500000,
      },
      {
        nama: "Paket Royal Adat Jawa Lengkap",
        deskripsi: "Busana Solo/Yogya Basahan beludru, dekorasi gebyok ukir klasik, tata rias paes, MC, foto & video cinematic.",
        harga_dasar: 18000000,
      },
    ];

    const { data: inserted } = await supabase
      .from("packages")
      .insert(defaultPackages)
      .select();

    return inserted || [];
  }

  return packages;
}

// 2. Ambil seluruh data booking untuk admin
export async function getBookings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
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

  if (error) {
    console.error("Gagal mengambil data booking:", error);
    return [];
  }

  return data;
}

// 3. Ambil statistik ringkasan dashboard
export async function getDashboardStats() {
  const supabase = createAdminClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id, tanggal_acara, status");

  if (error || !bookings) {
    return {
      totalBooking: 0,
      acaraBulanIni: 0,
      belumDikonfirmasi: 0,
      acaraMendatang: 0,
    };
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let acaraBulanIni = 0;
  let belumDikonfirmasi = 0;
  let acaraMendatang = 0;

  bookings.forEach((b) => {
    const eventDate = new Date(b.tanggal_acara);
    if (
      eventDate.getMonth() === currentMonth &&
      eventDate.getFullYear() === currentYear
    ) {
      acaraBulanIni++;
    }

    if (b.status === "belum_dikonfirmasi") {
      belumDikonfirmasi++;
    }

    if (eventDate >= now) {
      acaraMendatang++;
    }
  });

  return {
    totalBooking: bookings.length,
    acaraBulanIni,
    belumDikonfirmasi,
    acaraMendatang,
  };
}

// 4. Ambil satu booking berdasarkan ID
export async function getBookingById(id: string) {
  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      packages (*),
      customer_notes (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return booking;
}

// 5. Tambah Booking Baru (Create)
export async function createBooking(input: BookingInput) {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data input tidak valid",
    };
  }

  const tokenKonfirmasi = crypto.randomBytes(24).toString("hex");
  const supabase = createAdminClient();

  const totalBiaya = parsed.data.totalBiaya || 0;
  const nominalDp = parsed.data.nominalDp || 0;
  const sisaPembayaran = totalBiaya > 0 ? Math.max(0, totalBiaya - nominalDp) : 0;

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      nama_pelanggan: parsed.data.namaPelanggan,
      no_wa: parsed.data.noWa,
      tanggal_acara: parsed.data.tanggalAcara,
      lokasi: parsed.data.lokasi,
      jam_akad: parsed.data.jamAkad || null,
      jam_adat: parsed.data.jamAdat || null,
      jam_resepsi: parsed.data.jamResepsi || null,
      lokasi_makeup: parsed.data.lokasiMakeup || null,
      package_id: parsed.data.packageId || null,
      kebaya_baju: parsed.data.kebayaBaju || null,
      ukuran: parsed.data.ukuran || null,
      dekorasi: parsed.data.dekorasi || null,
      mc: parsed.data.mc || null,
      makeup: parsed.data.makeup || null,
      fotografer: parsed.data.fotografer || null,
      video: parsed.data.video || null,
      hiburan: parsed.data.hiburan || null,
      catatan_khusus: parsed.data.catatanKhusus || null,
      items_mua: parsed.data.itemsMua || [],
      items_dekorasi: parsed.data.itemsDekorasi || [],
      items_adat: parsed.data.itemsAdat || [],
      total_biaya: totalBiaya,
      dp_nominal: nominalDp,
      sisa_pembayaran: sisaPembayaran,
      dp_diterima: parsed.data.dpDiterima,
      status: "belum_dikonfirmasi",
      token_konfirmasi: tokenKonfirmasi,
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal menyimpan booking:", error);
    return { success: false, error: "Gagal menyimpan pesanan ke database: " + error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/booking");
  return { success: true, booking: data };
}

// 6. Ubah Booking (Update)
export async function updateBooking(id: string, input: BookingInput) {
  const parsed = bookingSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Data input tidak valid",
    };
  }

  const totalBiaya = parsed.data.totalBiaya || 0;
  const nominalDp = parsed.data.nominalDp || 0;
  const sisaPembayaran = totalBiaya > 0 ? Math.max(0, totalBiaya - nominalDp) : 0;

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({
      nama_pelanggan: parsed.data.namaPelanggan,
      no_wa: parsed.data.noWa,
      tanggal_acara: parsed.data.tanggalAcara,
      lokasi: parsed.data.lokasi,
      jam_akad: parsed.data.jamAkad || null,
      jam_adat: parsed.data.jamAdat || null,
      jam_resepsi: parsed.data.jamResepsi || null,
      lokasi_makeup: parsed.data.lokasiMakeup || null,
      package_id: parsed.data.packageId || null,
      kebaya_baju: parsed.data.kebayaBaju || null,
      ukuran: parsed.data.ukuran || null,
      dekorasi: parsed.data.dekorasi || null,
      mc: parsed.data.mc || null,
      makeup: parsed.data.makeup || null,
      fotografer: parsed.data.fotografer || null,
      video: parsed.data.video || null,
      hiburan: parsed.data.hiburan || null,
      catatan_khusus: parsed.data.catatanKhusus || null,
      items_mua: parsed.data.itemsMua || [],
      items_dekorasi: parsed.data.itemsDekorasi || [],
      items_adat: parsed.data.itemsAdat || [],
      total_biaya: totalBiaya,
      dp_nominal: nominalDp,
      sisa_pembayaran: sisaPembayaran,
      dp_diterima: parsed.data.dpDiterima,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/booking");
  revalidatePath(`/booking/${id}`);
  return { success: true };
}

// 7. Hapus Booking (Delete)
export async function deleteBooking(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("bookings").delete().eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/booking");
  return { success: true };
}

// 8. Ambil booking berdasarkan token konfirmasi pelanggan
export async function getBookingByToken(token: string) {
  const supabase = createAdminClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select(`
      *,
      packages (*)
    `)
    .eq("token_konfirmasi", token)
    .single();

  if (error) {
    return null;
  }

  return booking;
}

// 9. Aksi Konfirmasi Pelanggan
export async function confirmBookingByCustomer(
  token: string,
  koreksi?: string
) {
  const supabase = createAdminClient();
  const { data: booking, error: findError } = await supabase
    .from("bookings")
    .select("id")
    .eq("token_konfirmasi", token)
    .single();

  if (findError || !booking) {
    return { success: false, error: "Pesanan tidak ditemukan atau tautan sudah kedaluwarsa." };
  }

  const now = new Date().toISOString();
  const newStatus = koreksi && koreksi.trim().length > 0 ? "perlu_koreksi" : "dikonfirmasi";

  // Catat koreksi jika ada
  if (koreksi && koreksi.trim().length > 0) {
    await supabase.from("customer_notes").insert({
      booking_id: booking.id,
      isi: koreksi.trim(),
    });
  }

  // Update status booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: newStatus,
      dikonfirmasi_pada: now,
      updated_at: now,
    })
    .eq("id", booking.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/booking");
  revalidatePath(`/booking/${booking.id}`);
  return { success: true, status: newStatus };
}
