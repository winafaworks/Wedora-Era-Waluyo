"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeText } from "@/lib/security/sanitize";
import { logSecurityEvent } from "@/lib/security/audit-logger";

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
  no_wa?: string;
  tanggal_acara: string;
  lokasi: string;
  status: string | null;
  package_id?: string | null;
  packages: {
    id: string;
    nama: string;
  } | null;
}

export interface ChecklistTemplateItem {
  id: string;
  package_id: string;
  nama_barang: string;
  dibuat_pada: string | null;
}

export interface ChecklistPackageInfo {
  id: string;
  nama: string;
  deskripsi: string | null;
  harga_dasar: number;
  templates: ChecklistTemplateItem[];
}

// Default template per paket jika tabel checklist_templates belum terisi
// Mencakup SELURUH item resmi sesuai brosur Era Waluyo: Make Up, Busana, Dekorasi, Layanan & MC, Siraman, dll.
const DEFAULT_PACKAGE_TEMPLATES: Record<string, string[]> = {
  gedung2: [
    // Make Up & Busana
    "[Make Up] Make up bride and groom",
    "[Make Up] Retouch make up resepsi for bride and groom",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Make up & busana 2 pagar ayu",
    "[Make Up & Busana] Make up & busana 2 pagar bagus",
    "[Make Up & Busana] Make up & busana 4 penjaga buku tamu",
    "[Make Up & Busana] Make up & busana 6 among tamu",
    "[Peralatan & Aksesoris] Melati fresh",
    "[Peralatan & Aksesoris] Aksessoris akad & resepsi",
    "[Busana] Busana bride and groom bebas pilih for akad & resepsi",
    // Decoration
    "[Decoration] Dekorasi pelaminan (max 10-12 meter)",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Meja & kursi akad",
    "[Decoration] Dekorasi jalan",
    "[Decoration] Karpet jalan",
    "[Decoration] Gazebo + akrilik",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Dekorasi terima tamu",
    "[Decoration] Wedding gate",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Dekorasi mobil pengantin",
    "[Decoration] Artificial flowers bouquet (for rent)",
    "[Decoration] Janur dan kembar mayang",
    // Layanan & MC
    "[MC dan Cucuk Lampah] MC dan Cucuk Lampah",
  ],
  gedung1: [
    // Make Up & Busana
    "[Make Up] Make up bride and groom",
    "[Make Up] Retouch make up resepsi for bride and groom",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Make up & busana 2 pagar ayu",
    "[Make Up & Busana] Make up & busana 2 pagar bagus",
    "[Make Up & Busana] Make up & busana 4 penjaga buku tamu",
    "[Peralatan & Aksesoris] Melati fresh",
    "[Peralatan & Aksesoris] Aksessoris akad & resepsi",
    "[Busana] Busana bride and groom bebas pilih for akad & resepsi",
    // Decoration
    "[Decoration] Dekorasi pelaminan (max 10 meter)",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Meja & kursi akad",
    "[Decoration] Dekorasi jalan",
    "[Decoration] Karpet jalan",
    "[Decoration] Gazebo",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Dekorasi terima tamu",
    "[Decoration] Wedding gate",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet (for rent)",
    "[Decoration] Janur dan kembar mayang",
    // Layanan & MC
    "[MC dan Cucuk Lampah] MC dan Cucuk Lampah",
  ],
  rumah2: [
    // Make Up & Busana
    "[Make Up] Make up bride and groom",
    "[Make Up] Retouch make up resepsi for bride and groom",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Make up & busana 2 pagar ayu",
    "[Make Up & Busana] Make up & busana 2 pagar bagus",
    "[Make Up & Busana] Make up & busana 2 penjaga buku tamu",
    "[Make Up & Busana] Make up & busana 2 keluarga / lain-lain",
    "[Peralatan & Aksesoris] Melati fresh",
    "[Peralatan & Aksesoris] Aksessoris akad, adat & resepsi",
    "[Busana] Busana bride and groom bebas pilih for akad, adat & resepsi",
    // Decoration
    "[Decoration] Dekorasi pelaminan (max 8 meter)",
    "[Decoration] Meja dan kursi akad",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Wedding gate",
    "[Decoration] Dekorasi kamar",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet ( for rent )",
    "[Decoration] Janur dan kembar mayang",
    // Layanan & MC
    "[MC dan Cucuk Lampah] MC & Cucuk Lampah",
  ],
  rumah1: [
    // Make Up & Busana
    "[Make Up] Make up bride and groom",
    "[Make Up] Retouch make up resepsi for bride and groom",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Make up & busana 4 penjaga buku tamu",
    "[Peralatan & Aksesoris] Melati fresh",
    "[Peralatan & Aksesoris] Aksessoris akad & resepsi",
    "[Busana] Busana bride and groom bebas pilih for akad & resepsi",
    // Decoration
    "[Decoration] Dekorasi pelaminan (max 6 meter)",
    "[Decoration] Meja dan kursi akad",
    "[Decoration] Mini garden",
    "[Decoration] Karpet permadani",
    "[Decoration] Set sofa pelaminan",
    "[Decoration] Wedding gate",
    "[Decoration] Dekorasi photobooth",
    "[Decoration] Welcome sign",
    "[Decoration] Stand foto",
    "[Decoration] Kotak amplop",
    "[Decoration] Artificial flowers bouquet ( for rent )",
    "[Decoration] Janur dan kembar mayang",
    // Layanan & MC
    "[MC dan Cucuk Lampah] MC & Cucuk Lampah",
  ],
  siraman: [
    "[Make Up & Busana] Make up + busana siraman calon pengantin",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Retouch bride + busana midodareni",
    "[Peralatan & Aksesoris] Melati fresh (Krodong Siraman)",
    "[Decoration] Dekorasi siraman",
    "[Adat Siraman] Peralatan Siraman",
    "[MC dan Cucuk Lampah] MC Adat",
  ],
  mua: [
    "[Make Up] Make up bride and groom",
    "[Make Up] Retouch make up resepsi for bride and groom",
    "[Make Up & Busana] Make up & busana 2 mama",
    "[Make Up & Busana] Make up & busana 2 papa",
    "[Make Up & Busana] Make up & busana 4 penjaga buku tamu",
    "[Peralatan & Aksesoris] Melati fresh",
    "[Peralatan & Aksesoris] Aksessoris akad & resepsi",
    "[Busana] Busana bride and groom bebas pilih for akad & resepsi",
  ],
  default: [
    "[Make Up] Tata Rias Pengantin Akad & Resepsi",
    "[Busana] Busana Pengantin Akad & Resepsi",
    "[Decoration] Dekorasi Pelaminan & Mini Garden",
    "[Decoration] Set Kursi Pengantin & Orang Tua",
    "[Decoration] Meja & Kursi Akad Nikah",
    "[Decoration] Kotak Angpau dengan Gembok & Kunci",
    "[Decoration] Welcome Sign & Stand Foto",
  ],
};

