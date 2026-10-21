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
        nama: "PAKET SIRAMAN",
        deskripsi: "Paket prosesi siraman adat pengantin tradisional Era Waluyo.",
        harga_dasar: 5000000,
      },
      {
        nama: "PAKET MUA",
        deskripsi: "Paket tata rias pengantin lengkap (MUA) eksklusif Era Waluyo.",
        harga_dasar: 12500000,
      },
      {
        nama: "PAKET PREMIUM RUMAH 1",
        deskripsi: "Paket pernikahan rumah premium 1: tata rias pengantin, busana akad & resepsi, dekorasi pelaminan rumah.",
        harga_dasar: 15000000,
      },
      {
        nama: "PAKET PREMIUM RUMAH 2",
        deskripsi: "Paket pernikahan rumah premium 2: tata rias lengkap, busana pengantin & orang tua, dekorasi pelaminan mewah.",
        harga_dasar: 20000000,
      },
      {
        nama: "PAKET PREMIUM GEDUNG 1",
        deskripsi: "Paket pernikahan gedung premium 1: rias & busana pengantin adat/modern, dekorasi pelaminan gedung elegan.",
        harga_dasar: 27500000,
      },
      {
        nama: "PAKET PREMIUM GEDUNG 2",
        deskripsi: "Paket pernikahan gedung premium 2: rias pengantin eksklusif, busana lengkap resepsi & akad, dekorasi megah, MC & dokumentasi lengkap.",
        harga_dasar: 36000000,
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

// 10. Aksi Pencarian Nama Pengantin & Acara untuk Topbar
export async function searchBookingsAndChecklists(query: string) {
  if (!query || query.trim().length === 0) return [];
  const supabase = createAdminClient();
  const q = query.trim();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      nama_pelanggan,
      tanggal_acara,
      lokasi,
      status,
      packages (
        nama
      )
    `)
    .or(`nama_pelanggan.ilike.%${q}%,lokasi.ilike.%${q}%`)
    .order("tanggal_acara", { ascending: false })
    .limit(8);

  if (error || !data) {
    return [];
  }

  return data;
}

export interface AdminNotification {
  id: string;
  booking_id: string;
  type: "dikonfirmasi" | "perlu_koreksi";
  title: string;
  description: string;
  time: string;
  raw_date: string;
  nama_pelanggan: string;
  tanggal_acara: string;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

// 11. Ambil Notifikasi: Konfirmasi & Koreksi Pelanggan
export async function getAdminNotifications(): Promise<AdminNotification[]> {
  const supabase = createAdminClient();
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      nama_pelanggan,
      tanggal_acara,
      status,
      dikonfirmasi_pada,
      updated_at,
      customer_notes (
        id,
        isi,
        dibuat_pada
      )
    `)
    .in("status", ["dikonfirmasi", "perlu_koreksi"])
    .order("updated_at", { ascending: false })
    .limit(15);

  if (error || !bookings) {
    return [];
  }

  return bookings.map((b) => {
    const isConfirmed = b.status === "dikonfirmasi";
    const dateStr = b.dikonfirmasi_pada || b.updated_at || new Date().toISOString();

    let noteText = "";
    if (!isConfirmed && b.customer_notes && b.customer_notes.length > 0) {
      const notes = [...b.customer_notes].sort((x, y) => {
        const timeY = y.dibuat_pada ? new Date(y.dibuat_pada).getTime() : 0;
        const timeX = x.dibuat_pada ? new Date(x.dibuat_pada).getTime() : 0;
        return timeY - timeX;
      });
      noteText = ` "${notes[0].isi}"`;
    }

    return {
      id: `${b.id}-${b.status}-${dateStr}`,
      booking_id: b.id,
      type: b.status as "dikonfirmasi" | "perlu_koreksi",
      title: isConfirmed
        ? "Pesanan Dikonfirmasi"
        : "Permintaan Koreksi Pelanggan",
      description: isConfirmed
        ? `${b.nama_pelanggan} telah menyetujui rincian acara pernikahan.`
        : `${b.nama_pelanggan} mengirim catatan koreksi:${noteText}`,
      time: formatRelativeTime(dateStr),
      raw_date: dateStr,
      nama_pelanggan: b.nama_pelanggan,
      tanggal_acara: b.tanggal_acara,
    };
  });
}

