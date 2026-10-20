"use client";

import React, { useState, useMemo, useTransition } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateChecklistPdf } from "@/lib/pdf/checklist-pdf";
import {
  ChecklistItemData,
  ChecklistBookingOption,
  toggleItemDimuat,
  toggleItemKembali,
  addChecklistItem,
  deleteChecklistItem,
  bulkUpdateChecklist,
  getChecklistItems,
} from "@/lib/actions/checklist";

interface ChecklistClientProps {
  bookings: ChecklistBookingOption[];
  initialItems: ChecklistItemData[];
  initialSelectedBookingId: string | null;
}

export default function ChecklistClient({
  bookings,
  initialItems,
  initialSelectedBookingId,
}: ChecklistClientProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    initialSelectedBookingId || (bookings.length > 0 ? bookings[0].id : "")
  );
  const [items, setItems] = useState<ChecklistItemData[]>(initialItems);
  const [filterTab, setFilterTab] = useState<"semua" | "belum_dimuat" | "belum_kembali" | "kembali">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // State tambah barang baru
  const [isAdding, setIsAdding] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  // Ambil detail booking yang sedang aktif dipilih
  const currentBooking = useMemo(() => {
    return bookings.find((b) => b.id === selectedBookingId) || null;
  }, [bookings, selectedBookingId]);

  // Ganti booking terpilih
  const handleSelectBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setActionError(null);
    startTransition(async () => {
      const fetched = await getChecklistItems(bookingId);
      setItems(fetched);
    });
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

  // Filter daftar item
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
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
  }, [items, filterTab, searchQuery]);

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
            onClick={handleDownloadPdf}
            disabled={!currentBooking || items.length === 0}
            className="gap-2 bg-[#FFFFFF]"
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
            className="gap-2 bg-[#FFFFFF] border-[#D4AD5C] text-[#8A6A22] hover:bg-[#FAF6ED]"
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
          <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] text-[#8A6A22] flex items-center justify-center">
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
          <Card className="p-5 sm:p-6 bg-[#FFFFFF] border border-[#E5DEC9] space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
              <div className="space-y-1.5 flex-1 max-w-xl">
                <label className="block text-xs font-semibold text-[#8A6A22] uppercase tracking-wider">
                  Pilih Jadwal Acara Pernikahan
                </label>
                <div className="relative">
                  <select
                    value={selectedBookingId}
                    onChange={(e) => handleSelectBooking(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 bg-[#FAF6ED] border border-[#D6CEBE] rounded-xl text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] cursor-pointer appearance-none shadow-sm"
                  >
                    {bookings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.tanggal_acara} — {b.nama_pelanggan} ({b.packages?.nama || "Paket Khusus"})
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5E5A52] pointer-events-none"
                  />
                </div>
              </div>

              {currentBooking && (
                <div className="flex items-center gap-3">
                  <Link
                    href={`/booking/${currentBooking.id}`}
                    className="text-xs font-semibold text-[#8A6A22] hover:text-[#A67C24] inline-flex items-center gap-1.5 py-2 px-3 rounded-lg border border-[#E5DEC9] bg-[#FAF6ED]"
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
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] border border-[#E5DEC9]">
                  <Calendar size={18} className="text-[#8A6A22] shrink-0" />
                  <div>
                    <span className="text-[#8A857B] block text-[11px]">Tanggal Acara</span>
                    <strong className="text-[#1A1A1A] text-sm font-semibold">
                      {currentBooking.tanggal_acara}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] border border-[#E5DEC9]">
                  <MapPin size={18} className="text-[#8A6A22] shrink-0" />
                  <div className="truncate">
                    <span className="text-[#8A857B] block text-[11px]">Lokasi Acara</span>
                    <strong className="text-[#1A1A1A] text-sm font-semibold truncate block">
                      {currentBooking.lokasi}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF6ED] border border-[#E5DEC9]">
                  <PackageIcon size={18} className="text-[#8A6A22] shrink-0" />
                  <div className="truncate">
                    <span className="text-[#8A857B] block text-[11px]">Paket Acara</span>
                    <strong className="text-[#1A1A1A] text-sm font-semibold truncate block">
                      {currentBooking.packages?.nama || "Paket Khusus Era Waluyo"}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 4 Ringkasan Kelengkapan Barang Sesuai PRD (Disorot untuk Belum Kembali) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Barang */}
            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#5E5A52]">Total Barang</span>
                <CheckSquare size={18} className="text-[#8A6A22]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#1A1A1A]">
                  {stats.total}
                </div>
                <p className="mt-1 text-xs text-[#8A857B]">Daftar perlengkapan acara</p>
              </div>
            </Card>

            {/* Sudah Dimuat */}
            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#5E5A52]">Sudah Dimuat</span>
                <Truck size={18} className="text-[#2E5F8A]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#2E5F8A] flex items-baseline gap-2">
                  <span>{stats.sudahDimuat}</span>
                  <span className="text-xs font-semibold text-[#5E5A52]">
                    ({stats.persenDimuat}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8A857B]">Siap / dibawa ke lokasi</p>
              </div>
            </Card>

            {/* Sudah Kembali */}
            <Card className="p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#5E5A52]">Sudah Kembali</span>
                <CheckCircle2 size={18} className="text-[#2F7A4B]" />
              </div>
              <div className="mt-3">
                <div className="text-3xl font-sans font-bold text-[#2F7A4B] flex items-baseline gap-2">
                  <span>{stats.sudahKembali}</span>
                  <span className="text-xs font-semibold text-[#5E5A52]">
                    ({stats.persenKembali}%)
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8A857B]">Tiba aman di galeri Era Waluyo</p>
              </div>
            </Card>

            {/* DISOROT KHUSUS: Belum Kembali */}
            <Card
              className={`p-5 flex flex-col justify-between transition-all ${
                stats.totalBelumKembali > 0
                  ? "bg-[rgba(177,60,48,0.06)] border-[#B13C30] shadow-sm"
                  : "bg-[#FFFFFF] border-[#E5DEC9]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    stats.totalBelumKembali > 0 ? "text-[#B13C30]" : "text-[#5E5A52]"
                  }`}
                >
                  Belum Kembali
                </span>
                <AlertTriangle
                  size={18}
                  className={
                    stats.totalBelumKembali > 0
                      ? "text-[#B13C30] animate-pulse"
                      : "text-[#8A857B]"
                  }
                />
              </div>
              <div className="mt-3">
                <div
                  className={`text-3xl font-sans font-bold ${
                    stats.totalBelumKembali > 0 ? "text-[#B13C30]" : "text-[#2F7A4B]"
                  }`}
                >
                  {stats.totalBelumKembali}
                </div>
                <p
                  className={`mt-1 text-xs font-medium ${
                    stats.totalBelumKembali > 0
                      ? "text-[#B13C30]"
                      : "text-[#2F7A4B]"
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
                    <Sparkles size={16} className="text-[#8A6A22]" />
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
                    className="flex-1 h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] shadow-sm"
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

          {/* Control Bar: Filter Tabs, Pencarian & Aksi Massal */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF6ED] rounded-xl border border-[#E5DEC9]">
              <button
                onClick={() => setFilterTab("semua")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === "semua"
                    ? "bg-[#2C2C2C] text-[#F5EDDC] shadow-sm"
                    : "text-[#5E5A52] hover:text-[#1A1A1A]"
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                onClick={() => setFilterTab("belum_dimuat")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === "belum_dimuat"
                    ? "bg-[#2C2C2C] text-[#F5EDDC] shadow-sm"
                    : "text-[#5E5A52] hover:text-[#1A1A1A]"
                }`}
              >
                Belum Dimuat ({items.filter((i) => !i.dimuat).length})
              </button>
              <button
                onClick={() => setFilterTab("belum_kembali")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === "belum_kembali"
                    ? "bg-[#B13C30] text-[#FFFFFF] shadow-sm"
                    : "text-[#B13C30] hover:opacity-80"
                }`}
              >
                Belum Kembali ({stats.totalBelumKembali})
              </button>
              <button
                onClick={() => setFilterTab("kembali")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filterTab === "kembali"
                    ? "bg-[#2F7A4B] text-[#FFFFFF] shadow-sm"
                    : "text-[#2F7A4B] hover:opacity-80"
                }`}
              >
                Selesai Kembali ({items.filter((i) => i.kembali).length})
              </button>
            </div>

            {/* Search Input & Bulk Action */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 px-3.5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-lg text-xs text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] shadow-sm w-44 sm:w-56"
              />

              {/* Tombol Aksi Massal */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("dimuat_all")}
                  disabled={isPending || items.length === 0}
                  className="text-xs h-9 bg-[#FFFFFF] text-[#2E5F8A]"
                  title="Tandai semua barang sebagai sudah dimuat"
                >
                  <Truck size={14} className="mr-1" />
                  Semua Dimuat
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("kembali_all")}
                  disabled={isPending || items.length === 0}
                  className="text-xs h-9 bg-[#FFFFFF] text-[#2F7A4B]"
                  title="Tandai semua barang sebagai sudah kembali"
                >
                  <CheckCircle2 size={14} className="mr-1" />
                  Semua Kembali
                </Button>

                <button
                  onClick={() => handleBulkAction("reset_all")}
                  disabled={isPending || items.length === 0}
                  className="p-2 rounded-lg text-[#8A857B] hover:text-[#B13C30] hover:bg-[#F5EDDC] transition-colors cursor-pointer"
                  title="Reset status tanda checklist"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
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
                    className="text-xs text-[#8A6A22] font-semibold underline"
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
                          className={`transition-colors hover:bg-[#FFFDF9] ${
                            isKrusial ? "bg-[rgba(177,60,48,0.02)]" : ""
                          }`}
                        >
                          {/* Nomor Urut */}
                          <td className="py-3.5 px-4 text-center text-xs text-[#8A857B] font-mono">
                            {index + 1}
                          </td>

                          {/* Nama Barang */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-[#1A1A1A] block">
                              {item.nama_barang}
                            </span>
                            {isKrusial && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#B13C30] font-medium mt-0.5">
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
                                  ? "bg-[rgba(46,95,138,0.12)] border-[#2E5F8A] text-[#2E5F8A]"
                                  : "bg-[#FFFFFF] border-[#D6CEBE] text-[#5E5A52] hover:bg-[#FAF6ED]"
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
                                  ? "bg-[rgba(47,122,75,0.14)] border-[#2F7A4B] text-[#2F7A4B]"
                                  : isKrusial
                                  ? "bg-[rgba(177,60,48,0.12)] border-[#B13C30] text-[#B13C30] hover:bg-[rgba(177,60,48,0.18)]"
                                  : "bg-[#FFFFFF] border-[#D6CEBE] text-[#5E5A52] hover:bg-[#FAF6ED]"
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
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(47,122,75,0.14)] text-[#2F7A4B]">
                                <CheckCircle2 size={12} />
                                Selesai
                              </span>
                            ) : item.dimuat ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[rgba(177,60,48,0.14)] text-[#B13C30]">
                                <AlertTriangle size={12} />
                                Di Luar
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FAF6ED] border border-[#E5DEC9] text-[#8A857B]">
                                Menunggu
                              </span>
                            )}
                          </td>

                          {/* Aksi Hapus */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteItem(item.id, item.nama_barang)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-[#8A857B] hover:text-[#B13C30] hover:bg-[#FAF6ED] transition-colors cursor-pointer"
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
    </div>
  );
}