function getTemplateKey(packageName?: string): string {
  if (!packageName) return "default";
  const name = packageName.toLowerCase();
  if (name.includes("siraman")) return "siraman";
  if (name.includes("mua")) return "mua";
  if (name.includes("gedung 2") || name.includes("gedung ii")) return "gedung2";
  if (name.includes("gedung")) return "gedung1";
  if (name.includes("rumah 2") || name.includes("rumah ii")) return "rumah2";
  if (name.includes("rumah")) return "rumah1";
  if (name.includes("royal") || name.includes("jawa")) return "gedung2";
  if (name.includes("gold") || name.includes("premium")) return "rumah2";
  if (name.includes("melati") || name.includes("basic")) return "mua";
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
      no_wa,
      tanggal_acara,
      lokasi,
      status,
      package_id,
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

// ============================================================================
// 8. KELOLA MASTER TEMPLATE BARANG PER PAKET (Checklist Templates)
// ============================================================================

// Ambil seluruh paket beserta template barangnya (dengan auto-seed jika kosong)
export async function getChecklistPackages(): Promise<ChecklistPackageInfo[]> {
  const supabase = createAdminClient();

  // Ambil paket aktif
  const { data: pkgs, error: pkgError } = await supabase
    .from("packages")
    .select("id, nama, deskripsi, harga_dasar, aktif")
    .eq("aktif", true)
    .order("harga_dasar", { ascending: true });

  if (pkgError || !pkgs) {
    console.error("Gagal mengambil data paket:", pkgError);
    return [];
  }

  // Cek apakah ada paket yang belum memiliki item di checklist_templates
  for (const pkg of pkgs) {
    const { count } = await supabase
      .from("checklist_templates")
      .select("*", { count: "exact", head: true })
      .eq("package_id", pkg.id);

    if (count === 0 || count === null) {
      const key = getTemplateKey(pkg.nama);
      const defaultList = DEFAULT_PACKAGE_TEMPLATES[key] || DEFAULT_PACKAGE_TEMPLATES.default;
      const toInsert = defaultList.map((nama) => ({
        package_id: pkg.id,
        nama_barang: nama,
      }));
      await supabase.from("checklist_templates").insert(toInsert);
    }
  }

  // Ambil seluruh templates yang sudah rapi
  const { data: allTemplates } = await supabase
    .from("checklist_templates")
    .select("*")
    .order("dibuat_pada", { ascending: true });

  const templatesByPkg = new Map<string, ChecklistTemplateItem[]>();
  for (const item of allTemplates || []) {
    if (!templatesByPkg.has(item.package_id)) {
      templatesByPkg.set(item.package_id, []);
    }
    templatesByPkg.get(item.package_id)!.push(item);
  }

  return pkgs.map((pkg) => ({
    id: pkg.id,
    nama: pkg.nama,
    deskripsi: pkg.deskripsi,
    harga_dasar: pkg.harga_dasar ?? 0,
    templates: templatesByPkg.get(pkg.id) || [],
  }));
}

// Ambil template barang untuk satu paket tertentu
export async function getPackageTemplates(packageId: string): Promise<ChecklistTemplateItem[]> {
  const supabase = createAdminClient();

  const { data: existing, error } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("package_id", packageId)
    .order("dibuat_pada", { ascending: true });

  if (error) {
    console.error("Gagal mengambil templates paket:", error);
    return [];
  }

  if (existing && existing.length > 0) {
    return existing;
  }

  // Jika kosong, inisialisasi dari template standar
  const { data: pkg } = await supabase
    .from("packages")
    .select("nama")
    .eq("id", packageId)
    .single();

  const key = getTemplateKey(pkg?.nama);
  const defaultList = DEFAULT_PACKAGE_TEMPLATES[key] || DEFAULT_PACKAGE_TEMPLATES.default;

  const toInsert = defaultList.map((nama) => ({
    package_id: packageId,
    nama_barang: nama,
  }));

  const { data: inserted } = await supabase
    .from("checklist_templates")
    .insert(toInsert)
    .select();

  return inserted || [];
}

// Tambah barang baru ke template paket
export async function addChecklistTemplateItem(
  packageId: string,
  namaBarang: string
): Promise<{ success: boolean; item?: ChecklistTemplateItem; error?: string }> {
  if (!namaBarang || namaBarang.trim().length < 2) {
    return { success: false, error: "Nama barang minimal 2 karakter." };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("checklist_templates")
    .insert({
      package_id: packageId,
      nama_barang: namaBarang.trim(),
    })
    .select()
    .single();

  if (error) {
    console.error("Gagal menambah template barang paket:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true, item: data };
}

// Edit nama barang template paket
export async function updateChecklistTemplateItem(
  templateId: string,
  namaBarang: string
): Promise<{ success: boolean; error?: string }> {
  if (!namaBarang || namaBarang.trim().length < 2) {
    return { success: false, error: "Nama barang minimal 2 karakter." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("checklist_templates")
    .update({ nama_barang: namaBarang.trim() })
    .eq("id", templateId);

  if (error) {
    console.error("Gagal update template barang paket:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}

// Hapus barang dari template paket
export async function deleteChecklistTemplateItem(
  templateId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    console.error("Gagal menghapus template barang paket:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/checklist");
  return { success: true };
}

// Reset barang paket kembali ke rekomendasi standar Era Waluyo
export async function resetPackageTemplates(
  packageId: string
): Promise<{ success: boolean; templates?: ChecklistTemplateItem[]; error?: string }> {
  const supabase = createAdminClient();

  const { data: pkg } = await supabase
    .from("packages")
    .select("nama")
    .eq("id", packageId)
    .single();

  const key = getTemplateKey(pkg?.nama);
  const defaultList = DEFAULT_PACKAGE_TEMPLATES[key] || DEFAULT_PACKAGE_TEMPLATES.default;

  // Hapus semua template paket ini
  await supabase
    .from("checklist_templates")
    .delete()
    .eq("package_id", packageId);

  // Insert ulang sesuai template standar
  const toInsert = defaultList.map((nama) => ({
    package_id: packageId,
    nama_barang: nama,
  }));

  const { data: inserted, error } = await supabase
    .from("checklist_templates")
    .insert(toInsert)
    .select();

  if (error) {
    console.error("Gagal mereset template paket:", error);
    return { success: false, error: error.message };
  }

  logSecurityEvent(
    "TEMPLATE_RESET",
    "admin",
    `Template master perlengkapan "${pkg?.nama || packageId}" direset ke standar resmi Era Waluyo.`,
    "warning"
  );

  revalidatePath("/checklist");
  return { success: true, templates: inserted || [] };
}

// Terapkan / Sinkronkan template paket ke booking acara tertentu
export async function applyPackageTemplateToBooking(
  bookingId: string,
  packageId: string,
  mode: "replace" | "append" = "append"
): Promise<{ success: boolean; count: number; error?: string }> {
  const supabase = createAdminClient();

  // Ambil template barang paket
  const templates = await getPackageTemplates(packageId);
  if (!templates || templates.length === 0) {
    return {
      success: false,
      count: 0,
      error: "Paket ini belum memiliki daftar barang template.",
    };
  }

  if (mode === "replace") {
    // Hapus seluruh checklist_items lama untuk booking ini
    const { error: delError } = await supabase
      .from("checklist_items")
      .delete()
      .eq("booking_id", bookingId);

    if (delError) {
      console.error("Gagal menghapus item lama:", delError);
      return { success: false, count: 0, error: delError.message };
    }

    const itemsToInsert = templates.map((t) => ({
      booking_id: bookingId,
      nama_barang: t.nama_barang,
      dimuat: false,
      kembali: false,
    }));

    const { data: inserted, error: insError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert)
      .select();

    if (insError) {
      console.error("Gagal menyisipkan item baru dari paket:", insError);
      return { success: false, count: 0, error: insError.message };
    }

    revalidatePath("/checklist");
    return { success: true, count: inserted?.length || 0 };
  } else {
    // Mode append: hanya masukkan barang yang belum ada
    const { data: existingItems } = await supabase
      .from("checklist_items")
      .select("nama_barang")
      .eq("booking_id", bookingId);

    const existingNames = new Set(
      (existingItems || []).map((i) => i.nama_barang.trim().toLowerCase())
    );

    const missingTemplates = templates.filter(
      (t) => !existingNames.has(t.nama_barang.trim().toLowerCase())
    );

    if (missingTemplates.length === 0) {
      return { success: true, count: 0 };
    }

    const itemsToInsert = missingTemplates.map((t) => ({
      booking_id: bookingId,
      nama_barang: t.nama_barang,
      dimuat: false,
      kembali: false,
    }));

    const { data: inserted, error: insError } = await supabase
      .from("checklist_items")
      .insert(itemsToInsert)
      .select();

    if (insError) {
      console.error("Gagal menyisipkan missing items dari paket:", insError);
      return { success: false, count: 0, error: insError.message };
    }

    revalidatePath("/checklist");
    return { success: true, count: inserted?.length || 0 };
  }
}

