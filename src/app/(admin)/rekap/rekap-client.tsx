"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Search,
  Filter,
  RotateCcw,
  TrendingUp,
  PackageCheck,
  Wallet,
  ExternalLink,
  CalendarRange,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { BookingStatus } from "@/types";

interface PackageItem {
  id: string;
  nama: string;
  harga_dasar: number | null;
  deskripsi?: string | null;
  aktif?: boolean | null;
}

interface BookingItem {
  id: string;
  nama_pelanggan: string;
  no_wa: string;
  tanggal_acara: string;
  lokasi: string;
  package_id: string | null;
  kebaya_baju?: string | null;
  ukuran?: string | null;
  dekorasi?: string | null;
  mc?: string | null;
  makeup?: string | null;
  fotografer?: string | null;
  video?: string | null;
  hiburan?: string | null;
  catatan_khusus?: string | null;
  dp_nominal: number | null;
  dp_diterima: boolean | null;
  status: BookingStatus | string | null;
  token_konfirmasi?: string | null;
  dikonfirmasi_pada?: string | null;
  dibuat_pada?: string | null;
  packages: PackageItem | null;
}

interface RekapClientProps {
  initialBookings: BookingItem[];
  packages: PackageItem[];
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function RekapClient({
  initialBookings,
  packages,
}: RekapClientProps) {
  // State Filter
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDp, setSelectedDp] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"bulanan" | "paket" | "status">("bulanan");

