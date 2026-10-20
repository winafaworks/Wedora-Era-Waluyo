"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ChecklistItemData {
  id: string;
  booking_id: string;
  nama_barang: string;
  dimuat: boolean;
  dimuat_pada: string | null;
  kembali: boolean;
  kembali_pada: string | null;
  dibuat_pada: string | null;
  updated_at: string | null;
}

export interface ChecklistBookingOption {
  id: string;
  nama_pelanggan: string;
  tanggal_acara: string;
  lokasi: string;
  status: string | null;
  packages: {
    id: string;
    nama: string;
  } | null;
}

// Default template per paket jika tabel checklist_templates belum terisi
const DEFAULT_PACKAGE_TEMPLATES: Record<string, string[]> = {
  default: [
    "Busana Pengantin Utama (Kebaya & Beskap / Jas)",
    "Kain Jarik Sogan Tradisional (2 Pasang)",
    "Alas Kaki / Selop Pengantin (Pria & Wanita)",
    "Aksesoris Paes, Cunduk Mentul, & Perhiasan",
    "Set Bunga Melati Segar (Ronce Melati Tibo Dodo)",
    "Kotak Makeup & Alat Rias Lengkap MUA",
    "Busana Orang Tua (2 Kebaya Ibu & 2 Beskap Bapak)",
    "Dekorasi Pelaminan & Mini Garden",
    "Set Kursi Pengantin & Orang Tua",
    "Kotak Angpau dengan Gembok & Kunci",
    "Microphone Wireless & Peralatan Audio",
    "Kamera Dokumentasi Foto, Baterai, & Tripod",
  ],
  melati: [
    "Kebaya Akad Pengantin Wanita & Kain Jarik",
    "Beskap Akad Pengantin Pria & Kain Jarik",
    "Set Ronce Bunga Melati Segar",
    "Aksesoris Paes & Bros Pengantin",
    "Selop Pengantin Pria & Wanita",
    "Kotak Rias & Makeup Kit MUA Era Waluyo",
    "Busana Orang Tua Pengantin (Ibu & Bapak)",
    "Cermin Portable & Lampu Ring Light",
  ],
  gold: [
    "Busana Akad Nikah (Kebaya & Beskap)",
    "Busana Resepsi Modern (Gaun & Setelan Jas)",
    "Set Busana Orang Tua (2 Pasang Lengkap)",
    "Set Rias & Paes Lengkap Melati Segar",
    "Gebyok Dekorasi Pelaminan 8 Meter",
    "Set Kursi Pelaminan (5 Kursi)",
    "Mini Garden Pelaminan & Karpet Permadani",
    "Standing Flowers Jalan & Kotak Angpau (2 Unit)",
    "Perlengkapan MC & 2 Mic Wireless",
    "Kamera DSLR/Mirrorless, Lensa, Flash, & Baterai",
    "Bunga Tangan Pengantin (Hand Bouquet Segar)",
  ],
  royal: [
    "Busana Solo/Yogya Basahan Beludru Hitam Emas",
    "Kuluk Pengantin Pria & Keris Pusaka Warangka",
    "Cunduk Mentul (9 Biji), Centung, & Bros Anting",
    "Ronce Melati Tibo Dodo & Kalung Ronce Melati",
    "Kain Dodot Kampuh Basahan & Kemben Beludru",
    "Set Beskap Landung Bapak & Kebaya Kartini Ibu (4 Set)",
    "Set Busana Among Tamu / Pagar Ayu & Bagus (4 Pasang)",
    "Gebyok Ukir Kayu Jati Klasik 10 Meter + Taman",
    "Set Kursi Pengantin Klasik Ukir Gold",
    "Janur Kuning Umbul-Umbul (2 Batang) & Gapura",
    "Meja & Kursi Akad Nikah + Bantalan Duduk",
    "Kotak Cincin & Nampan Mahar Akrilik",
    "Kotak Angpau Kayu Ukir Gembok (2 Unit)",
    "Sound System Panggung, 4 Wireless Mic, & Monitor",
    "Kamera Foto & Cinema Video (2 Unit + Stabilizer Tripod)",
    "Lighting Panggung (Par LED & Moving Head)",
  ],
};

function getTemplateKey(packageName?: string): string {
  if (!packageName) return "default";
  const name = packageName.toLowerCase();
  if (name.includes("royal") || name.includes("jawa")) return "royal";
  if (name.includes("gold") || name.includes("premium")) return "gold";
  if (name.includes("melati") || name.includes("basic")) return "melati";
  return "default";
}

