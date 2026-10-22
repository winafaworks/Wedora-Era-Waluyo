"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { logSecurityEvent } from "@/lib/security/audit-logger";

export interface CatalogItemPhoto {
  id: string;
  item_id: string;
  url: string;
  urutan: number | null;
  dibuat_pada: string | null;
}

export type CatalogJenis =
  | "busana"
  | "busana_wanita"
  | "busana_pria"
  | "aksesori"
  | "dekorasi"
  | "layanan"
  | string;

export interface CatalogItem {
  id: string;
  jenis: CatalogJenis;
  nama: string;
  ukuran: string | null;
  deskripsi: string | null;
  aktif: boolean | null;
  dibuat_pada: string | null;
  updated_at: string | null;
  catalog_photos?: CatalogItemPhoto[];
}

export interface CatalogInput {
  jenis: CatalogJenis;
  nama: string;
  ukuran?: string;
  deskripsi?: string;
}

const DEFAULT_CATALOG_ITEMS = [
  {
    jenis: "busana",
    nama: "Kebaya Beludru Hitam Panjang Jawa Klasik",
    ukuran: "L / Custom",
    deskripsi: "Kebaya beludru hitam panjang (kebaya pengantin Jawa/bludru) dengan bordir benang emas dan payet, dipadukan kain jarik batik.",
  },
  {
    jenis: "busana",
    nama: "Koleksi Kebaya Resepsi Modern Berekor",
    ukuran: "All Size (S - XL)",
    deskripsi: "Deretan kebaya resepsi modern berekor (gaun kebaya payet) berbahan tulle dan brokat dengan variasi warna (abu-abu, sage, merah marun/burgundy).",
  },
  {
    jenis: "busana",
    nama: "Kebaya Akad Nikah Modern Putih Shanghai",
    ukuran: "M / All Size",
    deskripsi: "Kebaya atau gaun akad nikah modern warna putih dengan kerah shanghai, dipenuhi detail payet mutiara dan kristal swarovski.",
  },
  {
    jenis: "dekorasi",
    nama: "Mahkota Tiara & Cunduk Mentul Jawa/Sunda",
    ukuran: "Standar Pengantin",
    deskripsi: "Rak atas berisi mahkota/tiara pengantin, rak bawah berisi cunduk mentul (kembang goyang) untuk hiasan sanggul adat Jawa atau Sunda.",
  },
  {
    jenis: "dekorasi",
    nama: "Siger Sunda Emas Ukir Klasik",
    ukuran: "Standar Pengantin",
    deskripsi: "Siger Sunda berwarna emas dengan motif ukiran klasik khas pengantin Sunda Putri.",
  },
  {
    jenis: "dekorasi",
    nama: "Koleksi Mahkota Siger Modifikasi & Tiara Kristal",
    ukuran: "Beragam Model",
    deskripsi: "Koleksi mahkota pengantin, meliputi siger modifikasi dan tiara pengantin modern bertabur mata kristal.",
  },
  {
    jenis: "busana",
    nama: "Beskap Putih Akad Nikah Payet Mewah",
    ukuran: "L / XL",
    deskripsi: "Baris bawah: Beskap putih (sering dipakai untuk akad nikah) dengan detail payet di ujung lengan dan kerah.",
  },
  {
    jenis: "busana",
    nama: "Beskap Beludru Jawa Hitam & Marun Bordir Emas",
    ukuran: "M / L / XL",
    deskripsi: "Baris atas: Beskap beludru/bludru warna hitam dan marun dengan bordir benang emas khas busana adat Jawa (Jawa Klasik/Solo/Yogya).",
  },
];

// 1. Ambil semua item katalog
export async function getCatalogItems() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("catalog_items")
    .select(`
      *,
      catalog_photos (
        id,
        item_id,
        url,
        urutan,
        dibuat_pada
      )
    `)
    .order("dibuat_pada", { ascending: false });

  if (error) {
    console.error("Gagal mengambil data katalog:", error);
    return [];
  }

  // Jika katalog masih kosong, inisialisasi item katalog bawaan Era Waluyo
  if (!data || data.length === 0) {
    const { data: inserted, error: insertError } = await supabase
      .from("catalog_items")
      .insert(DEFAULT_CATALOG_ITEMS)
      .select(`
        *,
        catalog_photos (
          id,
          item_id,
          url,
          urutan,
          dibuat_pada
        )
      `);

    if (insertError) {
      console.error("Gagal inisialisasi katalog bawaan:", insertError);
      return [];
    }

    return inserted || [];
  }

  return data;
}

