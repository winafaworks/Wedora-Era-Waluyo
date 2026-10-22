"use client";

import React, { useState, useMemo, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Truck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Package as PackageIcon,
  Filter,
  Printer,
  Sparkles,
  ArrowRight,
  Clock,
  ChevronDown,
  Download,
  Search,
  Layers,
  Edit3,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateChecklistPdf } from "@/lib/pdf/checklist-pdf";
import {
  ChecklistItemData,
  ChecklistBookingOption,
  ChecklistPackageInfo,
  ChecklistTemplateItem,
  toggleItemDimuat,
  toggleItemKembali,
  addChecklistItem,
  deleteChecklistItem,
  bulkUpdateChecklist,
  getChecklistItems,
  addChecklistTemplateItem,
  updateChecklistTemplateItem,
  deleteChecklistTemplateItem,
  resetPackageTemplates,
  applyPackageTemplateToBooking,
  getChecklistPackages,
} from "@/lib/actions/checklist";
import {
  parseItemName,
  formatItemName,
  getCategoryBadgeStyle,
  STANDARD_CATEGORIES,
} from "@/lib/checklist-utils";

interface ChecklistClientProps {
  bookings: ChecklistBookingOption[];
  initialItems: ChecklistItemData[];
  initialSelectedBookingId: string | null;
  initialPackages?: ChecklistPackageInfo[];
}