// 1. Ambil daftar booking untuk selector checklist
export async function getChecklistBookings(): Promise<ChecklistBookingOption[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id,
      nama_pelanggan,
      tanggal_acara,
      lokasi,
      status,
      packages (
        id,
        nama
      )
    `)
    .order("tanggal_acara", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data booking untuk checklist:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]) || [];
}

// 2. Ambil seluruh item checklist untuk booking tertentu (auto-generate jika belum ada)
export async function getChecklistItems(bookingId: string): Promise<ChecklistItemData[]> {
  const supabase = createAdminClient();

  // Ambil item yang sudah ada
  const { data: existingItems, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("booking_id", bookingId)
    .order("dibuat_pada", { ascending: true });

  if (error) {
    console.error("Gagal mengambil checklist items:", error);
    return [];
  }

  if (existingItems && existingItems.length > 0) {
    return existingItems.map((item) => ({
      ...item,
      dimuat: !!item.dimuat,
      kembali: !!item.kembali,
    }));
  }

  // Jika belum ada item, generate dari template paket acara
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      id,
      package_id,
      packages (
        id,
        nama
      )
    `)
    .eq("id", bookingId)
    .single();

  let templateItems: string[] = [];

  // Periksa apakah sudah ada template di database
  if (booking?.package_id) {
    const { data: dbTemplates } = await supabase
      .from("checklist_templates")
      .select("nama_barang")
      .eq("package_id", booking.package_id);

    if (dbTemplates && dbTemplates.length > 0) {
      templateItems = dbTemplates.map((t) => t.nama_barang);
    }
  }

  // Jika di database belum ada, ambil template default Era Waluyo
  if (templateItems.length === 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pkgName = (booking?.packages as any)?.nama;
    const key = getTemplateKey(pkgName);
    templateItems = DEFAULT_PACKAGE_TEMPLATES[key] || DEFAULT_PACKAGE_TEMPLATES.default;

    // Simpan juga ke checklist_templates jika package_id ada agar tersimpan permanen
    if (booking?.package_id) {
      const templatesToInsert = templateItems.map((nama) => ({
        package_id: booking.package_id as string,
        nama_barang: nama,
      }));
      await supabase.from("checklist_templates").insert(templatesToInsert);
    }
  }

  // Insert ke checklist_items untuk booking ini
  const itemsToInsert = templateItems.map((nama) => ({
    booking_id: bookingId,
    nama_barang: nama,
    dimuat: false,
    kembali: false,
  }));

  const { data: insertedItems } = await supabase
    .from("checklist_items")
    .insert(itemsToInsert)
    .select();

  return (insertedItems || []).map((item) => ({
    ...item,
    dimuat: !!item.dimuat,
    kembali: !!item.kembali,
  }));
}

// 3. Update status Dimuat (beserta timestamp)
export async function toggleItemDimuat(itemId: string, dimuat: boolean) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("checklist_items")
    .update({
      dimuat: dimuat,
      dimuat_pada: dimuat ? now : null,
      updated_at: now,
    })
    .eq("id", itemId);

  if (error) {
    console.error("Gagal update status dimuat:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}

// 4. Update status Kembali (beserta timestamp)
export async function toggleItemKembali(itemId: string, kembali: boolean) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("checklist_items")
    .update({
      kembali: kembali,
      kembali_pada: kembali ? now : null,
      updated_at: now,
    })
    .eq("id", itemId);

  if (error) {
    console.error("Gagal update status kembali:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}

// 5. Tambah barang kustom ke checklist acara
export async function addChecklistItem(bookingId: string, namaBarang: string) {
  if (!namaBarang || namaBarang.trim().length < 2) {
    return { success: false, error: "Nama barang minimal 2 karakter." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .insert({
      booking_id: bookingId,
      nama_barang: namaBarang.trim(),
      dimuat: false,
      kembali: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal menambahkan barang checklist:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true, item: data };
}

// 6. Hapus barang dari checklist acara
export async function deleteChecklistItem(itemId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    console.error("Gagal menghapus barang checklist:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}

// 7. Tandai semua dimuat / kembali sekaligus (bulk action)
import { Database } from "@/types/database";

type ChecklistItemUpdate = Database["public"]["Tables"]["checklist_items"]["Update"];

export async function bulkUpdateChecklist(
  bookingId: string,
  mode: "dimuat_all" | "kembali_all" | "reset_all"
) {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  let updatePayload: ChecklistItemUpdate = {};

  if (mode === "dimuat_all") {
    updatePayload = {
      dimuat: true,
      dimuat_pada: now,
      updated_at: now,
    };
  } else if (mode === "kembali_all") {
    updatePayload = {
      kembali: true,
      kembali_pada: now,
      updated_at: now,
    };
  } else if (mode === "reset_all") {
    updatePayload = {
      dimuat: false,
      dimuat_pada: null,
      kembali: false,
      kembali_pada: null,
      updated_at: now,
    };
  }

  const { error } = await supabase
    .from("checklist_items")
    .update(updatePayload)
    .eq("booking_id", bookingId);

  if (error) {
    console.error("Gagal melakukan aksi massal checklist:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}
