"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CatalogItemPhoto {
  id: string;
  item_id: string;
  url: string;
  urutan: number | null;
  dibuat_pada: string | null;
}

export interface CatalogItem {
  id: string;
  jenis: "busana" | "dekorasi" | "layanan";
  nama: string;
  ukuran: string | null;
  deskripsi: string | null;
  aktif: boolean | null;
  dibuat_pada: string | null;
  updated_at: string | null;
  catalog_photos?: CatalogItemPhoto[];
}

export interface CatalogInput {
  jenis: "busana" | "dekorasi" | "layanan";
  nama: string;
  ukuran?: string;
  deskripsi?: string;
}

const DEFAULT_CATALOG_ITEMS = [
  {
    jenis: "busana",
    nama: "Kebaya Solo Basahan Beludru Hitam",
    ukuran: "L",
    deskripsi: "Kebaya pengantin beludru hitam pekat berpayet emas klasik khas Solo Basahan dengan jarik sogan prada.",
  },
  {
    jenis: "busana",
    nama: "Beskap Sikepan Adat Jawa Gold",
    ukuran: "XL",
    deskripsi: "Beskap pengantin pria berbahan beludru hitam berbordir benang emas mewah, lengkap dengan sabuk timang & blangkon.",
  },
  {
    jenis: "busana",
    nama: "Kebaya Kutubaru Klasik Broken White",
    ukuran: "M",
    deskripsi: "Kutubaru sutra warna putih tulang berbordir anggun, sangat cocok untuk prosesi akad nikah sakral.",
  },
  {
    jenis: "busana",
    nama: "Gaun Resepsi Modern Sage Green",
    ukuran: "All Size",
    deskripsi: "Gaun muslimah resepsi modern bernuansa sage green dengan taburan mutiara dan selendang satin elegan.",
  },
  {
    jenis: "dekorasi",
    nama: "Pelaminan Gebyok Ukir Klasik 8 Meter",
    ukuran: "8 x 3 Meter",
    deskripsi: "Gebyok kayu jati asli berukir khas Jawa Tengah, rangkaian bunga segar melati & mawar, serta lighting warm gold.",
  },
  {
    jenis: "dekorasi",
    nama: "Dekorasi Modern Minimalis Pastel",
    ukuran: "6 x 3 Meter",
    deskripsi: "Backdrop arch modern warna cream & gold, bunga artificial premium kombinasi daun eucalyptus dan pampas.",
  },
  {
    jenis: "dekorasi",
    nama: "Lorong Masuk & Gate Melati Segar",
    ukuran: "Standar Gedung",
    deskripsi: "Pintu masuk gapura janur melati, pergola bunga gantung, dan 6 standing flower di sepanjang karpet jalan.",
  },
  {
    jenis: "layanan",
    nama: "Tata Rias Pengantin Paes Tradisional (MUA)",
    ukuran: "-",
    deskripsi: "Layanan rias wajah profesional untuk akad dan resepsi dengan cengkorongan paes halus dan ronce melati asli.",
  },
  {
    jenis: "layanan",
    nama: "Master of Ceremony (MC) Adat & Nasional",
    ukuran: "-",
    deskripsi: "Pemandu jalannya prosesi adat temu panggih, sungkeman, hingga resepsi ramah tamah dengan bahasa santun.",
  },
  {
    jenis: "layanan",
    nama: "Dokumentasi Foto & Cinematic Video",
    ukuran: "-",
    deskripsi: "Liputan hari pernikahan lengkap: 1 album cetak eksklusif, teaser 1 menit reels, dan full video dokumentasi 4K.",
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