export default function ChecklistClient({
  bookings,
  initialItems,
  initialSelectedBookingId,
  initialPackages = [],
}: ChecklistClientProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialSelectedBookingId || (bookings.length > 0 ? bookings[0].id : "")
  );
  const [items, setItems] = useState<ChecklistItemData[]>(initialItems);
  const [filterTab, setFilterTab] = useState<"semua" | "belum_dimuat" | "belum_kembali" | "kembali">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // State master data barang paket (templates)
  const [packages, setPackages] = useState<ChecklistPackageInfo[]>(initialPackages);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [activePackageId, setActivePackageId] = useState<string>(() => {
    const matched = bookings.find((b) => b.id === (initialSelectedBookingId || bookings[0]?.id));
    if (matched?.package_id) return matched.package_id;
    if (initialPackages.length > 0) return initialPackages[0].id;
    return "";
  });
  const [newTemplateItemName, setNewTemplateItemName] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<string>("Make Up");
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingTemplateName, setEditingTemplateName] = useState("");
  const [templateFeedback, setTemplateFeedback] = useState<string | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [syncConfirmOpen, setSyncConfirmOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("semua");
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [templateCategoryTab, setTemplateCategoryTab] = useState<string>("semua");

  // State dropdown pilihan jadwal acara
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const filteredDropdownBookings = useMemo(() => {
    if (!dropdownSearch.trim()) return bookings;
    const q = dropdownSearch.toLowerCase();
    return bookings.filter(
      (b) =>
        b.nama_pelanggan.toLowerCase().includes(q) ||
        b.tanggal_acara.toLowerCase().includes(q) ||
        (b.packages?.nama && b.packages.nama.toLowerCase().includes(q))
    );
  }, [bookings, dropdownSearch]);

  // State tambah barang baru
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Ambil detail booking yang sedang aktif dipilih
  const currentBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Active package yang sedang dibuka di modal kelola barang paket
  const activePackage = useMemo(() => {
    return packages.find((p) => p.id === activePackageId) || packages[0] || null;
  }, [packages, activePackageId]);

  // Kategori yang ada di paket aktif beserta hitungan barangnya
  const activePackageCategoryCounts = useMemo(() => {
    if (!activePackage) return new Map<string, number>();
    const counts = new Map<string, number>();
    for (const item of activePackage.templates) {
      const { category } = parseItemName(item.nama_barang);
      counts.set(category, (counts.get(category) || 0) + 1);
    }
    return counts;
  }, [activePackage]);

  // Sync initial packages jika belum terisi
  useEffect(() => {
    if (packages.length === 0) {
      getChecklistPackages().then((res) => {
        setPackages(res);
        if (res.length > 0 && !activePackageId) {
          setActivePackageId(res[0].id);
        }
      });
    }
  }, [packages.length, activePackageId]);

  // Ganti booking terpilih
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActionError(null);
    const b = bookings.find((item) => item.id === bookingId);
    if (b?.package_id) {
      setActivePackageId(b.package_id);
    }
    startTransition(async () => {
      const fetched = await getChecklistItems(bookingId);
      setItems(fetched);
    });
  };

  // Handler Tab Paket di Modal
  const handleSelectPackageTab = (pkgId: string) => {
    setActivePackageId(pkgId);
    setEditingTemplateId(null);
    setEditingTemplateName("");
    setTemplateFeedback(null);
    setTemplateSearchQuery("");
    setTemplateCategoryTab("semua");
  };

  // Kelompokkan template paket aktif berdasarkan kategori (seperti Make Up, Decoration, dll)
  const groupedTemplates = useMemo(() => {
    if (!activePackage) return [];
    const map = new Map<string, ChecklistTemplateItem[]>();

    for (const item of activePackage.templates) {
      const { category, name } = parseItemName(item.nama_barang);

      if (templateCategoryTab !== "semua" && category !== templateCategoryTab) {
        continue;
      }
      if (templateSearchQuery.trim()) {
        const q = templateSearchQuery.toLowerCase();
        if (!name.toLowerCase().includes(q) && !category.toLowerCase().includes(q)) {
          continue;
        }
      }

      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)!.push(item);
    }

    const groups: { category: string; items: ChecklistTemplateItem[] }[] = [];
    for (const [category, groupItems] of map.entries()) {
      groups.push({ category, items: groupItems });
    }

    return groups;
  }, [activePackage, templateCategoryTab, templateSearchQuery]);

  // Tambah barang baru ke template paket
  const handleAddNewTemplateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackageId || !newTemplateItemName.trim()) return;

    const formatted = formatItemName(newTemplateCategory, newTemplateItemName.trim());
    setIsTemplateLoading(true);
    setTemplateFeedback(null);
    const res = await addChecklistTemplateItem(activePackageId, formatted);
    setIsTemplateLoading(false);

    if (res.success && res.item) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === activePackageId
            ? { ...pkg, templates: [...pkg.templates, res.item!] }
            : pkg
        )
      );
      setNewTemplateItemName("");
      const parsed = parseItemName(res.item.nama_barang);
      setTemplateFeedback(
        `Barang "${parsed.name}" (${parsed.category}) berhasil ditambahkan ke master ${activePackage?.nama || "paket"}.`
      );
    } else {
      setTemplateFeedback(res.error || "Gagal menambahkan barang ke template.");
    }
  };

  // Mulai edit nama barang template
  const handleStartEditTemplate = (item: ChecklistTemplateItem) => {
    setEditingTemplateId(item.id);
    setEditingTemplateName(item.nama_barang);
  };

  // Simpan edit nama barang template paket
  const handleSaveEditTemplate = async (item: ChecklistTemplateItem) => {
    if (!editingTemplateName.trim()) return;
    setIsTemplateLoading(true);
    const res = await updateChecklistTemplateItem(item.id, editingTemplateName.trim());
    setIsTemplateLoading(false);

    if (res.success) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === item.package_id
            ? {
                ...pkg,
                templates: pkg.templates.map((t) =>
                  t.id === item.id ? { ...t, nama_barang: editingTemplateName.trim() } : t
                ),
              }
            : pkg
        )
      );
      setEditingTemplateId(null);
      setEditingTemplateName("");
      setTemplateFeedback("Nama barang template berhasil diperbarui.");
    } else {
      setTemplateFeedback(res.error || "Gagal memperbarui barang template.");
    }
  };

  // Hapus barang dari template paket
  const handleDeleteTemplateItem = async (item: ChecklistTemplateItem) => {
    if (
      !window.confirm(
        `Hapus "${item.nama_barang}" dari daftar barang standar ${activePackage?.nama || "paket"}?`
      )
    ) {
      return;
    }

    setIsTemplateLoading(true);
    const res = await deleteChecklistTemplateItem(item.id);
    setIsTemplateLoading(false);

    if (res.success) {
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.id === item.package_id
            ? {
                ...pkg,
                templates: pkg.templates.filter((t) => t.id !== item.id),
              }
            : pkg
        )
      );
      setTemplateFeedback(`Barang "${item.nama_barang}" telah dihapus dari template.`);
    } else {
      setTemplateFeedback(res.error || "Gagal menghapus barang dari template.");
    }
  };

  // Reset template paket ke standar rekomendasi Era Waluyo
  const handleResetPackageTemplate = async (pkgId: string) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (
      !window.confirm(
        `Reset daftar barang "${pkg?.nama || "paket"}" ke rekomendasi standar resmi Era Waluyo? Daftar barang kustom paket ini akan disesuaikan kembali.`
      )
    ) {
      return;
    }

    setIsTemplateLoading(true);
    const res = await resetPackageTemplates(pkgId);
    setIsTemplateLoading(false);

    if (res.success && res.templates) {
      setPackages((prev) =>
        prev.map((p) => (p.id === pkgId ? { ...p, templates: res.templates! } : p))
      );
      setTemplateFeedback(
        `Daftar barang standar untuk "${pkg?.nama}" berhasil dimuat ulang sesuai SOP Era Waluyo.`
      );
    } else {
      setTemplateFeedback(res.error || "Gagal mereset template paket.");
    }
  };

  // Terapkan barang paket ke acara terpilih
  const handleApplyPackageToBooking = async (mode: "replace" | "append") => {
    if (!selectedBookingId || !currentBooking) {
      alert("Silakan pilih jadwal acara terlebih dahulu.");
      return;
    }
    if (!activePackageId || !activePackage) {
      alert("Silakan pilih paket terlebih dahulu.");
      return;
    }

    const actionDescription =
      mode === "replace"
        ? `GANTI SEMUA: Seluruh daftar barang acara "${currentBooking.nama_pelanggan}" akan diganti dengan ${activePackage.templates.length} barang standar dari "${activePackage.nama}".`
        : `TAMBAHKAN: Barang standar dari "${activePackage.nama}" yang belum tercatat pada acara "${currentBooking.nama_pelanggan}" akan ditambahkan (tanpa menduplikat barang lama).`;

    if (
      !window.confirm(
        `Terapkan barang paket ke acara ini?\n\n${actionDescription}\n\nLanjutkan?`
      )
    ) {
      return;
    }

    setIsTemplateLoading(true);
    const res = await applyPackageTemplateToBooking(selectedBookingId, activePackageId, mode);
    setIsTemplateLoading(false);

    if (res.success) {
      // Muat ulang checklist items
      startTransition(async () => {
        const refreshed = await getChecklistItems(selectedBookingId);
        setItems(refreshed);
      });
      setSyncConfirmOpen(false);
      setTemplateFeedback(
        `Berhasil! ${res.count} barang dari "${activePackage.nama}" telah dimasukkan ke acara "${currentBooking.nama_pelanggan}".`
      );
      alert(
        `Berhasil! ${res.count} barang dari "${activePackage.nama}" telah diterapkan ke checklist acara "${currentBooking.nama_pelanggan}".`
      );
    } else {
      setTemplateFeedback(res.error || "Gagal menerapkan barang paket ke acara.");
      alert(res.error || "Gagal menerapkan barang paket ke acara.");
    }
  };

  // Quick sync untuk acara aktif
  const handleQuickSyncCurrentPackage = () => {
    if (!currentBooking) return;
    if (!currentBooking.package_id) {
      alert(
        "Acara ini belum terhubung dengan paket tertentu. Buka 'Kelola Barang Paket' untuk memilih dan menerapkan paket."
      );
      return;
    }
    setActivePackageId(currentBooking.package_id);
    setSyncConfirmOpen(true);
  };

  // Toggle status dimuat
  const handleToggleDimuat = (item: ChecklistItemData) => {
    const nextVal = !item.dimuat;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              dimuat: nextVal,
              dimuat_pada: nextVal ? new Date().toISOString() : null,
            }
          : i
      )
    );

    startTransition(async () => {
      const res = await toggleItemDimuat(item.id, nextVal);
      if (!res.success) {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, dimuat: item.dimuat } : i))
        );
        setActionError("Gagal memperbarui status dimuat.");
      }
    });
  };

  // Toggle status kembali
  const handleToggleKembali = (item: ChecklistItemData) => {
    const nextVal = !item.kembali;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              kembali: nextVal,
              kembali_pada: nextVal ? new Date().toISOString() : null,
            }
          : i
      )
    );

    startTransition(async () => {
      const res = await toggleItemKembali(item.id, nextVal);
      if (!res.success) {
        // Rollback
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, kembali: item.kembali } : i))
        );
        setActionError("Gagal memperbarui status kembali.");
      }
    });
  };

  // Tambah item checklist kustom
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !selectedBookingId) return;

    setActionError(null);
    startTransition(async () => {
      const res = await addChecklistItem(selectedBookingId, newItemName.trim());
      if (res.success && res.item) {
        setItems((prev) => [
          ...prev,
          {
            ...res.item,
            dimuat: !!res.item.dimuat,
            kembali: !!res.item.kembali,
          },
        ]);
        setNewItemName("");
        setIsAdding(false);
      } else {
        setActionError(res.error || "Gagal menambahkan barang.");
      }
    });
  };

  // Hapus item
  const handleDeleteItem = (itemId: string, namaBarang: string) => {
    if (!window.confirm(`Hapus "${namaBarang}" dari daftar checklist acara ini?`)) {
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== itemId));
    startTransition(async () => {
      const res = await deleteChecklistItem(itemId);
      if (!res.success) {
        setActionError("Gagal menghapus barang.");
        // Refetch
        const refreshed = await getChecklistItems(selectedBookingId);
        setItems(refreshed);
      }
    });
  };

  // Aksi massal
  const handleBulkAction = (mode: "dimuat_all" | "kembali_all" | "reset_all") => {
    const confirmText =
      mode === "dimuat_all"
        ? "Tandai seluruh barang sebagai SUDAH DIMUAT?"
        : mode === "kembali_all"
        ? "Tandai seluruh barang sebagai SUDAH KEMBALI ke gudang?"
        : "Reset seluruh tanda dimuat dan kembali untuk acara ini?";

    if (!window.confirm(confirmText)) return;

    startTransition(async () => {
      const res = await bulkUpdateChecklist(selectedBookingId, mode);
      if (res.success) {
        const refreshed = await getChecklistItems(selectedBookingId);
        setItems(refreshed);
      } else {
        setActionError("Gagal menjalankan aksi massal.");
      }
    });
  };

  // Perhitungan statistik
  const stats = useMemo(() => {
    const total = items.length;
    const sudahDimuat = items.filter((i) => i.dimuat).length;
    const sudahKembali = items.filter((i) => i.kembali).length;
    // Barang yang belum kembali adalah barang yang sudah dimuat tapi belum tercatat kembali,
    // atau jika belum dimuat sama sekali dan statusnya belum kembali.
    // Yang paling krusial untuk disorot adalah: dimuat = true tapi kembali = false!
    const belumKembaliKrusial = items.filter((i) => i.dimuat && !i.kembali).length;
    const totalBelumKembali = total - sudahKembali;

    return {
      total,
      sudahDimuat,
      sudahKembali,
      belumKembaliKrusial,
      totalBelumKembali,
      persenDimuat: total > 0 ? Math.round((sudahDimuat / total) * 100) : 0,
      persenKembali: total > 0 ? Math.round((sudahKembali / total) * 100) : 0,
    };
  }, [items]);

  // Ambil semua kategori unik dari items acara untuk filter dropdown
  const availableEventCategories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      const { category } = parseItemName(item.nama_barang);
      if (category && category !== "Umum") {
        set.add(category);
      }
    }
    return Array.from(set);
  }, [items]);

  // Filter daftar item
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter kategori
      if (selectedCategoryFilter !== "semua") {
        const { category } = parseItemName(item.nama_barang);
        if (category !== selectedCategoryFilter) {
          return false;
        }
      }

      // Filter search
      if (
        searchQuery &&
        !item.nama_barang.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Filter tab
      if (filterTab === "belum_dimuat") {
        return !item.dimuat;
      }
      if (filterTab === "belum_kembali") {
        return !item.kembali;
      }
      if (filterTab === "kembali") {
        return item.kembali;
      }
      return true;
    });
  }, [items, filterTab, searchQuery, selectedCategoryFilter]);

  // Fungsi cetak dokumen checklist ke PDF (tampilan dokumen rapi khusus cetak)
  const handlePrintPdf = () => {
    if (!currentBooking) {
      alert("Silakan pilih jadwal acara terlebih dahulu.");
      return;
    }
    if (items.length === 0) {
      alert("Belum ada data barang checklist untuk acara ini.");
      return;
    }
    generateChecklistPdf({
      booking: currentBooking,
      items,
      action: "print",
    });
  };

  // Fungsi unduh dokumen checklist langsung sebagai file .pdf
  const handleDownloadPdf = () => {
    if (!currentBooking) {
      alert("Silakan pilih jadwal acara terlebih dahulu.");
      return;
    }
    if (items.length === 0) {
      alert("Belum ada data barang checklist untuk acara ini.");
      return;
    }
    generateChecklistPdf({
      booking: currentBooking,
      items,
      action: "download",
    });
  };

  // Format jam / tanggal pendek untuk timestamp
  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A]">
            Checklist Acara
          </h1>
          <p className="text-[14px] text-[#5E5A52] mt-1">
            Pantau status barang dimuat dan kembali untuk mencegah barang tertinggal
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentBooking?.package_id) {
                setActivePackageId(currentBooking.package_id);
              } else if (packages.length > 0) {
                setActivePackageId(packages[0].id);
              }
              setTemplateFeedback(null);
              setIsPackageModalOpen(true);
            }}
            className="gap-2 border-[#D4AD5C] bg-[#FFFDF9] dark:bg-[#202020] text-[#1A1A1A] dark:text-[#F5EDDC] hover:border-[#EEB100] shadow-sm font-semibold"
            title="Kelola master daftar barang standar per paket (Siraman, MUA, Rumah, Gedung)"
          >
            <Layers size={15} className="text-[#EEB100]" />
            <span>Kelola Barang Paket</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPdf}
            disabled={!currentBooking || items.length === 0}
            className="gap-2"
            title="Unduh file dokumen PDF checklist"
          >
            <Download size={15} />
            <span>Unduh PDF</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintPdf}
            disabled={!currentBooking || items.length === 0}
            className="gap-2 border-[#D4AD5C] text-[#EEB100] hover:border-[#EEB100] active:border-[#EEB100]"
            title="Buka dokumen PDF checklist rapi untuk dicetak"
          >
            <Printer size={15} />
            <span>Cetak PDF</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            <span>Tambah Barang</span>
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="p-3.5 bg-[rgba(177,60,48,0.12)] border border-[#B13C30] rounded-xl text-xs text-[#B13C30] flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="font-bold cursor-pointer text-[#B13C30] hover:opacity-80"
          >
            ✕
          </button>
        </div>
      )}

      {/* Booking Selector Dropdown & Info Acara */}
      {bookings.length === 0 ? (
        <Card className="p-10 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(238,177,0,0.15)] text-[#EEB100] flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div>
            <h2 className="font-sans text-[20px] font-bold text-[#1A1A1A]">
              Belum Ada Data Acara
            </h2>
            <p className="text-[14px] text-[#5E5A52] mt-1 max-w-md mx-auto">
              Checklist otomatis dibuat setelah pesanan pernikahan didaftarkan ke sistem Era Waluyo.
            </p>
          </div>
          <Link href="/booking/tambah">
            <Button variant="primary" className="gap-2">
              <Plus size={16} />
              <span>Catat Booking Baru</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Card Pilih Acara & Rincian Singkat */}
          <Card className="p-5 sm:p-6 bg-[#FFFFFF] border border-[#E5DEC9] dark:border-[#38342C] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9] dark:border-[#332F28]">
              <div className="space-y-1.5 flex-1 max-w-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#EEB100] uppercase tracking-wider">
                    Pilih Jadwal Acara Pernikahan
                  </label>
                  {bookings.length > 10 && (
                    <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                      {bookings.length} acara (scroll untuk melihat semua)
                    </span>
                  )}
                </div>

                <div ref={dropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen((prev) => !prev);
                      setDropdownSearch("");
                    }}
                    className="w-full h-11 pl-4 pr-10 bg-[#FAF6ED] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-xl text-sm font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100] dark:focus:border-[#EEB100] cursor-pointer text-left flex items-center justify-between shadow-sm transition-colors"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                  >
                    <span className="truncate">
                      {currentBooking
                        ? `${currentBooking.tanggal_acara} — ${currentBooking.nama_pelanggan} (${currentBooking.packages?.nama || "Paket Khusus"})`
                        : "Pilih Jadwal Acara"}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200 pointer-events-none ${
                        isDropdownOpen ? "rotate-180 text-[#EEB100]" : "text-[#5E5A52] dark:text-[#A8A296]"
                      }`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div
                      role="listbox"
                      className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#FFFFFF] dark:bg-[#202020] border border-[#D6CEBE] dark:border-[#38342C] rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100"
                    >
                      {/* Search box jika opsi jadwal acara lebih dari 10 */}
                      {bookings.length > 10 && (
                        <div className="p-2 border-b border-[#E5DEC9] dark:border-[#332F28] bg-[#FAF7F0] dark:bg-[#1E1E1E]">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8A857B] pointer-events-none"
                            />
                            <input
                              type="text"
                              value={dropdownSearch}
                              onChange={(e) => setDropdownSearch(e.target.value)}
                              placeholder="Cari tanggal atau nama pengantin..."
                              className="w-full h-8 pl-8 pr-3 bg-[#FFFFFF] dark:bg-[#262626] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100]"
                              autoFocus
                            />
                          </div>
                        </div>
                      )}

                      {/* List booking - scroll jika lebih dari 10 item (max-h 380px) */}
                      <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-[#F0EBE1] dark:divide-[#2D2A24]">
                        {filteredDropdownBookings.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[#8A857B] dark:text-[#A8A296]">
                            Tidak ada jadwal acara yang cocok
                          </div>
                        ) : (
                          filteredDropdownBookings.map((b) => {
                            const isSelected = b.id === selectedBookingId;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => {
                                  handleSelectBooking(b.id);
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#FAF6ED] dark:bg-[#2A261F] text-[#EEB100] font-bold"
                                    : "text-[#1A1A1A] dark:text-[#E8E2D5] hover:bg-[#FAF6ED] dark:hover:bg-[#2A261F]"
                                }`}
                              >
                                <div className="truncate flex-1">
                                  <span className="font-semibold">{b.tanggal_acara}</span>
                                  <span className="mx-1.5 opacity-60">—</span>
                                  <span>{b.nama_pelanggan}</span>
                                  <span className="ml-1.5 text-xs opacity-75 font-normal">
                                    ({b.packages?.nama || "Paket Khusus"})
                                  </span>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 size={16} className="text-[#EEB100] shrink-0" />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentBooking && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/booking/${currentBooking.id}`}
                    className="text-xs font-semibold text-[#EEB100] hover:text-[#EEB100] inline-flex items-center gap-1.5 py-2 px-3 rounded-lg border border-[#E5DEC9] dark:border-[#38342C] bg-[#FAF6ED] dark:bg-[#252525]"
                  >
                    <span>Buka Rincian Booking</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>

            {/* Banner Informasi Acara Terpilih */}
            {currentBooking && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C]">
                  <Calendar size={18} className="text-[#EEB100] shrink-0" />
                  <div>
                    <span className="text-[#8A857B] block text-[11px]">Tanggal Acara</span>
                    <strong className="text-[#1A1A1A] dark:text-[#F5EDDC] text-sm font-semibold">
                      {currentBooking.tanggal_acara}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C]">
                  <MapPin size={18} className="text-[#EEB100] shrink-0" />
                  <div className="truncate">
                    <span className="text-[#8A857B] block text-[11px]">Lokasi Acara</span>
                    <strong className="text-[#1A1A1A] dark:text-[#F5EDDC] text-sm font-semibold truncate block">
                      {currentBooking.lokasi}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C]">
                  <PackageIcon size={18} className="text-[#EEB100] shrink-0" />
                  <div className="truncate flex-1">
                    <span className="text-[#8A857B] block text-[11px]">Paket Acara</span>
                    <strong className="text-[#1A1A1A] dark:text-[#F5EDDC] text-sm font-semibold truncate block">
                      {currentBooking.packages?.nama || "Paket Khusus Era Waluyo"}
                    </strong>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentBooking.package_id) {
                            setActivePackageId(currentBooking.package_id);
                          }
                          setTemplateFeedback(null);
                          setIsPackageModalOpen(true);
                        }}
                        className="text-[11px] font-semibold text-[#EEB100] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Layers size={11} />
                        <span>Kelola Barang Paket</span>
                      </button>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <button
                        type="button"
                        onClick={handleQuickSyncCurrentPackage}
                        className="text-[11px] font-semibold text-[#2E5F8A] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Terapkan daftar barang fix paket ke checklist acara ini"
                      >
                        <RotateCcw size={11} />
                        <span>Sinkronkan Barang</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 4 Ringkasan Kelengkapan Barang Sesuai PRD (Disorot untuk Belum Kembali) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Barang */}
            <Card className="p-5 flex flex-col justify-between bg-[rgba(238,177,0,0.26)] dark:bg-[rgba(238,177,0,0.12)] border-[rgba(238,177,0,0.45)] dark:border-[rgba(238,177,0,0.3)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4A463E] dark:text-[#A8A296]">Total Barang</span>
                <CheckSquare size={18} className="text-[#EEB100]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#EEB100]">
                  {stats.total}
                </div>
                <p className="mt-1 text-xs text-[#6B655B] dark:text-[#888888]">Daftar perlengkapan acara</p>
              </div>
            </Card>

            {/* Sudah Dimuat */}
            <Card className="p-5 flex flex-col justify-between bg-[rgba(46,95,138,0.22)] dark:bg-[rgba(59,130,246,0.12)] border-[rgba(46,95,138,0.45)] dark:border-[rgba(59,130,246,0.3)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4A463E] dark:text-[#A8A296]">Sudah Dimuat</span>
                <Truck size={18} className="text-[#2E5F8A] dark:text-[#60A5FA]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#2E5F8A] dark:text-[#60A5FA] flex items-baseline gap-2">
                  <span>{stats.sudahDimuat}</span>
                  <span className="text-xs font-semibold text-[#4A463E] dark:text-[#A8A296]">
                    ({stats.persenDimuat}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B655B] dark:text-[#888888]">Siap / dibawa ke lokasi</p>
              </div>
            </Card>

            {/* Sudah Kembali */}
            <Card className="p-5 flex flex-col justify-between bg-[rgba(47,122,75,0.22)] dark:bg-[rgba(16,185,129,0.12)] border-[rgba(47,122,75,0.45)] dark:border-[rgba(16,185,129,0.3)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#4A463E] dark:text-[#A8A296]">Sudah Kembali</span>
                <CheckCircle2 size={18} className="text-[#2F7A4B] dark:text-[#34D399]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#2F7A4B] dark:text-[#34D399] flex items-baseline gap-2">
                  <span>{stats.sudahKembali}</span>
                  <span className="text-xs font-semibold text-[#4A463E] dark:text-[#A8A296]">
                    ({stats.persenKembali}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#6B655B] dark:text-[#888888]">Tiba aman di galeri Era Waluyo</p>
              </div>
            </Card>

            {/* DISOROT KHUSUS: Belum Kembali */}
            <Card
              className={`p-5 flex flex-col justify-between transition-all ${
                stats.totalBelumKembali > 0
                  ? "bg-[rgba(177,60,48,0.22)] dark:bg-[rgba(239,68,68,0.15)] border-[#B13C30]/50 dark:border-[#EF4444]/40 shadow-sm"
                  : "bg-[rgba(47,122,75,0.22)] dark:bg-[rgba(16,185,129,0.12)] border-[rgba(47,122,75,0.45)] dark:border-[rgba(16,185,129,0.3)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-semibold ${
                    stats.totalBelumKembali > 0 ? "text-[#B13C30] dark:text-[#F87171]" : "text-[#4A463E] dark:text-[#A8A296]"
                  }`}
                >
                  Belum Kembali
                </span>
                <AlertTriangle
                  size={18}
                  className={
                    stats.totalBelumKembali > 0
                      ? "text-[#B13C30] dark:text-[#F87171] animate-pulse"
                      : "text-[#8A857B] dark:text-[#888888]"
                  }
                />
              </div>
              <div className="mt-3">
                <div
                  className={`text-3xl font-sans font-bold ${
                    stats.totalBelumKembali > 0 ? "text-[#B13C30] dark:text-[#F87171]" : "text-[#2F7A4B] dark:text-[#34D399]"
                  }`}
                >
                  {stats.totalBelumKembali}
                </div>
                <p
                  className={`mt-1 text-xs font-medium ${
                    stats.totalBelumKembali > 0
                      ? "text-[#B13C30] dark:text-[#F87171]"
                      : "text-[#2F7A4B] dark:text-[#34D399]"
                  }`}
                >
                  {stats.totalBelumKembali > 0
                    ? `${stats.belumKembaliKrusial} barang dimuat belum kembali!`
                    : "Seluruh barang lengkap kembali"}
                </p>
              </div>
            </Card>
          </div>

          {/* Form Tambah Barang Cepat (Modal / Inline) */}
          {isAdding && (
            <Card className="p-5 border-2 border-[#D4AD5C] bg-[#FFFDF9] animate-in fade-in duration-200">
              <form onSubmit={handleAddItem} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                    <Sparkles size={16} className="text-[#EEB100]" />
                    Tambah Barang Baru ke Checklist Acara
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="text-xs text-[#5E5A52] hover:text-[#1A1A1A]"
                  >
                    Batal
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Kabel Extension 20M, Bunga Melati Tambahan, dll."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="flex-1 h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100] shadow-sm"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isPending || !newItemName.trim()}
                    className="shrink-0"
                  >
                    {isPending ? "Menyimpan..." : "Simpan Barang"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Control Bar: Filter Dropdown, Kategori, Pencarian & Aksi Massal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 sm:p-3 bg-[#FAF8F3] dark:bg-[#1E1E1E] rounded-xl border border-[#E5DEC9] dark:border-[#332F28] shadow-xs">
            {/* Filter Dropdowns & Search */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Dropdown Filter Status */}
              <div className="relative flex items-center">
                <select
                  value={filterTab}
                  onChange={(e) => setFilterTab(e.target.value as "semua" | "belum_dimuat" | "belum_kembali" | "kembali")}
                  className={`h-9 pl-3 pr-8 rounded-lg text-xs font-semibold border shadow-xs focus:outline-none focus:border-[#EEB100] cursor-pointer appearance-none transition-all ${
                    filterTab === "belum_kembali"
                      ? "bg-[#FFF5F5] dark:bg-[#2A1818] border-[#B13C30] text-[#B13C30]"
                      : filterTab === "kembali"
                      ? "bg-[#F0FDF4] dark:bg-[#14261C] border-[#2F7A4B] text-[#2F7A4B]"
                      : filterTab === "belum_dimuat"
                      ? "bg-[#F0F7FF] dark:bg-[#162230] border-[#2E5F8A] text-[#2E5F8A]"
                      : "bg-[#FFFFFF] dark:bg-[#252525] border-[#D6CEBE] dark:border-[#38342C] text-[#1A1A1A] dark:text-[#F5EDDC]"
                  }`}
                  title="Filter status pengiriman dan pengembalian barang"
                >
                  <option value="semua">Semua Status ({items.length})</option>
                  <option value="belum_dimuat">Belum Dimuat ({items.filter((i) => !i.dimuat).length})</option>
                  <option value="belum_kembali">Belum Kembali ({stats.totalBelumKembali})</option>
                  <option value="kembali">Selesai Kembali ({items.filter((i) => i.kembali).length})</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A857B]" />
              </div>

              {/* Dropdown Filter Kategori */}
              {availableEventCategories.length > 0 && (
                <div className="relative flex items-center">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="h-9 pl-3 pr-8 bg-[#FFFFFF] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100] shadow-xs cursor-pointer appearance-none"
                    title="Filter daftar barang berdasarkan kategori"
                  >
                    <option value="semua">Semua Kategori ({items.length})</option>
                    {availableEventCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} ({items.filter((i) => parseItemName(i.nama_barang).category === cat).length})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8A857B]" />
                </div>
              )}

              {/* Input Pencarian Nama Barang */}
              <div className="relative flex items-center flex-1 sm:flex-initial">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A857B]" />
                <input
                  type="text"
                  placeholder="Cari nama barang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 pl-8 pr-7 bg-[#FFFFFF] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs text-[#1A1A1A] dark:text-[#F5EDDC] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] shadow-xs w-full sm:w-48 lg:w-56"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8A857B] hover:text-[#1A1A1A] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Quick Warning Badge jika ada barang belum kembali */}
              {stats.totalBelumKembali > 0 && filterTab !== "belum_kembali" && (
                <button
                  type="button"
                  onClick={() => setFilterTab("belum_kembali")}
                  className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FFF5F5] dark:bg-[#2A1818] border border-[#B13C30]/40 text-[#B13C30] hover:bg-[#FFEBEB] transition-colors cursor-pointer"
                  title="Klik untuk langsung memfilter barang yang belum kembali"
                >
                  <AlertTriangle size={12} />
                  <span>{stats.totalBelumKembali} Belum Kembali</span>
                </button>
              )}
            </div>

            {/* Tombol Aksi Massal */}
            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("dimuat_all")}
                disabled={isPending || items.length === 0}
                className="text-xs h-9 bg-[#FFFFFF] dark:bg-[#202020] text-[#2E5F8A] dark:text-[#93C5FD] border-[#D6CEBE] dark:border-[#38342C] hover:bg-[#F0F7FF] shadow-xs"
                title="Tandai semua barang sebagai sudah dimuat"
              >
                <Truck size={14} className="mr-1.5" />
                Semua Dimuat
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction("kembali_all")}
                disabled={isPending || items.length === 0}
                className="text-xs h-9 bg-[#FFFFFF] dark:bg-[#202020] text-[#2F7A4B] dark:text-[#6EE7B7] border-[#D6CEBE] dark:border-[#38342C] hover:bg-[#F0FDF4] shadow-xs"
                title="Tandai semua barang sebagai sudah kembali"
              >
                <CheckCircle2 size={14} className="mr-1.5" />
                Semua Kembali
              </Button>

              <button
                type="button"
                onClick={() => handleBulkAction("reset_all")}
                disabled={isPending || items.length === 0}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-[#8A857B] hover:text-[#B13C30] hover:bg-[#FAF6ED] dark:hover:bg-[#252525] border border-transparent hover:border-[#E5DEC9] transition-colors cursor-pointer"
                title="Reset seluruh status tanda checklist"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Tabel / Daftar Checklist Interaktif */}
          <Card className="overflow-hidden bg-[#FFFFFF] border border-[#E5DEC9] shadow-sm">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6ED] text-[#8A857B] flex items-center justify-center">
                  <Filter size={20} />
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">
                  Tidak Ada Barang yang Sesuai
                </h3>
                <p className="text-xs text-[#5E5A52] max-w-sm mx-auto">
                  {searchQuery
                    ? `Tidak ditemukan barang dengan kata kunci "${searchQuery}".`
                    : "Tidak ada barang pada kategori filter ini."}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-[#EEB100] font-semibold underline"
                  >
                    Hapus pencarian
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#FAF6ED] border-b border-[#E5DEC9] text-xs font-semibold text-[#5E5A52] uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 w-12 text-center">No</th>
                      <th className="py-3.5 px-4">Nama Barang & Perlengkapan</th>
                      <th className="py-3.5 px-4 w-48 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Truck size={14} />
                          <span>Status Dimuat</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 w-48 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} />
                          <span>Status Kembali</span>
                        </div>
                      </th>
                      <th className="py-3.5 px-4 w-36 text-center">Ringkasan Status</th>
                      <th className="py-3.5 px-4 w-16 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]">
                    {filteredItems.map((item, index) => {
                      const isKrusial = item.dimuat && !item.kembali;

                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors hover:bg-[#FAF6ED] dark:hover:bg-[#252525] ${
                            isKrusial ? "bg-[rgba(177,60,48,0.04)] dark:bg-[rgba(177,60,48,0.12)]" : ""
                          }`}
                        >
                          {/* Nomor Urut */}
                          <td className="py-3.5 px-4 text-center text-xs text-[#8A857B] font-mono">
                            {index + 1}
                          </td>

                          {/* Nama Barang & Kategori */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const parsed = parseItemName(item.nama_barang);
                                const style = getCategoryBadgeStyle(parsed.category);
                                return (
                                  <>
                                    {parsed.category !== "Umum" && (
                                      <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                                      >
                                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                        {parsed.category}
                                      </span>
                                    )}
                                    <span className="font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                                      {parsed.name}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                            {isKrusial && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#B13C30] dark:text-[#FFA39E] font-medium mt-1">
                                <AlertTriangle size={12} />
                                Barang di lokasi / belum kembali
                              </span>
                            )}
                          </td>

                          {/* Penanda DIMUAT */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleDimuat(item)}
                              disabled={isPending}
                              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                item.dimuat
                                  ? "bg-[rgba(46,95,138,0.12)] dark:bg-[rgba(46,95,138,0.25)] border-[#2E5F8A] text-[#2E5F8A] dark:text-[#8DB4D9]"
                                  : "bg-[#FFFFFF] dark:bg-[#222222] border-[#D6CEBE] dark:border-[#38342C] text-[#5E5A52] dark:text-[#B8B3A8] hover:bg-[#FAF6ED] dark:hover:bg-[#2A2A2A]"
                              }`}
                            >
                              <Truck size={15} />
                              <span>{item.dimuat ? "Dimuat" : "Belum"}</span>
                            </button>
                            {item.dimuat_pada && (
                              <span className="block text-[10px] text-[#8A857B] mt-1 flex items-center justify-center gap-1">
                                <Clock size={10} />
                                {formatTimestamp(item.dimuat_pada)}
                              </span>
                            )}
                          </td>

                          {/* Penanda KEMBALI */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleToggleKembali(item)}
                              disabled={isPending}
                              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                                item.kembali
                                  ? "bg-[rgba(47,122,75,0.14)] dark:bg-[rgba(47,122,75,0.25)] border-[#2F7A4B] text-[#2F7A4B] dark:text-[#7FD39B]"
                                  : isKrusial
                                  ? "bg-[rgba(177,60,48,0.12)] dark:bg-[rgba(177,60,48,0.25)] border-[#B13C30] dark:border-[#B13C30] text-[#B13C30] dark:text-[#FFA39E] hover:bg-[rgba(177,60,48,0.18)]"
                                  : "bg-[#FFFFFF] dark:bg-[#222222] border-[#D6CEBE] dark:border-[#38342C] text-[#5E5A52] dark:text-[#B8B3A8] hover:bg-[#FAF6ED] dark:hover:bg-[#2A2A2A]"
                              }`}
                            >
                              <CheckCircle2 size={15} />
                              <span>{item.kembali ? "Kembali" : "Belum"}</span>
                            </button>
                            {item.kembali_pada && (
                              <span className="block text-[10px] text-[#8A857B] mt-1 flex items-center justify-center gap-1">
                                <Clock size={10} />
                                {formatTimestamp(item.kembali_pada)}
                              </span>
                            )}
                          </td>

                          {/* Ringkasan Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {item.kembali ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(47,122,75,0.14)] dark:bg-[rgba(47,122,75,0.25)] text-[#2F7A4B] dark:text-[#7FD39B]">
                                <CheckCircle2 size={12} />
                                Selesai
                              </span>
                            ) : item.dimuat ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(177,60,48,0.14)] dark:bg-[rgba(177,60,48,0.25)] text-[#B13C30] dark:text-[#FFA39E]">
                                <AlertTriangle size={12} />
                                Di Luar
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] text-[#8A857B] dark:text-[#B8B3A8]">
                                Menunggu
                              </span>
                            )}
                          </td>

                          {/* Aksi Hapus */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id, item.nama_barang)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-[#8A857B] hover:text-[#B13C30] hover:bg-[#FAF6ED] dark:hover:bg-[#282828] transition-colors cursor-pointer"
                              title="Hapus barang"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL DIALOG SINKRONISASI BARANG KE ACARA TERPILIH                        */}
      {/* ========================================================================= */}
      {syncConfirmOpen && activePackage && currentBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[rgba(238,177,0,0.15)] text-[#EEB100] flex items-center justify-center shrink-0">
                <RotateCcw size={20} />
              </div>
              <div>
                <h3 className="font-sans text-lg font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                  Sinkronkan Barang Paket ke Acara
                </h3>
                <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-0.5">
                  Terapkan daftar barang standar <strong className="text-[#EEB100]">{activePackage.nama}</strong> ({activePackage.templates.length} barang) ke acara <strong className="text-[#1A1A1A] dark:text-[#F5EDDC]">{currentBooking.nama_pelanggan}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleApplyPackageToBooking("append")}
                disabled={isTemplateLoading}
                className="w-full p-4 rounded-xl border-2 border-[#D4AD5C] bg-[#FFFDF9] dark:bg-[#252525] text-left hover:bg-[#FAF6ED] dark:hover:bg-[#2A261F] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#F5EDDC] group-hover:text-[#EEB100]">
                    1. Gabungkan (Rekomendasi)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(238,177,0,0.2)] text-[#EEB100]">
                    Aman
                  </span>
                </div>
                <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-1">
                  Hanya menambahkan barang fix dari paket yang belum ada di acara ini. Barang kustom atau catatan yang sudah ada tidak akan hilang.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPackageToBooking("replace")}
                disabled={isTemplateLoading}
                className="w-full p-4 rounded-xl border border-[#E5DEC9] dark:border-[#38342C] bg-[#FFFFFF] dark:bg-[#202020] text-left hover:border-[#B13C30] hover:bg-[#FFF5F5] dark:hover:bg-[#2D1B1B] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#F5EDDC] group-hover:text-[#B13C30]">
                    2. Ganti Semua (Reset Ulang)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[rgba(177,60,48,0.15)] text-[#B13C30]">
                    Hati-hati
                  </span>
                </div>
                <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-1">
                  Menghapus seluruh daftar barang acara ini dan menggantinya persis dengan {activePackage.templates.length} barang standar dari {activePackage.nama}.
                </p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSyncConfirmOpen(false)}
                disabled={isTemplateLoading}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KELOLA MASTER BARANG SESUAI PAKET (Checklist Templates)             */}
      {/* ========================================================================= */}
      {isPackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
          <div className="w-full h-full max-w-[1550px] max-h-[94vh] flex flex-col bg-[#FFFFFF] dark:bg-[#181818] border border-[#E5DEC9] dark:border-[#38342C] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header Bar */}
            <div className="px-5 py-3.5 border-b border-[#E5DEC9] dark:border-[#332F28] flex items-center justify-between bg-[#FAF6ED] dark:bg-[#202020] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[rgba(238,177,0,0.18)] text-[#EEB100] flex items-center justify-center shrink-0 shadow-xs">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-sans text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                      Kelola Master Barang per Paket
                    </h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E5DEC9] dark:bg-[#332F28] text-[#5E5A52] dark:text-[#A8A296]">
                      {packages.length} Paket Standar
                    </span>
                  </div>
                  <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] hidden sm:block">
                    Daftar perlengkapan fix yang otomatis menjadi checklist dasar saat pesanan dibuat
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentBooking && (
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[rgba(47,122,75,0.12)] border border-[rgba(47,122,75,0.3)] text-xs text-[#2F7A4B] dark:text-[#6EE7B7]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                    <span>Acara Terbuka: <strong className="font-bold">{currentBooking.nama_pelanggan}</strong></span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsPackageModalOpen(false);
                    setEditingTemplateId(null);
                    setTemplateFeedback(null);
                  }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#E5DEC9] dark:hover:bg-[#332F28] transition-colors cursor-pointer"
                  title="Tutup dialog (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Notification Feedback Toast */}
            {templateFeedback && (
              <div className="px-5 py-2.5 bg-[rgba(47,122,75,0.12)] border-b border-[rgba(47,122,75,0.3)] text-xs text-[#2F7A4B] dark:text-[#6EE7B7] flex items-center justify-between shrink-0 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{templateFeedback}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTemplateFeedback(null)}
                  className="font-bold cursor-pointer hover:opacity-80"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Split Screen Master-Detail Workspace */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
              {/* LEFT SIDEBAR: Daftar Paket */}
              <div className="w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-[#E5DEC9] dark:border-[#332F28] bg-[#FAF8F3] dark:bg-[#1E1E1E] flex flex-col min-h-0">
                <div className="px-4 py-3 border-b border-[#E5DEC9] dark:border-[#332F28] flex items-center justify-between bg-[#F4EFE6] dark:bg-[#252525] shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5E5A52] dark:text-[#A8A296]">
                    Pilih Paket Era Waluyo
                  </span>
                  <span className="text-[11px] font-semibold text-[#8A857B] dark:text-[#A8A296]">
                    {packages.length} Paket
                  </span>
                </div>

                {/* Vertical Scrollable Package List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                  {packages.map((pkg) => {
                    const isActive = pkg.id === activePackageId;
                    const isCurrentBookingPackage = currentBooking?.package_id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handleSelectPackageTab(pkg.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isActive
                            ? "bg-[#2A2721] border-[#EEB100] text-[#F5EDDC] shadow-md ring-1 ring-[#EEB100]"
                            : "bg-[#FFFFFF] dark:bg-[#252525] border-[#E5DEC9] dark:border-[#332F28] text-[#1A1A1A] dark:text-[#EAE5D9] hover:border-[#D4AD5C] hover:bg-[#FFFDF9] dark:hover:bg-[#2B2B2B]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs sm:text-sm tracking-tight truncate">
                            {pkg.nama}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isActive
                                ? "bg-[#EEB100] text-[#1A1A1A]"
                                : "bg-[#FAF6ED] dark:bg-[#332F28] text-[#5E5A52] dark:text-[#A8A296] border border-[#E5DEC9] dark:border-transparent"
                            }`}
                          >
                            {pkg.templates.length}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-semibold text-[11px] ${
                              isActive ? "text-[#EEB100]" : "text-[#B38300] dark:text-[#E5B53A]"
                            }`}
                          >
                            Rp {pkg.harga_dasar.toLocaleString("id-ID")}
                          </span>
                          {isCurrentBookingPackage && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[rgba(47,122,75,0.2)] text-[#2F7A4B] dark:text-[#6EE7B7] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                              Acara Ini
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Sidebar Bottom: Paket Actions */}
                {activePackage && (
                  <div className="p-3 border-t border-[#E5DEC9] dark:border-[#332F28] bg-[#F5EFE1]/80 dark:bg-[#181818] space-y-2 shrink-0">
                    <p className="text-[11px] text-[#5E5A52] dark:text-[#A8A296] line-clamp-2">
                      {activePackage.deskripsi || "Paket pernikahan Era Waluyo Purwokerto"}
                    </p>

                    {currentBooking && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSyncConfirmOpen(true)}
                        disabled={isTemplateLoading || activePackage.templates.length === 0}
                        className="w-full text-xs gap-1.5 border-[#D4AD5C] bg-[#FFFFFF] dark:bg-[#202020] text-[#EEB100] hover:bg-[#FAF6ED] font-semibold h-8"
                        title="Terapkan barang paket ini ke checklist acara yang sedang dibuka"
                      >
                        <RotateCcw size={12} />
                        <span className="truncate">Terapkan ke Acara ({currentBooking.nama_pelanggan})</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResetPackageTemplate(activePackage.id)}
                      disabled={isTemplateLoading}
                      className="w-full text-xs text-[#8A857B] hover:text-[#B13C30] hover:bg-[#FAF6ED] dark:hover:bg-[#252525] gap-1.5 h-7"
                      title="Kembalikan daftar barang ke template standar Era Waluyo"
                    >
                      <RefreshCw size={11} />
                      <span>Reset Standar Era Waluyo</span>
                    </Button>
                  </div>
                )}
              </div>

              {/* RIGHT MAIN PANEL: Master Barang per Kategori */}
              <div className="flex-1 flex flex-col min-h-0 bg-[#FFFFFF] dark:bg-[#161616] overflow-hidden">
                {activePackage ? (
                  <>
                    {/* Top Action Bar: Search & Quick Info */}
                    <div className="px-4 sm:px-5 py-3 border-b border-[#E5DEC9] dark:border-[#2D2A24] bg-[#FFFDF9] dark:bg-[#1B1B1B] flex flex-wrap items-center justify-between gap-3 shrink-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-sans text-sm sm:text-base font-bold text-[#1A1A1A] dark:text-[#F5EDDC] flex items-center gap-2">
                          <span>{activePackage.nama}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EEB100]/20 text-[#EEB100] border border-[#EEB100]/30">
                            {activePackage.templates.length} Barang
                          </span>
                        </h3>
                      </div>

                      {/* Search items inside this package */}
                      <div className="relative w-64 max-w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A857B]" />
                        <input
                          type="text"
                          value={templateSearchQuery}
                          onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          placeholder="Cari barang di paket ini..."
                          className="w-full h-8 pl-8 pr-7 bg-[#FAF6ED] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs text-[#1A1A1A] dark:text-[#F5EDDC] placeholder:text-[#8A857B] focus:outline-none focus:border-[#EEB100]"
                        />
                        {templateSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setTemplateSearchQuery("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8A857B] hover:text-[#1A1A1A] cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category Filter Pills (Horizontal Scrollable if needed) */}
                    <div className="px-4 sm:px-5 py-2 border-b border-[#E5DEC9] dark:border-[#2D2A24] bg-[#FAF8F4] dark:bg-[#1E1E1E] flex items-center gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
                      <button
                        type="button"
                        onClick={() => setTemplateCategoryTab("semua")}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors ${
                          templateCategoryTab === "semua"
                            ? "bg-[#2A2721] text-[#F5EDDC] ring-1 ring-[#EEB100]"
                            : "bg-[#FFFFFF] dark:bg-[#282828] text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] border border-[#E5DEC9] dark:border-[#38342C]"
                        }`}
                      >
                        Semua ({activePackage.templates.length})
                      </button>

                      {STANDARD_CATEGORIES.map((cat) => {
                        const count = activePackageCategoryCounts.get(cat) || 0;
                        if (count === 0 && templateCategoryTab !== cat) return null;
                        const isCatActive = templateCategoryTab === cat;
                        return (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTemplateCategoryTab(cat)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 ${
                              isCatActive
                                ? "bg-[#2A2721] text-[#F5EDDC] ring-1 ring-[#EEB100]"
                                : "bg-[#FFFFFF] dark:bg-[#282828] text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] border border-[#E5DEC9] dark:border-[#38342C]"
                            }`}
                          >
                            <span>{cat}</span>
                            <span className="text-[10px] opacity-75 font-bold">({count})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Quick Add Bar (Compact 1 Row) */}
                    <form
                      onSubmit={handleAddNewTemplateItem}
                      className="px-4 sm:px-5 py-2.5 border-b border-[#E5DEC9] dark:border-[#2D2A24] bg-[#FFFDF9] dark:bg-[#1C1C1C] flex flex-col sm:flex-row gap-2 items-center shrink-0"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A1A1A] dark:text-[#F5EDDC] shrink-0">
                        <Plus size={14} className="text-[#EEB100]" />
                        <span>Tambah:</span>
                      </div>
                      <select
                        value={newTemplateCategory}
                        onChange={(e) => setNewTemplateCategory(e.target.value)}
                        className="h-8 px-2.5 bg-[#FAF6ED] dark:bg-[#282828] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100] shrink-0 cursor-pointer w-full sm:w-auto"
                      >
                        {STANDARD_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        value={newTemplateItemName}
                        onChange={(e) => setNewTemplateItemName(e.target.value)}
                        placeholder={`Ketik nama barang baru untuk ${activePackage.nama}...`}
                        className="flex-1 w-full h-8 px-3 bg-[#FAF6ED] dark:bg-[#282828] border border-[#D6CEBE] dark:border-[#38342C] rounded-lg text-xs text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100]"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isTemplateLoading || !newTemplateItemName.trim()}
                        className="shrink-0 h-8 text-xs px-3.5 w-full sm:w-auto"
                      >
                        <Plus size={13} className="mr-1" />
                        Tambah
                      </Button>
                    </form>

                    {/* Multi-Column Responsive Grid of Categories */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar">
                      {groupedTemplates.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-[#E5DEC9] dark:border-[#38342C] rounded-xl space-y-3">
                          <PackageIcon size={24} className="mx-auto text-[#8A857B]" />
                          <p className="text-xs text-[#5E5A52] dark:text-[#A8A296]">
                            {templateSearchQuery
                              ? `Tidak ada barang yang cocok dengan pencarian "${templateSearchQuery}".`
                              : "Belum ada daftar barang fix untuk paket/kategori ini."}
                          </p>
                          {templateSearchQuery ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setTemplateSearchQuery("")}
                              className="text-xs"
                            >
                              Reset Pencarian
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetPackageTemplate(activePackage.id)}
                              disabled={isTemplateLoading}
                              className="text-xs"
                            >
                              Muat Rekomendasi Standar Era Waluyo
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">
                          {groupedTemplates.map((grp) => {
                            const style = getCategoryBadgeStyle(grp.category);
                            return (
                              <div
                                key={grp.category}
                                className="rounded-xl border border-[#E5DEC9] dark:border-[#332F28] bg-[#FAF8F4]/50 dark:bg-[#1E1E1E] overflow-hidden shadow-xs flex flex-col"
                              >
                                {/* Category Card Header */}
                                <div className="px-3.5 py-2.5 border-b border-[#E5DEC9] dark:border-[#2D2A24] bg-[#FAF6ED] dark:bg-[#252525] flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                                    <h4 className="font-sans text-xs font-bold text-[#1A1A1A] dark:text-[#F5EDDC] uppercase tracking-wide">
                                      {grp.category}
                                    </h4>
                                  </div>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                                  >
                                    {grp.items.length} Barang
                                  </span>
                                </div>

                                {/* Category Items List */}
                                <div className="divide-y divide-[#F0EBE1] dark:divide-[#282622] bg-[#FFFFFF] dark:bg-[#202020]">
                                  {grp.items.map((tmpl) => {
                                    const isEditing = editingTemplateId === tmpl.id;
                                    const parsed = parseItemName(tmpl.nama_barang);
                                    return (
                                      <div
                                        key={tmpl.id}
                                        className="px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs hover:bg-[#FAF6ED] dark:hover:bg-[#252525] transition-colors group"
                                      >
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                          <span className="w-2.5 text-center text-[#EEB100] font-bold text-sm shrink-0 leading-none">
                                            •
                                          </span>

                                          {isEditing ? (
                                            <input
                                              type="text"
                                              value={editingTemplateName}
                                              onChange={(e) => setEditingTemplateName(e.target.value)}
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveEditTemplate(tmpl);
                                                if (e.key === "Escape") setEditingTemplateId(null);
                                              }}
                                              className="flex-1 h-7 px-2 bg-[#FFFFFF] dark:bg-[#282828] border border-[#EEB100] rounded text-xs text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none"
                                            />
                                          ) : (
                                            <span className="font-medium text-[#1A1A1A] dark:text-[#F5EDDC] truncate" title={parsed.name}>
                                              {parsed.name}
                                            </span>
                                          )}
                                        </div>

                                        <div className="flex items-center gap-0.5 shrink-0">
                                          {isEditing ? (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => handleSaveEditTemplate(tmpl)}
                                                disabled={isTemplateLoading}
                                                className="p-1 rounded text-[#2F7A4B] hover:bg-[rgba(47,122,75,0.15)] transition-colors cursor-pointer"
                                                title="Simpan perubahan nama"
                                              >
                                                <Check size={13} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setEditingTemplateId(null)}
                                                disabled={isTemplateLoading}
                                                className="p-1 rounded text-[#8A857B] hover:bg-[#E5DEC9] transition-colors cursor-pointer"
                                                title="Batal edit"
                                              >
                                                <X size={13} />
                                              </button>
                                            </>
                                          ) : (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingTemplateId(tmpl.id);
                                                  setEditingTemplateName(tmpl.nama_barang);
                                                }}
                                                disabled={isTemplateLoading}
                                                className="p-1 rounded text-[#8A857B] hover:text-[#EEB100] hover:bg-[#FAF6ED] dark:hover:bg-[#282828] transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                                                title="Ubah nama barang"
                                              >
                                                <Edit3 size={12} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleDeleteTemplateItem(tmpl)}
                                                disabled={isTemplateLoading}
                                                className="p-1 rounded text-[#8A857B] hover:text-[#B13C30] hover:bg-[rgba(177,60,48,0.1)] transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                                                title="Hapus dari template"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-[#8A857B]">
                    Pilih salah satu paket di sisi kiri untuk mulai mengelola daftar perlengkapan standar.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-[#E5DEC9] dark:border-[#332F28] flex items-center justify-between bg-[#FAF6ED] dark:bg-[#202020] shrink-0">
              <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296] hidden sm:inline">
                💡 Master template otomatis diterapkan pada pesanan baru yang memilih paket tersebut.
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsPackageModalOpen(false);
                    setEditingTemplateId(null);
                    setTemplateFeedback(null);
                  }}
                  className="px-5 text-xs font-semibold"
                >
                  Selesai
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
