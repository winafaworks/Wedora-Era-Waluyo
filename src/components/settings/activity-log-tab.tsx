"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  LogIn,
  LogOut,
  CalendarPlus,
  FileEdit,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Laptop,
  Smartphone,
  Globe,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  Key,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLogEntry, SecurityEventType, getActivityCategory, ActivityCategory } from "@/types/activity-log";

interface ActivityLogTabProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
  onRefresh: () => void;
}

function getEventMeta(event: SecurityEventType) {
  switch (event) {
    case "LOGIN_SUCCESS":
      return {
        label: "Login Berhasil",
        icon: LogIn,
        badgeClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:bg-emerald-500/25 dark:text-[#34D399] border-[#2F7A4B]/30 dark:border-emerald-500/50",
        iconBgClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:bg-emerald-500/25 dark:text-[#34D399]",
      };
    case "LOGIN_FAILED":
      return {
        label: "Login Gagal",
        icon: ShieldAlert,
        badgeClass: "bg-[#B13C30]/15 text-[#B13C30] dark:bg-rose-500/25 dark:text-[#F87171] border-[#B13C30]/30 dark:border-rose-500/50",
        iconBgClass: "bg-[#B13C30]/15 text-[#B13C30] dark:bg-rose-500/25 dark:text-[#F87171]",
      };
    case "LOGOUT":
      return {
        label: "Logout",
        icon: LogOut,
        badgeClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:bg-zinc-700/50 dark:text-[#E4E4E7] border-[#8A857B]/30 dark:border-zinc-500/50",
        iconBgClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:bg-zinc-700/50 dark:text-[#E4E4E7]",
      };
    case "BOOKING_CREATED":
      return {
        label: "Booking Baru",
        icon: CalendarPlus,
        badgeClass: "bg-[#EEB100]/20 text-[#8B6500] dark:bg-[#EEB100]/25 dark:text-[#FBBF24] border-[#EEB100]/40 dark:border-[#EEB100]/60",
        iconBgClass: "bg-[#EEB100]/20 text-[#8B6500] dark:bg-[#EEB100]/25 dark:text-[#FBBF24]",
      };
    case "BOOKING_UPDATED":
      return {
        label: "Edit Booking",
        icon: FileEdit,
        badgeClass: "bg-[rgba(46,95,138,0.15)] text-[#2E5F8A] dark:bg-sky-500/25 dark:text-[#38BDF8] border-[rgba(46,95,138,0.3)] dark:border-sky-500/50",
        iconBgClass: "bg-[rgba(46,95,138,0.15)] text-[#2E5F8A] dark:bg-sky-500/25 dark:text-[#38BDF8]",
      };
    case "BOOKING_DELETED":
      return {
        label: "Hapus Booking",
        icon: Trash2,
        badgeClass: "bg-[#B13C30]/15 text-[#B13C30] dark:bg-rose-500/25 dark:text-[#F87171] border-[#B13C30]/30 dark:border-rose-500/50",
        iconBgClass: "bg-[#B13C30]/15 text-[#B13C30] dark:bg-rose-500/25 dark:text-[#F87171]",
      };
    case "BOOKING_CONFIRMED":
      return {
        label: "Konfirmasi Acara",
        icon: ShieldCheck,
        badgeClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:bg-emerald-500/25 dark:text-[#34D399] border-[#2F7A4B]/30 dark:border-emerald-500/50",
        iconBgClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:bg-emerald-500/25 dark:text-[#34D399]",
      };
    case "PASSWORD_CHANGED":
      return {
        label: "Ubah Sandi",
        icon: Key,
        badgeClass: "bg-purple-500/15 text-purple-700 dark:bg-purple-500/25 dark:text-[#C084FC] border-purple-500/30 dark:border-purple-500/50",
        iconBgClass: "bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-[#C084FC]",
      };
    default:
      return {
        label: event.replace(/_/g, " "),
        icon: Activity,
        badgeClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:bg-zinc-700/50 dark:text-[#E4E4E7] border-[#8A857B]/30 dark:border-zinc-500/50",
        iconBgClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:bg-zinc-700/50 dark:text-[#E4E4E7]",
      };
  }
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

function formatFullDateTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " WIB";
  } catch {
    return dateStr;
  }
}

export function ActivityLogTab({ logs, isLoading, onRefresh }: ActivityLogTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // Perhitungan statistik metrik
  const stats = useMemo(() => {
    let authCount = 0;
    let createCount = 0;
    let editCount = 0;

    logs.forEach((log) => {
      const cat = getActivityCategory(log.event);
      if (cat === "auth") authCount++;
      if (cat === "booking_add") createCount++;
      if (cat === "booking_edit") editCount++;
    });

    return {
      total: logs.length,
      auth: authCount,
      create: createCount,
      edit: editCount,
    };
  }, [logs]);

  // Filter logs berdasarkan kategori, pencarian, dan status
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedCategory !== "all") {
        const cat = getActivityCategory(log.event);
        if (cat !== selectedCategory) return false;
      }

      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const descMatch = log.description.toLowerCase().includes(q);
        const actorMatch = log.actor.toLowerCase().includes(q);
        const eventMatch = log.event.toLowerCase().includes(q);
        const deviceMatch = log.device ? log.device.toLowerCase().includes(q) : false;
        const detailsMatch = log.details ? JSON.stringify(log.details).toLowerCase().includes(q) : false;

        if (!descMatch && !actorMatch && !eventMatch && !deviceMatch && !detailsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedCategory, statusFilter, searchQuery]);

  const displayedLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleCount);
  }, [filteredLogs, visibleCount]);

  const handleExportJson = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `log-aktivitas-wedora-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Gagal mengekspor log:", e);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6ED] via-[#FFFFFF] to-[#FAF6ED] dark:from-[#24221E] dark:via-[#1C1A17] dark:to-[#24221E] border border-[#E5DEC9] dark:border-[#423C32] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#EEB100] text-[#111111] flex items-center justify-center shrink-0 shadow-sm font-bold">
            <Activity size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="font-sans text-base sm:text-lg font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
              Log Aktivitas Sistem & Pengguna
            </h2>
            <p className="text-xs text-[#5E5A52] dark:text-[#D4CEBF] mt-0.5">
              Rekam jejak real-time aktivitas login administrator, penambahan data booking baru, dan edit pesanan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 sm:flex-initial text-xs gap-2 h-9 border-[#E5DEC9] dark:border-[#423C32] bg-[#FFFFFF] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] hover:bg-[#FAF7F0] dark:hover:bg-[#302D27] dark:hover:border-[#EEB100]/60 cursor-pointer font-medium"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Segarkan</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            disabled={filteredLogs.length === 0}
            className="flex-1 sm:flex-initial text-xs gap-2 h-9 border-[#E5DEC9] dark:border-[#423C32] bg-[#FFFFFF] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] hover:bg-[#FAF7F0] dark:hover:bg-[#302D27] dark:hover:border-[#EEB100]/60 cursor-pointer font-medium"
          >
            <Download size={13} />
            <span>Ekspor Log</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid 4 Kartu Metrik Ringkasan - ULTRA HIGH CONTRAST */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Aktivitas */}
        <div
          onClick={() => setSelectedCategory("all")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === "all"
              ? "bg-[#FAF7F0] dark:bg-[#24211A] border-[#EEB100] shadow-md ring-2 ring-[#EEB100]/60"
              : "bg-[#FFFFFF] dark:bg-[#1E1E1E] border-[#E5DEC9] dark:border-[#423C32] hover:border-[#EEB100]/60 dark:hover:border-[#EEB100]/70"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
              Total Aktivitas
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEB100]/20 text-[#D49B00] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1A1A1A] dark:text-[#FFFFFF] tracking-tight">
              {stats.total}
            </div>
            <p className="text-[12px] font-semibold text-[#5E5A52] dark:text-[#E8E2D5] mt-1">
              Semua riwayat tercatat
            </p>
          </div>
        </div>

        {/* Aktivitas Login */}
        <div
          onClick={() => setSelectedCategory("auth")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === "auth"
              ? "bg-[#FAF7F0] dark:bg-[#15241B] border-[#2F7A4B] dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/60"
              : "bg-[#FFFFFF] dark:bg-[#1E1E1E] border-[#E5DEC9] dark:border-[#423C32] hover:border-[#2F7A4B]/60 dark:hover:border-emerald-500/70"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
              Aktivitas Login
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2F7A4B]/20 text-[#2F7A4B] dark:text-[#34D399] flex items-center justify-center shrink-0">
              <LogIn size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#2F7A4B] dark:text-[#34D399] tracking-tight">
              {stats.auth}
            </div>
            <p className="text-[12px] font-semibold text-[#5E5A52] dark:text-[#E8E2D5] mt-1">
              Sesi masuk admin
            </p>
          </div>
        </div>

        {/* Penambahan Data Booking */}
        <div
          onClick={() => setSelectedCategory("booking_add")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === "booking_add"
              ? "bg-[#FAF7F0] dark:bg-[#24211A] border-[#EEB100] shadow-md ring-2 ring-[#EEB100]/60"
              : "bg-[#FFFFFF] dark:bg-[#1E1E1E] border-[#E5DEC9] dark:border-[#423C32] hover:border-[#EEB100]/60 dark:hover:border-[#EEB100]/70"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
              Penambahan Booking
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EEB100]/20 text-[#D49B00] dark:text-[#FBBF24] flex items-center justify-center shrink-0">
              <CalendarPlus size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#D49B00] dark:text-[#FBBF24] tracking-tight">
              {stats.create}
            </div>
            <p className="text-[12px] font-semibold text-[#5E5A52] dark:text-[#E8E2D5] mt-1">
              Pesanan baru dibuat
            </p>
          </div>
        </div>

        {/* Edit Data Booking */}
        <div
          onClick={() => setSelectedCategory("booking_edit")}
          className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCategory === "booking_edit"
              ? "bg-[#FAF7F0] dark:bg-[#15232F] border-[#2E5F8A] dark:border-sky-400 shadow-md ring-2 ring-sky-400/60"
              : "bg-[#FFFFFF] dark:bg-[#1E1E1E] border-[#E5DEC9] dark:border-[#423C32] hover:border-[#2E5F8A]/60 dark:hover:border-sky-400/70"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
              Edit Data Booking
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#2E5F8A]/20 text-[#2E5F8A] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <FileEdit size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#2E5F8A] dark:text-[#38BDF8] tracking-tight">
              {stats.edit}
            </div>
            <p className="text-[12px] font-semibold text-[#5E5A52] dark:text-[#E8E2D5] mt-1">
              Pembaruan & edit data
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar & Pencarian */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#423C32] shadow-xs space-y-3.5">
        {/* Pills Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === "all"
                ? "bg-[#EEB100] text-[#111111] shadow-sm"
                : "bg-[#FAF7F0] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#FFFFFF] border border-[#E5DEC9] dark:border-[#4A443A] hover:dark:border-[#EEB100]/60 hover:dark:bg-[#322F2A]"
            }`}
          >
            <span>Semua Aktivitas</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategory === "all"
                  ? "bg-black/15 text-[#111111]"
                  : "bg-[#E5DEC9] dark:bg-[#3E382E] text-[#1A1A1A] dark:text-[#FFFFFF]"
              }`}
            >
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("auth")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === "auth"
                ? "bg-[#2F7A4B] dark:bg-[#1E824C] text-white shadow-sm"
                : "bg-[#FAF7F0] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#FFFFFF] border border-[#E5DEC9] dark:border-[#4A443A] hover:dark:border-emerald-500/60 hover:dark:bg-[#322F2A]"
            }`}
          >
            <LogIn size={14} />
            <span>Aktivitas Login</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategory === "auth"
                  ? "bg-white/20 text-white"
                  : "bg-[#E5DEC9] dark:bg-[#3E382E] text-[#1A1A1A] dark:text-[#FFFFFF]"
              }`}
            >
              {stats.auth}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("booking_add")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === "booking_add"
                ? "bg-[#EEB100] text-[#111111] shadow-sm"
                : "bg-[#FAF7F0] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#FFFFFF] border border-[#E5DEC9] dark:border-[#4A443A] hover:dark:border-[#EEB100]/60 hover:dark:bg-[#322F2A]"
            }`}
          >
            <CalendarPlus size={14} />
            <span>Penambahan Booking</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategory === "booking_add"
                  ? "bg-black/15 text-[#111111]"
                  : "bg-[#E5DEC9] dark:bg-[#3E382E] text-[#1A1A1A] dark:text-[#FFFFFF]"
              }`}
            >
              {stats.create}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("booking_edit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
              selectedCategory === "booking_edit"
                ? "bg-[#2E5F8A] dark:bg-[#2563EB] text-white shadow-sm"
                : "bg-[#FAF7F0] dark:bg-[#282622] text-[#1A1A1A] dark:text-[#FFFFFF] border border-[#E5DEC9] dark:border-[#4A443A] hover:dark:border-sky-500/60 hover:dark:bg-[#322F2A]"
            }`}
          >
            <FileEdit size={14} />
            <span>Edit Data Booking</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategory === "booking_edit"
                  ? "bg-white/20 text-white"
                  : "bg-[#E5DEC9] dark:bg-[#3E382E] text-[#1A1A1A] dark:text-[#FFFFFF]"
              }`}
            >
              {stats.edit}
            </span>
          </button>
        </div>

        {/* Input Pencarian & Dropdown Status */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5E5A52] dark:text-[#D4CEBF]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengantin, email admin, atau detail aktivitas..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DEC9] dark:border-[#4A443A] bg-[#FAF7F0] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] placeholder:text-[#5E5A52] dark:placeholder:text-[#B5AFA4] focus:outline-hidden focus:ring-2 focus:ring-[#EEB100]/40 focus:border-[#EEB100] transition-all font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5E5A52] dark:text-[#D4CEBF] hover:text-[#1A1A1A] dark:hover:text-[#FFFFFF] p-1 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DEC9] dark:border-[#4A443A] bg-[#FAF7F0] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] focus:outline-hidden focus:ring-2 focus:ring-[#EEB100]/40 focus:border-[#EEB100] cursor-pointer font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="success">Sukses (Success)</option>
              <option value="info">Informasi (Info)</option>
              <option value="warning">Peringatan (Warning)</option>
              <option value="danger">Kritis / Bahaya (Danger)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Daftar Baris Log Aktivitas */}
      <div className="rounded-2xl border border-[#E5DEC9] dark:border-[#423C32] overflow-hidden bg-[#FFFFFF] dark:bg-[#1E1E1E] shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6ED] dark:bg-[#2A2722] flex items-center justify-center text-[#5E5A52] dark:text-[#D4CEBF]">
              <Search size={22} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
                Tidak ada riwayat yang sesuai filter
              </p>
              <p className="text-xs text-[#5E5A52] dark:text-[#D4CEBF] mt-0.5">
                {searchQuery || statusFilter !== "all" || selectedCategory !== "all"
                  ? "Coba gunakan kata kunci pencarian lain atau bersihkan filter."
                  : "Belum ada riwayat aktivitas yang tercatat pada sistem."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "all" || selectedCategory !== "all") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSelectedCategory("all");
                }}
                className="text-xs h-8 border-[#E5DEC9] dark:border-[#4A443A] bg-[#FFFFFF] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] cursor-pointer"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E5DEC9] dark:divide-[#332E27]">
            {displayedLogs.map((log) => {
              const meta = getEventMeta(log.event);
              const IconComp = meta.icon;
              const isExpanded = expandedLogId === log.id;
              const isMobileDevice =
                log.device?.toLowerCase().includes("android") ||
                log.device?.toLowerCase().includes("ios") ||
                log.device?.toLowerCase().includes("iphone") ||
                log.device?.toLowerCase().includes("ipad");

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-4.5 hover:bg-[#FAF7F0] dark:hover:bg-[#282622]/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3.5 flex-wrap sm:flex-nowrap">
                    {/* Icon & Rincian Deskripsi */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center mt-0.5 ${meta.iconBgClass}`}>
                        <IconComp size={18} />
                      </div>

                      <div className="min-w-0 space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border shrink-0 ${meta.badgeClass}`}
                          >
                            {meta.label}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-[#1A1A1A] dark:text-[#FFFFFF] leading-snug">
                            {log.description}
                          </span>
                        </div>

                        {/* Metadata Baris (Aktor, Perangkat, IP) */}
                        <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#5E5A52] dark:text-[#E8E2D5]">
                          {/* Aktor */}
                          <div className="inline-flex items-center gap-1.5">
                            <User size={12} className="text-[#D49B00] dark:text-[#FBBF24]" />
                            <span>
                              Aktor:{" "}
                              <span className="font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
                                {log.actor}
                              </span>
                            </span>
                          </div>

                          {/* Perangkat */}
                          {log.device && (
                            <>
                              <span className="text-[#8A857B] dark:text-[#7A756D]">•</span>
                              <div className="inline-flex items-center gap-1.5">
                                {isMobileDevice ? (
                                  <Smartphone size={12} className="text-[#5E5A52] dark:text-[#D4CEBF]" />
                                ) : (
                                  <Laptop size={12} className="text-[#5E5A52] dark:text-[#D4CEBF]" />
                                )}
                                <span>
                                  Perangkat:{" "}
                                  <span className="font-semibold text-[#1A1A1A] dark:text-[#FFFFFF]">
                                    {log.device}
                                  </span>
                                </span>
                              </div>
                            </>
                          )}

                          {/* IP Address */}
                          {log.ip && (
                            <>
                              <span className="text-[#8A857B] dark:text-[#7A756D]">•</span>
                              <div className="inline-flex items-center gap-1 font-mono text-[10px]">
                                <Globe size={11} className="text-[#5E5A52] dark:text-[#D4CEBF]" />
                                <span>
                                  IP:{" "}
                                  <span className="font-semibold text-[#1A1A1A] dark:text-[#FFFFFF]">
                                    {log.ip}
                                  </span>
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Parameter Detail Jika Diperluas */}
                        {isExpanded && log.details && (
                          <div className="mt-2.5 p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#262420] border border-[#E5DEC9] dark:border-[#423C32] text-xs space-y-1.5 font-mono">
                            <div className="font-sans font-bold text-[11px] text-[#1A1A1A] dark:text-[#FFFFFF] uppercase tracking-wider mb-1">
                              Rincian Parameter Event
                            </div>
                            {Object.entries(log.details).map(([key, val]) => (
                              <div key={key} className="flex items-center gap-2 text-[11px]">
                                <span className="text-[#5E5A52] dark:text-[#D4CEBF]">{key}:</span>
                                <span className="font-bold text-[#1A1A1A] dark:text-[#FFFFFF]">
                                  {typeof val === "object" ? JSON.stringify(val) : String(val)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Waktu & Tombol Detail */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-1 pt-1 sm:pt-0">
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Clock size={12} className="text-[#D49B00] dark:text-[#FBBF24]" />
                        <span className="text-[#B8860B] dark:text-[#FBBF24]">
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>

                      <div className="text-[11px] font-bold text-[#5E5A52] dark:text-[#E8E2D5] font-mono">
                        {formatFullDateTime(log.timestamp)}
                      </div>

                      {log.details && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(log.id)}
                          className="text-[11px] text-[#B8860B] dark:text-[#FBBF24] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer font-bold"
                        >
                          <span>{isExpanded ? "Tutup Detail" : "Lihat Detail"}</span>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Tombol Paginasi / Tampilkan Lebih Banyak */}
      {filteredLogs.length > visibleCount && (
        <div className="text-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="text-xs h-9 px-6 border-[#E5DEC9] dark:border-[#423C32] bg-[#FFFFFF] dark:bg-[#262420] text-[#1A1A1A] dark:text-[#FFFFFF] hover:bg-[#FAF7F0] dark:hover:bg-[#302D27] dark:hover:border-[#EEB100]/60 cursor-pointer font-medium"
          >
            Tampilkan Lebih Banyak ({filteredLogs.length - visibleCount} sisa)
          </Button>
        </div>
      )}
    </div>
  );
}