// 2. Buat item katalog baru
export async function createCatalogItem(input: CatalogInput) {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("catalog_items")
      .insert({
        jenis: input.jenis,
        nama: input.nama.trim(),
        ukuran: input.ukuran?.trim() || null,
        deskripsi: input.deskripsi?.trim() || null,
        aktif: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Gagal menambah item katalog:", error);
      return { success: false, error: "Gagal menyimpan item katalog baru." };
    }

    revalidatePath("/katalog");
    return { success: true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}

// 3. Ubah item katalog
export async function updateCatalogItem(id: string, input: CatalogInput) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("catalog_items")
      .update({
        jenis: input.jenis,
        nama: input.nama.trim(),
        ukuran: input.ukuran?.trim() || null,
        deskripsi: input.deskripsi?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Gagal memperbarui item katalog:", error);
      return { success: false, error: "Gagal memperbarui data katalog." };
    }

    revalidatePath("/katalog");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}

// 4. Hapus item katalog
export async function deleteCatalogItem(id: string) {
  try {
    const supabase = createAdminClient();

    // Hapus foto-foto terkait dari storage bila ada
    const { data: photos } = await supabase
      .from("catalog_photos")
      .select("url")
      .eq("item_id", id);

    if (photos && photos.length > 0) {
      const filePaths = photos
        .map((p) => {
          const parts = p.url.split("/catalog-photos/");
          return parts.length > 1 ? parts[1] : null;
        })
        .filter(Boolean) as string[];

      if (filePaths.length > 0) {
        await supabase.storage.from("catalog-photos").remove(filePaths);
      }
    }

    const { error } = await supabase
      .from("catalog_items")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Gagal menghapus item katalog:", error);
      return { success: false, error: "Gagal menghapus item katalog." };
    }

    logSecurityEvent(
      "CATALOG_DELETED",
      "admin",
      `Item katalog ID: ${id} beserta medianya telah dihapus dari sistem.`,
      "danger"
    );

    revalidatePath("/katalog");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}

// 5. Unggah foto katalog ke Supabase Storage
export async function uploadCatalogPhoto(itemId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "Tidak ada berkas foto yang dipilih." };
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "Format berkas harus berupa JPG, PNG, atau WebP.",
      };
    }

    const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeBytes) {
      return {
        success: false,
        error: "Ukuran berkas melebihi batas maksimal 5 MB.",
      };
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${itemId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("catalog-photos")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Gagal mengunggah foto ke storage:", uploadError);
      return { success: false, error: "Gagal mengunggah foto ke penyimpanan." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("catalog-photos").getPublicUrl(fileName);

    const { data: photoRecord, error: insertError } = await supabase
      .from("catalog_photos")
      .insert({
        item_id: itemId,
        url: publicUrl,
        urutan: 1,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Gagal mencatat data foto ke database:", insertError);
      return { success: false, error: "Gagal menyimpan rincian foto ke basis data." };
    }

    revalidatePath("/katalog");
    return { success: true, photo: photoRecord };
  } catch (err: unknown) {
    console.error("Error upload catalog photo:", err);
    const message = err instanceof Error ? err.message : "Gagal mengunggah foto.";
    return { success: false, error: message };
  }
}

// 6. Hapus foto katalog
export async function deleteCatalogPhoto(photoId: string, photoUrl: string) {
  try {
    const supabase = createAdminClient();

    // Hapus dari Storage
    const parts = photoUrl.split("/catalog-photos/");
    if (parts.length > 1) {
      const storagePath = parts[1];
      await supabase.storage.from("catalog-photos").remove([storagePath]);
    }

    // Hapus dari Database
    const { error } = await supabase
      .from("catalog_photos")
      .delete()
      .eq("id", photoId);

    if (error) {
      console.error("Gagal menghapus rekaman foto:", error);
      return { success: false, error: "Gagal menghapus foto." };
    }

    revalidatePath("/katalog");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
    return { success: false, error: message };
  }
}
