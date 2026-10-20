"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  AlertTriangle,
  Plus,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { BookingStatus } from "@/types";

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

const DAY_NAMES = [
  { short: "Sen", full: "Senin" },
  { short: "Sel", full: "Selasa" },
  { short: "Rab", full: "Rabu" },
  { short: "Kam", full: "Kamis" },
  { short: "Jum", full: "Jumat" },
  { short: "Sab", full: "Sabtu" },
  { short: "Min", full: "Minggu" },
];

export interface BookingCalendarItem {
  id: string;
  nama_pelanggan: string;
  no_wa: string;
  tanggal_acara: string;
  lokasi: string;
  status: string;
  dp_nominal: number | null;
  dp_diterima: boolean | null;
  kebaya_baju?: string | null;
  ukuran?: string | null;
  dekorasi?: string | null;
  mc?: string | null;
  makeup?: string | null;
  fotografer?: string | null;
  packages?: {
    id: string;
    nama: string;
    harga_dasar: number | null;
  } | null;
}

interface KalenderClientProps {
  bookings: BookingCalendarItem[];
}

export default function KalenderClient({ bookings }: KalenderClientProps) {
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [today]);

  // Current view year & month (0-indexed)
  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(() => todayStr);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Map bookings by date string YYYY-MM-DD
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, BookingCalendarItem[]>();
    for (const b of bookings) {
      if (!b.tanggal_acara) continue;
      // Normalize to YYYY-MM-DD
      const dateKey = b.tanggal_acara.slice(0, 10);
      const existing = map.get(dateKey) || [];
      existing.push(b);
      map.set(dateKey, existing);
    }
    return map;
  }, [bookings]);

  // Navigate month
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // Generate grid days for current month
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Convert Sunday=0 to Monday=0
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      bookings: BookingCalendarItem[];
    }[] = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: bookingsByDate.get(dateStr) || [],
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const m = String(currentMonth + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${currentYear}-${m}-${d}`;

      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        bookings: bookingsByDate.get(dateStr) || [],
      });
    }

    // Next month padding to fill out 35 or 42 cells
    const totalCells = cells.length > 35 ? 42 : 35;
    const nextDaysNeeded = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= nextDaysNeeded; dayNum++) {
      const nextDate = new Date(currentYear, currentMonth + 1, dayNum);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayNum).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      cells.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        bookings: bookingsByDate.get(dateStr) || [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr, bookingsByDate]);

  // Statistics for currently viewed month
  const monthStats = useMemo(() => {
    let totalAcara = 0;
    let dikonfirmasi = 0;
    let belumKonfirmasi = 0;
    let bentrokCount = 0;

    const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`;

    bookingsByDate.forEach((list, dateStr) => {
      if (dateStr.startsWith(currentMonthPrefix)) {
        totalAcara += list.length;
        if (list.length > 1) {
          bentrokCount++;
        }
        for (const item of list) {
          if (item.status === "dikonfirmasi") dikonfirmasi++;
          else if (item.status === "belum_dikonfirmasi") belumKonfirmasi++;
        }
      }
    });

    return { totalAcara, dikonfirmasi, belumKonfirmasi, bentrokCount };
  }, [bookingsByDate, currentYear, currentMonth]);

  // Bookings for currently selected date
  const selectedDateBookings = useMemo(() => {
    const list = bookingsByDate.get(selectedDate) || [];
    if (filterStatus === "all") return list;
    return list.filter((b) => b.status === filterStatus);
  }, [bookingsByDate, selectedDate, filterStatus]);

  // Format selected date in Indonesian
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return "";
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = DAY_NAMES[(dateObj.getDay() + 6) % 7]?.full || "";
    const monthName = MONTH_NAMES[dateObj.getMonth()] || "";
    return `${dayName}, ${d} ${monthName} ${y}`;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#4D4D4D]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Kalender Booking
          </h1>
          <p className="text-sm md:text-base text-[#B8B3A8] mt-1">
            Pantau jadwal ketersediaan tanggal dan acara pernikahan Era Waluyo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/booking/tambah">
            <Button variant="primary" className="gap-2">
              <Plus size={18} />
              <span>Catat Booking Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Month Metrics & Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-[#363636] border border-[#4D4D4D] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#B8B3A8] block">Total Bulan Ini</span>
            <strong className="text-xl sm:text-2xl font-serif text-[#D4AD5C] block mt-0.5">
              {monthStats.totalAcara} Acara
            </strong>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(212,173,92,0.14)] text-[#D4AD5C] flex items-center justify-center">
            <CalendarIcon size={20} />
          </div>
        </div>

        <div className="p-4 bg-[#363636] border border-[#4D4D4D] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#B8B3A8] block">Dikonfirmasi</span>
            <strong className="text-xl sm:text-2xl font-serif text-[#7FD39B] block mt-0.5">
              {monthStats.dikonfirmasi} Acara
            </strong>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(127,211,155,0.14)] text-[#7FD39B] flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="p-4 bg-[#363636] border border-[#4D4D4D] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#B8B3A8] block">Belum Konfirmasi</span>
            <strong className="text-xl sm:text-2xl font-serif text-[#E8A25F] block mt-0.5">
              {monthStats.belumKonfirmasi} Acara
            </strong>
          </div>
          <div className="w-10 h-10 rounded-full bg-[rgba(232,162,95,0.14)] text-[#E8A25F] flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 bg-[#363636] border border-[#4D4D4D] rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-[#B8B3A8] block">Bentrok Tanggal</span>
            <strong
              className={`text-xl sm:text-2xl font-serif block mt-0.5 ${
                monthStats.bentrokCount > 0 ? "text-[#E07A6E]" : "text-[#B8B3A8]"
              }`}
            >
              {monthStats.bentrokCount} Tanggal
            </strong>
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              monthStats.bentrokCount > 0
                ? "bg-[rgba(224,122,110,0.14)] text-[#E07A6E]"
                : "bg-[#404040] text-[#B8B3A8]"
            }`}
          >
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Main Grid & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar View (Left side, 8 cols on desktop) */}
        <Card className="p-4 sm:p-6 lg:col-span-8 space-y-4">
          {/* Calendar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#4D4D4D]">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#404040] hover:bg-[#4A4A4A] text-[#F5EDDC] transition-colors cursor-pointer"
                aria-label="Bulan Sebelumnya"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#F5EDDC] min-w-[190px] text-center">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#404040] hover:bg-[#4A4A4A] text-[#F5EDDC] transition-colors cursor-pointer"
                aria-label="Bulan Berikutnya"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGoToday}
                className="text-xs"
              >
                Hari Ini
              </Button>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-9 px-3 bg-[#404040] border border-[#4D4D4D] rounded-xl text-xs text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="dikonfirmasi">Hanya Dikonfirmasi</option>
                <option value="belum_dikonfirmasi">Hanya Belum Konfirmasi</option>
                <option value="perlu_koreksi">Hanya Perlu Koreksi</option>
              </select>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-[#B8B3A8] py-1 uppercase tracking-wider">
            {DAY_NAMES.map((d) => (
              <div key={d.short} className="py-1">
                <span className="hidden sm:inline">{d.full}</span>
                <span className="sm:hidden">{d.short}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarGrid.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const hasBookings = cell.bookings.length > 0;
              const isConflict = cell.bookings.length > 1;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[78px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    cell.isCurrentMonth
                      ? "bg-[#363636] border-[#4D4D4D]"
                      : "bg-[#2C2C2C]/70 border-[#4D4D4D]/50 text-[#807C74]"
                  } ${
                    isSelected
                      ? "ring-2 ring-[#D4AD5C] border-transparent bg-[rgba(212,173,92,0.12)] shadow-md"
                      : "hover:border-[#616161]"
                  }`}
                >
                  {/* Top row: day number + indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${
                        cell.isToday
                          ? "border border-[#D4AD5C] text-[#D4AD5C] font-bold"
                          : isSelected
                          ? "text-[#D4AD5C] font-bold"
                          : cell.isCurrentMonth
                          ? "text-[#F5EDDC]"
                          : "text-[#807C74]"
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Conflict Badge */}
                    {isConflict && (
                      <span
                        title="Bentrok Tanggal: Lebih dari 1 acara"
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[rgba(224,122,110,0.2)] text-[#E07A6E] flex items-center gap-0.5"
                      >
                        <AlertTriangle size={10} />
                        <span className="hidden sm:inline">{cell.bookings.length}</span>
                      </span>
                    )}
                  </div>

                  {/* Middle / Bottom: Booking pills */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {hasBookings ? (
                      cell.bookings.slice(0, 2).map((b) => {
                        const statusDotColor =
                          b.status === "dikonfirmasi"
                            ? "bg-[#7FD39B]"
                            : b.status === "perlu_koreksi"
                            ? "bg-[#E8A25F]"
                            : b.status === "dibatalkan"
                            ? "bg-[#807C74]"
                            : "bg-[#D4AD5C]";

                        return (
                          <div
                            key={b.id}
                            className="px-1.5 py-0.5 rounded text-[10px] sm:text-xs truncate bg-[#404040] border border-[#4D4D4D] text-[#F5EDDC] flex items-center gap-1.5"
                            title={`${b.nama_pelanggan} (${b.packages?.nama || "Paket"})`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} />
                            <span className="truncate">{b.nama_pelanggan}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="hidden sm:block h-3" />
                    )}

                    {cell.bookings.length > 2 && (
                      <div className="text-[9px] sm:text-[10px] text-[#B8B3A8] text-center">
                        +{cell.bookings.length - 2} acara lagi
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#4D4D4D] text-xs text-[#B8B3A8]">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7FD39B]" />
                <span>Dikonfirmasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AD5C]" />
                <span>Belum Konfirmasi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E8A25F]" />
                <span>Perlu Koreksi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[rgba(224,122,110,0.4)] text-[#E07A6E] flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
                <span className="text-[#E07A6E]">Bentrok (2+ Acara)</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full border border-[#D4AD5C] inline-block" />
              <span>Hari Ini</span>
            </div>
          </div>
        </Card>

        {/* Selected Date Details Panel (Right side, 4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 sm:p-6 space-y-4 sticky top-6">
            <div className="border-b border-[#4D4D4D] pb-3">
              <span className="text-xs font-semibold text-[#D4AD5C] uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon size={14} />
                Jadwal Acara Terpilih
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#F5EDDC] mt-1">
                {formattedSelectedDate}
              </h3>
            </div>

            {/* Conflict Warning Alert */}
            {selectedDateBookings.length > 1 && (
              <div className="p-3.5 bg-[rgba(224,122,110,0.12)] border border-[#E07A6E] rounded-xl text-xs text-[#E07A6E] flex items-start gap-2.5">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Peringatan Jadwal Bentrok</strong>
                  <span>
                    Terdapat {selectedDateBookings.length} pesanan acara pada tanggal yang sama.
                    Pastikan koordinasi tim rias, busana, dan kru dekorasi berjalan lancar.
                  </span>
                </div>
              </div>
            )}

            {/* List of Bookings on this date */}
            {selectedDateBookings.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(127,211,155,0.12)] text-[#7FD39B] flex items-center justify-center">
                  <Sparkles size={22} />
                </div>
                <h4 className="font-serif text-lg font-medium text-[#F5EDDC]">
                  Tanggal Masih Kosong
                </h4>
                <p className="text-xs text-[#B8B3A8] max-w-xs mx-auto">
                  Belum ada pesanan pernikahan yang dicatat pada tanggal ini. Siap menerima
                  booking baru dari calon pengantin.
                </p>
                <div className="pt-2">
                  <Link href={`/booking/tambah?tanggal=${selectedDate}`}>
                    <Button variant="primary" size="sm" className="gap-1.5">
                      <Plus size={16} />
                      <span>Catat Booking di Tanggal Ini</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs text-[#B8B3A8]">
                  <span>{selectedDateBookings.length} Acara Terjadwal</span>
                  <Link
                    href={`/booking/tambah?tanggal=${selectedDate}`}
                    className="text-[#D4AD5C] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus size={14} />
                    <span>Tambah Acara</span>
                  </Link>
                </div>

                {selectedDateBookings.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-4 bg-[#404040] border border-[#4D4D4D] rounded-xl space-y-3 hover:border-[#616161] transition-colors"
                  >
                    {/* Header: Name + Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] text-[#B8B3A8] font-medium">
                          Acara #{idx + 1}
                        </div>
                        <h4 className="text-base font-semibold text-[#F5EDDC] mt-0.5">
                          {b.nama_pelanggan}
                        </h4>
                      </div>
                      <StatusBadge status={b.status as BookingStatus} />
                    </div>

                    {/* Details: Package, Location, Contact */}
                    <div className="space-y-1.5 text-xs">
                      <div className="text-[#D4AD5C] font-medium flex items-center gap-1.5">
                        <Sparkles size={14} className="shrink-0" />
                        <span className="truncate">{b.packages?.nama || "Paket Khusus"}</span>
                      </div>

                      <div className="text-[#B8B3A8] flex items-start gap-1.5">
                        <MapPin size={14} className="shrink-0 mt-0.5 text-[#807C74]" />
                        <span className="line-clamp-2">{b.lokasi || "Lokasi belum ditentukan"}</span>
                      </div>

                      <div className="text-[#B8B3A8] flex items-center gap-1.5">
                        <Phone size={14} className="shrink-0 text-[#807C74]" />
                        <span>{b.no_wa}</span>
                      </div>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="pt-2 border-t border-[#4D4D4D] flex items-center gap-2">
                      <Link href={`/booking/${b.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                          <Eye size={14} />
                          <span>Detail</span>
                        </Button>
                      </Link>
                      <Link href={`/booking/${b.id}/edit`} className="flex-1">
                        <Button variant="secondary" size="sm" className="w-full gap-1.5 text-xs">
                          <Edit3 size={14} />
                          <span>Ubah</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
