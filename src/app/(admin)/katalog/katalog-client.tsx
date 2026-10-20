"use client";

import React, { useState, useMemo } from "react";
import {
  Shirt,
  Sparkles,
  Camera,
  Plus,
  Search,
  Edit3,
  Trash2,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  AlertCircle,
  Tag,
  Maximize2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CatalogItem,
  createCatalogItem,
  updateCatalogItem,
  deleteCatalogItem,
  uploadCatalogPhoto,
  deleteCatalogPhoto,
} from "@/lib/actions/catalog";

interface KatalogClientProps {
  initialItems: CatalogItem[];
}

export default function KatalogClient({ initialItems }: KatalogClientProps) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems);
  const [activeTab, setActiveTab] = useState<"all" | "busana" | "dekorasi" | "layanan">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState("all");

  // Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [photoTargetItem, setPhotoTargetItem] = useState<CatalogItem | null>(null);

  // Form Input State
  const [formData, setFormData] = useState({
    jenis: "busana" as "busana" | "dekorasi" | "layanan",
    nama: "",
    ukuran: "L",
    deskripsi: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab !== "all" && item.jenis !== activeTab) {
        return false;
      }

      // Size filter (only for busana)
      if (item.jenis === "busana" && sizeFilter !== "all") {
        if (!item.ukuran || !item.ukuran.toLowerCase().includes(sizeFilter.toLowerCase())) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNama = item.nama.toLowerCase().includes(query);
        const matchDeskripsi = item.deskripsi?.toLowerCase().includes(query);
        const matchUkuran = item.ukuran?.toLowerCase().includes(query);
        if (!matchNama && !matchDeskripsi && !matchUkuran) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, sizeFilter, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    let busana = 0;
    let dekorasi = 0;
    let layanan = 0;
    for (const item of items) {
      if (item.jenis === "busana") busana++;
      else if (item.jenis === "dekorasi") dekorasi++;
      else if (item.jenis === "layanan") layanan++;
    }
    return { all: items.length, busana, dekorasi, layanan };
  }, [items]);

  // Open Add Item Modal
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      jenis: activeTab !== "all" ? activeTab : "busana",
      nama: "",
      ukuran: "L",
      deskripsi: "",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Item Modal
  const handleOpenEditModal = (item: CatalogItem) => {
    setEditingItem(item);
    setFormData({
      jenis: item.jenis,
      nama: item.nama,
      ukuran: item.ukuran || "L",
      deskripsi: item.deskripsi || "",
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Submit Add / Edit Item
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!formData.nama.trim()) {
      setFormError("Nama item katalog wajib diisi.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingItem) {
        const res = await updateCatalogItem(editingItem.id, {
          jenis: formData.jenis,
          nama: formData.nama,
          ukuran: formData.jenis === "busana" ? formData.ukuran : undefined,
          deskripsi: formData.deskripsi,
        });

        if (res.success) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === editingItem.id
                ? {
                    ...it,
                    jenis: formData.jenis,
                    nama: formData.nama,
                    ukuran: formData.jenis === "busana" ? formData.ukuran : null,
                    deskripsi: formData.deskripsi,
                  }
                : it
            )
          );
          setIsFormModalOpen(false);
        } else {
          setFormError(res.error || "Gagal memperbarui item katalog.");
        }
      } else {
        const res = await createCatalogItem({
          jenis: formData.jenis,
          nama: formData.nama,
          ukuran: formData.jenis === "busana" ? formData.ukuran : undefined,
          deskripsi: formData.deskripsi,
        });

        if (res.success && res.data) {
          setItems((prev) => [
            {
              ...res.data,
              catalog_photos: [],
            } as CatalogItem,
            ...prev,
          ]);
          setIsFormModalOpen(false);
        } else {
          setFormError(res.error || "Gagal menambah item katalog baru.");
        }
      }
    } catch {
      setFormError("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Item
  const handleDeleteItem = async (item: CatalogItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${item.nama}" dari katalog?`)) {
      const res = await deleteCatalogItem(item.id);
      if (res.success) {
        setItems((prev) => prev.filter((it) => it.id !== item.id));
      } else {
        alert(res.error || "Gagal menghapus item katalog.");
      }
    }
  };

  // Open Photos Management Modal
  const handleOpenPhotoModal = (item: CatalogItem) => {
    setPhotoTargetItem(item);
    setPhotoError(null);
    setIsPhotoModalOpen(true);
  };

  // Upload Photo
  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoTargetItem) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await uploadCatalogPhoto(photoTargetItem.id, fd);

    if (res.success && res.photo) {
      // Update target item photos in state
      const updatedItem: CatalogItem = {
        ...photoTargetItem,
        catalog_photos: [...(photoTargetItem.catalog_photos || []), res.photo],
      };
      setPhotoTargetItem(updatedItem);
      setItems((prev) =>
        prev.map((it) => (it.id === updatedItem.id ? updatedItem : it))
      );
    } else {
      setPhotoError(res.error || "Gagal mengunggah foto.");
    }

    setIsUploadingPhoto(false);
    // Reset input
    e.target.value = "";
  };

  // Delete Photo
  const handleDeletePhoto = async (photoId: string, photoUrl: string) => {
    if (!photoTargetItem) return;

    if (confirm("Hapus foto ini dari katalog?")) {
      const res = await deleteCatalogPhoto(photoId, photoUrl);
      if (res.success) {
        const updatedPhotos = (photoTargetItem.catalog_photos || []).filter(
          (p) => p.id !== photoId
        );
        const updatedItem = { ...photoTargetItem, catalog_photos: updatedPhotos };
        setPhotoTargetItem(updatedItem);
        setItems((prev) =>
          prev.map((it) => (it.id === updatedItem.id ? updatedItem : it))
        );
      } else {
        alert(res.error || "Gagal menghapus foto.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A]">
            Katalog Busana & Dekorasi
          </h1>
          <p className="text-sm md:text-base text-[#5E5A52] mt-1">
            Koleksi kebaya, beskap adat, ukuran, dekorasi, dan layanan vendor Era Waluyo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
            className="gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            <span>Tambah Item Baru</span>
          </Button>
        </div>
      </div>

      {/* Categories Tabs & Search Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#FFFFFF] border border-[#E5DEC9] rounded-xl overflow-x-auto shadow-xs">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "all"
                ? "bg-[#D4AD5C] text-[#1A1A1A] shadow-xs"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
            }`}
          >
            Semua ({tabCounts.all})
          </button>
          <button
            onClick={() => setActiveTab("busana")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "busana"
                ? "bg-[#D4AD5C] text-[#1A1A1A] shadow-xs"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
            }`}
          >
            <Shirt size={14} />
            <span>Busana ({tabCounts.busana})</span>
          </button>
          <button
            onClick={() => setActiveTab("dekorasi")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dekorasi"
                ? "bg-[#D4AD5C] text-[#1A1A1A] shadow-xs"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
            }`}
          >
            <Sparkles size={14} />
            <span>Dekorasi ({tabCounts.dekorasi})</span>
          </button>
          <button
            onClick={() => setActiveTab("layanan")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === "layanan"
                ? "bg-[#D4AD5C] text-[#1A1A1A] shadow-xs"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
            }`}
          >
            <Camera size={14} />
            <span>Layanan ({tabCounts.layanan})</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A857B]"
              size={16}
            />
            <input
              type="text"
              placeholder="Cari item katalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-xs text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors shadow-sm"
            />
          </div>

          {/* Size Filter (shown when activeTab is all or busana) */}
          {(activeTab === "all" || activeTab === "busana") && (
            <select
              value={sizeFilter}
              onChange={(e) => setSizeFilter(e.target.value)}
              className="h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-xs text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer shadow-sm"
            >
              <option value="all">Semua Ukuran</option>
              <option value="S">Ukuran S</option>
              <option value="M">Ukuran M</option>
              <option value="L">Ukuran L</option>
              <option value="XL">Ukuran XL</option>
              <option value="All Size">All Size</option>
            </select>
          )}
        </div>
      </div>

      {/* Catalog Cards Grid */}
      {filteredItems.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#F5EDDC] text-[#5E5A52] flex items-center justify-center">
            <Search size={28} />
          </div>
          <div>
            <h3 className="font-serif text-xl font-medium text-[#1A1A1A]">
              Tidak Ada Item Katalog Ditemukan
            </h3>
            <p className="text-xs text-[#5E5A52] max-w-sm mx-auto mt-1">
              Tidak ada item yang cocok dengan pencarian atau filter yang dipilih. Coba reset kata kunci atau tambah item baru.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setSizeFilter("all");
              setActiveTab("all");
            }}
          >
            Reset Filter
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const photos = item.catalog_photos || [];
            const primaryPhoto = photos[0]?.url;

            const categoryIcon =
              item.jenis === "busana" ? (
                <Shirt size={14} className="text-[#8A6A22]" />
              ) : item.jenis === "dekorasi" ? (
                <Sparkles size={14} className="text-[#2F7A4B]" />
              ) : (
                <Camera size={14} className="text-[#406882]" />
              );

            const categoryLabel =
              item.jenis === "busana"
                ? "Busana & Kebaya"
                : item.jenis === "dekorasi"
                ? "Dekorasi Pelaminan"
                : "Layanan Vendor";

            return (
              <Card
                key={item.id}
                className="p-0 overflow-hidden flex flex-col justify-between hover:border-[#D6CEBE] transition-all group"
              >
                <div>
                  {/* Photo Preview Container */}
                  <div className="relative w-full h-48 bg-[#F5EDDC]/40 border-b border-[#E5DEC9] flex items-center justify-center overflow-hidden">
                    {primaryPhoto ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={primaryPhoto}
                        alt={item.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#8A857B] space-y-2">
                        <ImageIcon size={36} className="opacity-40" />
                        <span className="text-xs text-[#8A857B]">Belum ada foto</span>
                      </div>
                    )}

                    {/* Category Tag (Top Left) */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#E5DEC9] text-[11px] font-medium text-[#1A1A1A] flex items-center gap-1.5 shadow-xs">
                      {categoryIcon}
                      <span>{categoryLabel}</span>
                    </div>

                    {/* Photo Count Tag (Top Right) */}
                    <button
                      onClick={() => handleOpenPhotoModal(item)}
                      className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#FFFFFF]/90 backdrop-blur-sm border border-[#E5DEC9] text-[11px] font-semibold text-[#8A6A22] hover:bg-[#FAF6ED] transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      title="Buka Galeri Foto"
                    >
                      <Camera size={12} />
                      <span>{photos.length} Foto</span>
                    </button>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] leading-snug group-hover:text-[#8A6A22] transition-colors">
                        {item.nama}
                      </h3>
                      {item.ukuran && (
                        <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-[rgba(212,173,92,0.14)] text-[#8A6A22] text-xs font-semibold flex items-center gap-1 border border-[#D4AD5C]/40">
                          <Tag size={11} />
                          <span>{item.ukuran}</span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#5E5A52] line-clamp-3 leading-relaxed">
                      {item.deskripsi || "Tidak ada rincian deskripsi tambahan."}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 pt-2 border-t border-[#E5DEC9] flex items-center justify-between gap-2 bg-[#FAF6ED]/50">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPhotoModal(item)}
                    className="gap-1.5 text-xs flex-1"
                  >
                    <Camera size={13} />
                    <span>Galeri ({photos.length})</span>
                  </Button>

                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:bg-[#FAF6ED] text-[#5E5A52] hover:text-[#1A1A1A] transition-colors cursor-pointer shadow-xs"
                    title="Ubah Item"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDeleteItem(item)}
                    className="p-2 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:bg-[rgba(177,60,48,0.1)] text-[#5E5A52] hover:text-[#B13C30] transition-colors cursor-pointer shadow-xs"
                    title="Hapus Item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Tambah / Ubah Item Katalog */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5DEC9] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  {editingItem ? "Ubah Item Katalog" : "Tambah Item Katalog Baru"}
                </h3>
                <p className="text-xs text-[#5E5A52] mt-0.5">
                  Rincian busana, dekorasi, atau layanan vendor Era Waluyo
                </p>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[rgba(177,60,48,0.12)] border border-[#B13C30] rounded-xl text-xs text-[#B13C30] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Jenis Item */}
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Jenis Item <span className="text-[#B13C30]">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["busana", "dekorasi", "layanan"] as const).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setFormData({ ...formData, jenis: j })}
                      className={`h-10 rounded-xl text-xs font-semibold capitalize transition-all border cursor-pointer ${
                        formData.jenis === j
                          ? "bg-[rgba(212,173,92,0.18)] text-[#8A6A22] border-[#8A6A22]"
                          : "bg-[#FFFFFF] text-[#5E5A52] border-[#D6CEBE] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nama Item */}
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Nama Item <span className="text-[#B13C30]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kebaya Solo Basahan Beludru Hitam"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors shadow-sm"
                />
              </div>

              {/* Ukuran (Khusus Busana & Dekorasi) */}
              {formData.jenis === "busana" ? (
                <div>
                  <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                    Ukuran Busana
                  </label>
                  <select
                    value={formData.ukuran}
                    onChange={(e) => setFormData({ ...formData, ukuran: e.target.value })}
                    className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer shadow-sm"
                  >
                    <option value="S">Ukuran S</option>
                    <option value="M">Ukuran M</option>
                    <option value="L">Ukuran L</option>
                    <option value="XL">Ukuran XL</option>
                    <option value="XXL">Ukuran XXL</option>
                    <option value="All Size">All Size (Dapat Disesuaikan)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                    Dimensi / Spesifikasi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 8 x 3 Meter"
                    value={formData.ukuran}
                    onChange={(e) => setFormData({ ...formData, ukuran: e.target.value })}
                    className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors shadow-sm"
                  />
                </div>
              )}

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Deskripsi Item
                </label>
                <textarea
                  rows={3}
                  placeholder="Rincian bahan, motif, kelengkapan aksesoris, atau detail layanan..."
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full p-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors shadow-sm"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting} className="gap-2">
                  <Check size={16} />
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan Item"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Kelola Galeri Foto Item */}
      {/* ========================================================================= */}
      {isPhotoModalOpen && photoTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E5DEC9] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
              <div>
                <span className="text-xs font-semibold text-[#8A6A22] uppercase tracking-wider">
                  Galeri Foto Katalog
                </span>
                <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                  {photoTargetItem.nama}
                </h3>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {photoError && (
              <div className="p-3 bg-[rgba(177,60,48,0.12)] border border-[#B13C30] rounded-xl text-xs text-[#B13C30] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{photoError}</span>
              </div>
            )}

            {/* Upload Area */}
            <div className="p-6 border-2 border-dashed border-[#D6CEBE] rounded-2xl bg-[#FBF7EC]/60 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] text-[#8A6A22] flex items-center justify-center">
                <Upload size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  Unggah Foto Item Katalog
                </p>
                <p className="text-xs text-[#5E5A52] mt-0.5">
                  Format yang didukung: JPG, PNG, WebP (Maksimal 5 MB)
                </p>
              </div>
              <div>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AD5C] text-[#1A1A1A] text-xs font-semibold hover:bg-[#E3C27D] transition-colors cursor-pointer shadow-sm">
                  <Camera size={16} />
                  <span>{isUploadingPhoto ? "Sedang Mengunggah..." : "Pilih Berkas Foto"}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isUploadingPhoto}
                    onChange={handleUploadPhoto}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5E5A52]">
                Foto yang Tersedia ({(photoTargetItem.catalog_photos || []).length})
              </h4>

              {(photoTargetItem.catalog_photos || []).length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A857B] bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
                  Belum ada foto yang diunggah untuk item ini.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(photoTargetItem.catalog_photos || []).map((photo, i) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square bg-[#F5EDDC]/40 border border-[#E5DEC9] rounded-xl overflow-hidden shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={`${photoTargetItem.nama} ${i + 1}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Photo Order Badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#1A1A1A]/80 backdrop-blur-xs text-[10px] font-semibold text-[#FBF7EC]">
                        Foto #{i + 1}
                      </span>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF6ED] text-[#1A1A1A] transition-colors shadow-sm"
                          title="Lihat Ukuran Penuh"
                        >
                          <Maximize2 size={16} />
                        </a>
                        <button
                          onClick={() => handleDeletePhoto(photo.id, photo.url)}
                          className="p-2 rounded-lg bg-[#B13C30] hover:bg-[#912d23] text-white transition-colors cursor-pointer shadow-sm"
                          title="Hapus Foto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E5DEC9] flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPhotoModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