  // Dapatkan daftar tahun unik dari data booking
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);

    initialBookings.forEach((b) => {
      if (b.tanggal_acara) {
        const y = new Date(b.tanggal_acara).getFullYear().toString();
        years.add(y);
      }
    });

    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [initialBookings]);

  // Quick Preset Handlers
  const handlePresetAll = () => {
    setSelectedYear("all");
    setSelectedMonth("all");
    setStartDate("");
    setEndDate("");
    setSelectedPackage("all");
    setSelectedStatus("all");
    setSelectedDp("all");
    setSearch("");
  };

  const handlePresetThisMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear().toString());
    setSelectedMonth(now.getMonth().toString());
    setStartDate("");
    setEndDate("");
  };

  const handlePresetThisYear = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear().toString());
    setSelectedMonth("all");
    setStartDate("");
    setEndDate("");
  };

  // Filter Data Booking
  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      const eventDate = new Date(b.tanggal_acara);
      const eventYear = eventDate.getFullYear().toString();
      const eventMonth = eventDate.getMonth().toString();

      // Search match
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = b.nama_pelanggan.toLowerCase().includes(query);
        const matchWa = b.no_wa.includes(query);
        const matchLoc = b.lokasi?.toLowerCase().includes(query);
        if (!matchName && !matchWa && !matchLoc) return false;
      }

      // Filter Rentang Tanggal Kustom
      if (startDate && b.tanggal_acara < startDate) return false;
      if (endDate && b.tanggal_acara > endDate) return false;

      // Filter Tahun & Bulan (jika rentang kustom tidak aktif)
      if (!startDate && !endDate) {
        if (selectedYear !== "all" && eventYear !== selectedYear) return false;
        if (selectedMonth !== "all" && eventMonth !== selectedMonth) return false;
      }

      // Filter Paket
      if (selectedPackage !== "all") {
        if (selectedPackage === "custom") {
          if (b.package_id !== null) return false;
        } else if (b.package_id !== selectedPackage) {
          return false;
        }
      }

      // Filter Status Konfirmasi
      if (selectedStatus !== "all" && b.status !== selectedStatus) {
        return false;
      }

      // Filter Status DP
      if (selectedDp !== "all") {
        const isDiterima = b.dp_diterima === true;
        if (selectedDp === "diterima" && !isDiterima) return false;
        if (selectedDp === "belum" && isDiterima) return false;
      }

      return true;
    });
  }, [
    initialBookings,
    search,
    selectedYear,
    selectedMonth,
    startDate,
    endDate,
    selectedPackage,
    selectedStatus,
    selectedDp,
  ]);

  // Statistik & Metrik Utama
  const metrics = useMemo(() => {
    const totalAcara = filteredBookings.length;
    let totalDpMasuk = 0;
    let totalEstimasiOmzet = 0;
    let totalDikonfirmasi = 0;
    let totalBelumDikonfirmasi = 0;
    let totalPerluKoreksi = 0;
    let totalDibatalkan = 0;

    filteredBookings.forEach((b) => {
      if (b.dp_diterima) {
        totalDpMasuk += Number(b.dp_nominal || 0);
      }
      if (b.packages?.harga_dasar) {
        totalEstimasiOmzet += Number(b.packages.harga_dasar);
      }
      if (b.status === "dikonfirmasi") totalDikonfirmasi++;
      else if (b.status === "belum_dikonfirmasi") totalBelumDikonfirmasi++;
      else if (b.status === "perlu_koreksi") totalPerluKoreksi++;
      else if (b.status === "dibatalkan") totalDibatalkan++;
    });

    const konfirmasiRate =
      totalAcara > 0 ? Math.round((totalDikonfirmasi / totalAcara) * 100) : 0;

    return {
      totalAcara,
      totalDpMasuk,
      totalEstimasiOmzet,
      totalDikonfirmasi,
      totalBelumDikonfirmasi,
      totalPerluKoreksi,
      totalDibatalkan,
      konfirmasiRate,
    };
  }, [filteredBookings]);

  // Rekap Bulanan (Per Bulan Januari - Desember)
  const monthlyBreakdown = useMemo(() => {
    const monthsData = Array.from({ length: 12 }, (_, i) => ({
      index: i,
      name: MONTH_NAMES[i],
      count: 0,
      totalDp: 0,
    }));

    filteredBookings.forEach((b) => {
      const monthIdx = new Date(b.tanggal_acara).getMonth();
      if (monthIdx >= 0 && monthIdx < 12) {
        monthsData[monthIdx].count += 1;
        if (b.dp_diterima) {
          monthsData[monthIdx].totalDp += Number(b.dp_nominal || 0);
        }
      }
    });

    const maxCount = Math.max(...monthsData.map((m) => m.count), 1);
    const busiestMonth = [...monthsData].sort((a, b) => b.count - a.count)[0];

    return {
      months: monthsData,
      maxCount,
      busiestMonth: busiestMonth.count > 0 ? busiestMonth : null,
    };
  }, [filteredBookings]);

  // Rekap Per Paket Acara
  const packageBreakdown = useMemo(() => {
    const pkgMap = new Map<
      string,
      {
        id: string;
        nama: string;
        count: number;
        hargaDasar: number;
        totalDp: number;
      }
    >();

    // Inisialisasi daftar paket master
    packages.forEach((p) => {
      pkgMap.set(p.id, {
        id: p.id,
        nama: p.nama,
        count: 0,
        hargaDasar: Number(p.harga_dasar || 0),
        totalDp: 0,
      });
    });

    // Opsi untuk Custom / Tanpa Paket
    pkgMap.set("custom", {
      id: "custom",
      nama: "Custom / Tanpa Paket Terdaftar",
      count: 0,
      hargaDasar: 0,
      totalDp: 0,
    });

    filteredBookings.forEach((b) => {
      const key = b.package_id || "custom";
      const existing = pkgMap.get(key);
      if (existing) {
        existing.count += 1;
        if (b.dp_diterima) {
          existing.totalDp += Number(b.dp_nominal || 0);
        }
      } else {
        pkgMap.set(key, {
          id: key,
          nama: b.packages?.nama || "Paket Khusus",
          count: 1,
          hargaDasar: Number(b.packages?.harga_dasar || 0),
          totalDp: b.dp_diterima ? Number(b.dp_nominal || 0) : 0,
        });
      }
    });

    const list = Array.from(pkgMap.values()).filter((item) => item.count > 0);
    list.sort((a, b) => b.count - a.count);

    return list;
  }, [filteredBookings, packages]);

  // Rekap Per Status Konfirmasi
  const statusBreakdown = useMemo(() => {
    return [
      {
        status: "dikonfirmasi",
        label: "Dikonfirmasi Pelanggan",
        count: metrics.totalDikonfirmasi,
        badgeType: "dikonfirmasi" as const,
        description: "Pelanggan telah menyetujui rincian pesanan",
      },
      {
        status: "belum_dikonfirmasi",
        label: "Belum Dikonfirmasi",
        count: metrics.totalBelumDikonfirmasi,
        badgeType: "belum_dikonfirmasi" as const,
        description: "Menunggu pemeriksaan & konfirmasi pelanggan",
      },
      {
        status: "perlu_koreksi",
        label: "Perlu Koreksi",
        count: metrics.totalPerluKoreksi,
        badgeType: "perlu_koreksi" as const,
        description: "Ada catatan penyesuaian dari pelanggan",
      },
      {
        status: "dibatalkan",
        label: "Dibatalkan",
        count: metrics.totalDibatalkan,
        badgeType: "dibatalkan" as const,
        description: "Pesanan dibatalkan atau tidak berlanjut",
      },
    ];
  }, [metrics]);

  // Ekspor ke CSV
  const handleExportCsv = () => {
    if (filteredBookings.length === 0) {
      alert("Tidak ada data booking untuk diekspor sesuai filter saat ini.");
      return;
    }

    const headers = [
      "No",
      "Tanggal Acara",
      "Nama Pelanggan",
      "No WhatsApp",
      "Paket Acara",
      "Harga Dasar Paket",
      "Status Konfirmasi",
      "Status DP",
      "Nominal DP",
      "Lokasi Acara",
      "Catatan Khusus",
    ];

    const rows = filteredBookings.map((b, index) => {
      const packageName = b.packages?.nama || "Custom / Tanpa Paket";
      const packagePrice = b.packages?.harga_dasar || 0;
      const dpStatus = b.dp_diterima ? "Diterima" : "Belum Diterima";

      return [
        index + 1,
        `"${b.tanggal_acara}"`,
        `"${b.nama_pelanggan.replace(/"/g, '""')}"`,
        `"${b.no_wa}"`,
        `"${packageName.replace(/"/g, '""')}"`,
        packagePrice,
        `"${b.status}"`,
        `"${dpStatus}"`,
        b.dp_nominal || 0,
        `"${(b.lokasi || "").replace(/"/g, '""')}"`,
        `"${(b.catatan_khusus || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    // Tambahkan UTF-8 BOM agar Excel dapat membuka karakter khusus dengan benar
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const dateStamp = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-booking-era-waluyo-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Cetak Laporan
  const handlePrint = () => {
    window.print();
  };

  // Format label periode untuk tampilan
  const periodLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${startDate} s/d ${endDate}`;
    }
    if (selectedYear === "all" && selectedMonth === "all") {
      return "Semua Periode";
    }
    if (selectedYear !== "all" && selectedMonth !== "all") {
      return `${MONTH_NAMES[Number(selectedMonth)]} ${selectedYear}`;
    }
    if (selectedYear !== "all") {
      return `Tahun ${selectedYear}`;
    }
    return `Bulan ${MONTH_NAMES[Number(selectedMonth)]}`;
  }, [selectedYear, selectedMonth, startDate, endDate]);

  return (
    <div className="space-y-8">
      {/* =========================================================================
          PRINT ONLY HEADER (Tampil hanya saat mencetak / print to PDF)
      ========================================================================= */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4 text-black">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-wider">WEDORA — ERA WALUYO</h1>
            <p className="text-xs uppercase tracking-widest text-gray-600">
              Tata Rias & Busana Pengantin Tradisional / Modern
            </p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold">Laporan Rekapitulasi Booking & Keuangan DP</p>
            <p>Periode: {periodLabel}</p>
            <p>Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TOP HEADER & ACTIONS (Disembunyikan saat print)
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9] print:hidden">
        <div>
          <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A]">
            Rekap Booking & Pembayaran
          </h1>
          <p className="text-[14px] text-[#5E5A52] mt-1">
            Laporan bulanan, per paket, status konfirmasi, dan ringkasan pembayaran DP Era Waluyo
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleExportCsv}
            className="gap-2 text-xs md:text-sm h-10 px-4 cursor-pointer"
            title="Download spreadsheet CSV data rekap"
          >
            <Download size={16} />
            <span>Ekspor CSV</span>
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            className="gap-2 text-xs md:text-sm h-10 px-4 cursor-pointer shadow-sm"
            title="Cetak Laporan atau Simpan sebagai PDF"
          >
            <Printer size={16} />
            <span>Cetak Laporan</span>
          </Button>
        </div>
      </div>

      {/* =========================================================================
          FILTER CARD (Disembunyikan saat print)
      ========================================================================= */}
      <Card className="space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#E5DEC9] pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A1A1A]">
            <Filter size={18} className="text-[#A67C24]" />
            <span>Filter & Periode Laporan</span>
            <span className="text-xs font-normal text-[#5E5A52] ml-1">
              ({filteredBookings.length} pesanan ditemukan)
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#8A857B] font-medium mr-1">Cepat:</span>
            <button
              onClick={handlePresetAll}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedYear === "all" && selectedMonth === "all" && !startDate && !endDate
                  ? "bg-[#EEB100] text-[#111111] font-semibold"
                  : "bg-[#F5EDDC] text-[#5E5A52] hover:bg-[#EAE1CF]"
              }`}
            >
              Semua Waktu
            </button>
            <button
              onClick={handlePresetThisMonth}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedYear === new Date().getFullYear().toString() &&
                selectedMonth === new Date().getMonth().toString()
                  ? "bg-[#EEB100] text-[#111111] font-semibold"
                  : "bg-[#F5EDDC] text-[#5E5A52] hover:bg-[#EAE1CF]"
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={handlePresetThisYear}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedYear === new Date().getFullYear().toString() && selectedMonth === "all"
                  ? "bg-[#EEB100] text-[#111111] font-semibold"
                  : "bg-[#F5EDDC] text-[#5E5A52] hover:bg-[#EAE1CF]"
              }`}
            >
              Tahun Ini ({new Date().getFullYear()})
            </button>
            {(selectedYear !== "all" ||
              selectedMonth !== "all" ||
              startDate ||
              endDate ||
              selectedPackage !== "all" ||
              selectedStatus !== "all" ||
              selectedDp !== "all" ||
              search) && (
              <button
                onClick={handlePresetAll}
                className="px-2.5 py-1.5 text-xs text-[#B13C30] hover:text-[#912B20] inline-flex items-center gap-1 font-medium transition-colors ml-1 cursor-pointer"
                title="Reset semua filter"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Grid Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* 1. Tahun */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Tahun Acara
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Bulan */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Bulan Acara
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            >
              <option value="all">Semua Bulan</option>
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index.toString()}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Paket Acara */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Paket Acara
            </label>
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            >
              <option value="all">Semua Paket</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.nama}
                </option>
              ))}
              <option value="custom">Custom / Tanpa Paket</option>
            </select>
          </div>

          {/* 4. Status Konfirmasi */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Status Konfirmasi
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="dikonfirmasi">Dikonfirmasi Pelanggan</option>
              <option value="belum_dikonfirmasi">Belum Dikonfirmasi</option>
              <option value="perlu_koreksi">Perlu Koreksi</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* Baris Kedua: Status DP, Rentang Tanggal Kustom & Pencarian Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-[#F2ECE1]">
          {/* Status DP */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Status DP
            </label>
            <select
              value={selectedDp}
              onChange={(e) => setSelectedDp(e.target.value)}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            >
              <option value="all">Semua Status DP</option>
              <option value="diterima">DP Diterima</option>
              <option value="belum">DP Belum Diterima</option>
            </select>
          </div>

          {/* Dari Tanggal */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Dari Tanggal (Kustom)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedYear("all");
                setSelectedMonth("all");
              }}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            />
          </div>

          {/* Sampai Tanggal */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Sampai Tanggal (Kustom)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedYear("all");
                setSelectedMonth("all");
              }}
              className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer"
            />
          </div>

          {/* Pencarian Nama / Lokasi */}
          <div>
            <label className="block text-xs font-medium text-[#5E5A52] mb-1">
              Pencarian Cepat
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A857B]"
              />
              <input
                type="text"
                placeholder="Nama pelanggan, no WA, lokasi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* =========================================================================
          4 STAT CARDS (METRIK RINGKASAN REKAP)
      ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Acara"
          value={metrics.totalAcara}
          subtitle={`Periode: ${periodLabel}`}
          icon={<CalendarRange size={20} />}
          valueClassName="text-[#A67C24]"
          iconClassName="text-[#A67C24]"
        />

        <StatCard
          title="Total DP Masuk"
          value={`Rp${metrics.totalDpMasuk.toLocaleString("id-ID")}`}
          subtitle="Akumulasi pembayaran DP diterima"
          icon={<Wallet size={20} />}
          valueClassName="text-[#A67C24]"
          iconClassName="text-[#A67C24]"
        />

        <StatCard
          title="Estimasi Nilai Paket"
          value={`Rp${metrics.totalEstimasiOmzet.toLocaleString("id-ID")}`}
          subtitle="Potensi omzet harga dasar paket"
          icon={<TrendingUp size={20} />}
          valueClassName="text-[#2F7A4B]"
          iconClassName="text-[#2F7A4B]"
        />

        <StatCard
          title="Tingkat Konfirmasi"
          value={`${metrics.konfirmasiRate}%`}
          subtitle={`${metrics.totalDikonfirmasi} dari ${metrics.totalAcara} terkonfirmasi`}
          icon={<CheckCircle2 size={20} />}
          valueClassName={
            metrics.konfirmasiRate >= 50
              ? "text-[#2F7A4B]"
              : "text-[#B13C30]"
          }
          iconClassName={
            metrics.konfirmasiRate >= 50
              ? "text-[#2F7A4B]"
              : "text-[#B13C30]"
          }
        />
      </div>

      {/* =========================================================================
          ANALISIS & BREAKDOWN SECTION
      ========================================================================= */}
      <div className="space-y-4">
        {/* Navigation Tabs (Disembunyikan saat print) */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF7F0] border border-[#E5DEC9] rounded-2xl print:hidden shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("bulanan")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "bulanan"
                ? "bg-[#FFFFFF] text-[#8A6A22] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8E2D2]"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#F2ECE1]"
            }`}
          >
            <CalendarRange size={16} className={activeTab === "bulanan" ? "text-[#A67C24]" : "text-[#8A857B]"} />
            <span>Rekap Bulanan</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "bulanan"
                  ? "bg-[rgba(212,173,92,0.18)] text-[#8A6A22]"
                  : "bg-[#EAE2D2] text-[#5E5A52]"
              }`}
            >
              12 Bulan
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paket")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "paket"
                ? "bg-[#FFFFFF] text-[#8A6A22] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8E2D2]"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#F2ECE1]"
            }`}
          >
            <Sparkles size={16} className={activeTab === "paket" ? "text-[#A67C24]" : "text-[#8A857B]"} />
            <span>Rekap Per Paket Acara</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "paket"
                  ? "bg-[rgba(212,173,92,0.18)] text-[#8A6A22]"
                  : "bg-[#EAE2D2] text-[#5E5A52]"
              }`}
            >
              {packageBreakdown.length} Paket
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("status")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "status"
                ? "bg-[#FFFFFF] text-[#8A6A22] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#E8E2D2]"
                : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#F2ECE1]"
            }`}
          >
            <CheckCircle2 size={16} className={activeTab === "status" ? "text-[#A67C24]" : "text-[#8A857B]"} />
            <span>Rekap Status Konfirmasi</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === "status"
                  ? "bg-[rgba(212,173,92,0.18)] text-[#8A6A22]"
                  : "bg-[#EAE2D2] text-[#5E5A52]"
              }`}
            >
              4 Status
            </span>
          </button>
        </div>

        {/* TAB 1: REKAP BULANAN */}
        {activeTab === "bulanan" && (
          <Card className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-sans text-lg font-bold text-[#1A1A1A]">
                  Distribusi Acara & Tren Pembayaran DP Per Bulan
                </h3>
                <p className="text-xs text-[#5E5A52]">
                  {selectedYear !== "all"
                    ? `Performa booking tahun ${selectedYear}`
                    : "Akumulasi bulanan dari seluruh data yang terfilter"}
                </p>
              </div>
              {monthlyBreakdown.busiestMonth && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(212,173,92,0.14)] text-[#8A6A22] text-xs font-semibold">
                  <Sparkles size={14} />
                  <span>
                    Bulan Terpadat: {monthlyBreakdown.busiestMonth.name} (
                    {monthlyBreakdown.busiestMonth.count} acara)
                  </span>
                </div>
              )}
            </div>

            {/* Grid 12 Bulan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {monthlyBreakdown.months.map((m) => {
                const heightPercentage =
                  monthlyBreakdown.maxCount > 0
                    ? Math.round((m.count / monthlyBreakdown.maxCount) * 100)
                    : 0;

                const isCurrentMonth =
                  new Date().getMonth() === m.index &&
                  (selectedYear === "all" ||
                    selectedYear === new Date().getFullYear().toString());

                return (
                  <div
                    key={m.name}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrentMonth
                        ? "bg-[#FCF8EE] dark:bg-[#252219] border-[#D4AD5C] shadow-xs"
                        : "bg-[#FAFAFA] dark:bg-[#1E1E1E] border-[#E8E2D2] dark:border-[#332F28] hover:border-[#D4AD5C]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                        {m.name.slice(0, 3)}
                      </span>
                      {isCurrentMonth && (
                        <span className="text-[10px] uppercase font-bold text-[#A67C24] dark:text-[#EEB100] bg-[rgba(212,173,92,0.18)] px-1.5 py-0.5 rounded">
                          Kini
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <div className="text-2xl font-bold font-sans text-[#A67C24] dark:text-[#EEB100]">
                        {m.count}
                        <span className="text-[11px] font-normal text-[#5E5A52] dark:text-[#B8B3A8] ml-1">
                          acara
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-[#5E5A52] dark:text-[#B8B3A8] mt-1 truncate">
                        DP: Rp{m.totalDp.toLocaleString("id-ID")}
                      </div>
                    </div>

                    {/* Progress Bar Visual */}
                    <div className="w-full bg-[#E8E2D2] dark:bg-[#2E2A22] h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        className="bg-[#D4AD5C] h-full rounded-full transition-all duration-500"
                        style={{ width: `${heightPercentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* TAB 2: REKAP PER PAKET */}
        {activeTab === "paket" && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-sans text-lg font-bold text-[#1A1A1A]">
                Pangsa & Minat Paket Acara Era Waluyo
              </h3>
              <p className="text-xs text-[#5E5A52]">
                Evaluasi paket yang paling sering dipesan oleh pelanggan
              </p>
            </div>

            {packageBreakdown.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#5E5A52]">
                Belum ada data pemesanan paket pada filter ini.
              </div>
            ) : (
              <div className="space-y-4">
                {packageBreakdown.map((pkg, idx) => {
                  const sharePercentage =
                    metrics.totalAcara > 0
                      ? Math.round((pkg.count / metrics.totalAcara) * 100)
                      : 0;

                  return (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-xl border border-[#E8E2D2] bg-[#FAFAFA] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {idx === 0 && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EEB100] text-[#111111]">
                              Paling Diminati
                            </span>
                          )}
                          <h4 className="font-sans font-bold text-base text-[#1A1A1A]">
                            {pkg.nama}
                          </h4>
                          {pkg.hargaDasar > 0 && (
                            <span className="text-xs text-[#8A6A22] font-semibold bg-[rgba(212,173,92,0.14)] px-2 py-0.5 rounded-full">
                              Rp{pkg.hargaDasar.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div>
                            <span className="text-[#5E5A52]">Pemesanan: </span>
                            <span className="font-bold text-[#1A1A1A]">
                              {pkg.count} acara ({sharePercentage}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-[#5E5A52]">Total DP: </span>
                            <span className="font-bold text-[#2F7A4B]">
                              Rp{pkg.totalDp.toLocaleString("id-ID")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Visual progress bar */}
                      <div className="w-full bg-[#E8E2D2] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AD5C] h-full rounded-full transition-all duration-500"
                          style={{ width: `${sharePercentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* TAB 3: REKAP STATUS KONFIRMASI */}
        {activeTab === "status" && (
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="font-sans text-lg font-bold text-[#1A1A1A]">
                Status Verifikasi Kesepakatan Pelanggan
              </h3>
              <p className="text-xs text-[#5E5A52]">
                Ringkasan kesiapan acara berdasarkan respon link konfirmasi
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statusBreakdown.map((sb) => {
                const pct =
                  metrics.totalAcara > 0
                    ? Math.round((sb.count / metrics.totalAcara) * 100)
                    : 0;

                return (
                  <div
                    key={sb.status}
                    className="p-4 rounded-xl border border-[#E8E2D2] bg-[#FAFAFA] flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status={sb.badgeType} />
                        <span className="text-xs font-bold text-[#5E5A52]">
                          {pct}%
                        </span>
                      </div>
                      <p className="text-xs text-[#5E5A52] mt-2">
                        {sb.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#E8E2D2] flex items-baseline justify-between">
                      <span className="text-xs text-[#8A857B]">Jumlah</span>
                      <span className="text-2xl font-bold font-sans text-[#1A1A1A]">
                        {sb.count}{" "}
                        <span className="text-xs font-normal text-[#5E5A52]">
                          acara
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* =========================================================================
          TABEL RINCIAN DATA REKAP BOOKING
      ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-[20px] font-bold text-[#1A1A1A]">
            Rincian Pesanan Acara
          </h2>
          <span className="text-xs text-[#5E5A52]">
            Menampilkan {filteredBookings.length} data
          </span>
        </div>

        <Card className="p-0 overflow-hidden shadow-sm">
          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#8A6A22]">
                <PackageCheck size={24} />
              </div>
              <h3 className="font-sans text-lg font-bold text-[#1A1A1A]">
                Tidak Ada Data Booking
              </h3>
              <p className="text-xs text-[#5E5A52] max-w-sm mx-auto">
                Tidak ada data pemesanan yang sesuai dengan filter atau rentang tanggal yang dipilih.
              </p>
              <Button
                variant="outline"
                onClick={handlePresetAll}
                className="text-xs mt-2"
              >
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5DEC9] bg-[#FAF7F0] text-[13px] font-semibold text-[#5E5A52]">
                    <th className="py-3.5 px-4 w-12 text-center">No</th>
                    <th className="py-3.5 px-4">Tanggal Acara</th>
                    <th className="py-3.5 px-4">Nama Pelanggan</th>
                    <th className="py-3.5 px-4">Paket Acara</th>
                    <th className="py-3.5 px-4">Lokasi</th>
                    <th className="py-3.5 px-4">Status Konfirmasi</th>
                    <th className="py-3.5 px-4">Status DP</th>
                    <th className="py-3.5 px-4 text-right">Nominal DP</th>
                    <th className="py-3.5 px-4 text-center w-24 print:hidden">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC] text-sm text-[#1A1A1A]">
                  {filteredBookings.map((b, index) => {
                    const formattedDate = new Date(
                      b.tanggal_acara
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-[#FAF7F0] transition-colors"
                      >
                        <td className="py-3.5 px-4 text-center text-xs text-[#8A857B]">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#1A1A1A] whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#1A1A1A]">
                            {b.nama_pelanggan}
                          </div>
                          <div className="text-xs text-[#8A857B]">{b.no_wa}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {b.packages ? (
                            <span className="inline-block text-xs font-medium text-[#5E5A52] bg-[#F2ECE1] px-2 py-0.5 rounded">
                              {b.packages.nama}
                            </span>
                          ) : (
                            <span className="text-xs text-[#8A857B] italic">
                              Custom
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-[#5E5A52] max-w-[180px] truncate">
                          {b.lokasi || "-"}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge
                            status={
                              (b.status as BookingStatus) || "belum_dikonfirmasi"
                            }
                          />
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {b.dp_diterima ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2F7A4B] bg-[rgba(127,211,155,0.18)] px-2 py-0.5 rounded-full">
                              <CheckCircle2 size={12} />
                              <span>Diterima</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#A5601C] bg-[rgba(232,162,95,0.18)] px-2 py-0.5 rounded-full">
                              <Clock size={12} />
                              <span>Belum</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#1A1A1A] whitespace-nowrap">
                          Rp{Number(b.dp_nominal || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="py-3.5 px-4 text-center print:hidden">
                          <Link
                            href={`/booking/${b.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8A6A22] hover:text-[#B8923F] p-1.5 rounded-lg hover:bg-[rgba(212,173,92,0.12)] transition-colors"
                            title="Buka rincian booking"
                          >
                            <span>Detail</span>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-[#FAF7F0] border-t-2 border-[#D6CEBE] text-sm font-bold text-[#1A1A1A]">
                    <td colSpan={2} className="py-4 px-4">
                      TOTAL ({filteredBookings.length} Acara)
                    </td>
                    <td colSpan={5} className="py-4 px-4 text-xs text-[#5E5A52]">
                      Akumulasi DP yang sudah berstatus diterima
                    </td>
                    <td className="py-4 px-4 text-right text-base text-[#2F7A4B]">
                      Rp{metrics.totalDpMasuk.toLocaleString("id-ID")}
                    </td>
                    <td className="print:hidden"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* =========================================================================
          PRINT STYLES (@media print)
      ========================================================================= */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          main {
            margin-left: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
          }
          aside,
          nav,
          .print\\:hidden {
            display: none !important;
          }
          table {
            border: 1px solid #cccccc !important;
            width: 100% !important;
          }
          th,
          td {
            border: 1px solid #eeeeee !important;
            color: #000000 !important;
            padding: 6px 8px !important;
            font-size: 11px !important;
          }
          th {
            background-color: #f3f3f3 !important;
          }
        }
      `}</style>
    </div>
  );
}
