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
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
        badgeClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:text-[#7FD39B] border-[#2F7A4B]/30",
        iconBgClass: "bg-[#2F7A4B]/10 text-[#2F7A4B] dark:text-[#7FD39B]",
      };
    case "LOGIN_FAILED":
      return {
        label: "Login Gagal",
        icon: ShieldAlert,
        badgeClass: "bg-[#B13C30]/15 text-[#B13C30] dark:text-[#F87171] border-[#B13C30]/30",
        iconBgClass: "bg-[#B13C30]/10 text-[#B13C30] dark:text-[#F87171]",
      };
    case "LOGOUT":
      return {
        label: "Logout",
        icon: LogOut,
        badgeClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:text-[#A8A296] border-[#8A857B]/30",
        iconBgClass: "bg-[#8A857B]/10 text-[#5E5A52] dark:text-[#A8A296]",
      };
    case "BOOKING_CREATED":
      return {
        label: "Tambah Booking",
        icon: CalendarPlus,
        badgeClass: "bg-[#EEB100]/20 text-[#9C7300] dark:text-[#EEB100] border-[#EEB100]/40",
        iconBgClass: "bg-[#EEB100]/15 text-[#EEB100]",
      };
    case "BOOKING_UPDATED":
      return {
        label: "Edit Booking",
        icon: FileEdit,
        badgeClass: "bg-[rgba(46,95,138,0.15)] text-[#2E5F8A] dark:text-[#93C5FD] border-[rgba(46,95,138,0.3)]",
        iconBgClass: "bg-[rgba(46,95,138,0.12)] text-[#2E5F8A] dark:text-[#93C5FD]",
      };
    case "BOOKING_DELETED":
      return {
        label: "Hapus Booking",
        icon: Trash2,
        badgeClass: "bg-[#B13C30]/15 text-[#B13C30] dark:text-[#F87171] border-[#B13C30]/30",
        iconBgClass: "bg-[#B13C30]/10 text-[#B13C30] dark:text-[#F87171]",
      };
    case "BOOKING_CONFIRMED":
      return {
        label: "Konfirmasi Acara",
        icon: ShieldCheck,
        badgeClass: "bg-[#2F7A4B]/15 text-[#2F7A4B] dark:text-[#7FD39B] border-[#2F7A4B]/30",
        iconBgClass: "bg-[#2F7A4B]/10 text-[#2F7A4B] dark:text-[#7FD39B]",
      };
    case "PASSWORD_CHANGED":
      return {
        label: "Ubah Sandi",
        icon: Key,
        badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
        iconBgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
      };
    default:
      return {
        label: event.replace(/_/g, " "),
        icon: Activity,
        badgeClass: "bg-[#8A857B]/15 text-[#5E5A52] dark:text-[#A8A296] border-[#8A857B]/30",
        iconBgClass: "bg-[#8A857B]/10 text-[#5E5A52] dark:text-[#A8A296]",
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
      // 1. Kategori
      if (selectedCategory !== "all") {
        const cat = getActivityCategory(log.event);
        if (cat !== selectedCategory) return false;
      }

      // 2. Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // 3. Search query
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

  // Ekspor log ke file JSON
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
      {/* Header Halaman Log Aktivitas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9] dark:border-[#38342C]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#EEB100]/15 text-[#EEB100]">
              <Activity size={22} />
            </div>
            <div>
              <h2 className="font-sans text-[22px] font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                Log Aktivitas Sistem
              </h2>
              <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-0.5">
                Rekam jejak aktivitas operasional: aktivitas login, penambahan data booking terbaru, dan edit pesanan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs gap-2 h-9 border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] cursor-pointer"
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
            className="text-xs gap-2 h-9 border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] cursor-pointer"
          >
            <Download size={13} />
            <span>Ekspor Log</span>
          </Button>
        </div>
      </div>

      {/* Grid 4 Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Aktivitas */}
        <Card
          onClick={() => setSelectedCategory("all")}
          className={`p-4 cursor-pointer transition-all border ${
            selectedCategory === "all"
              ? "border-[#EEB100] shadow-sm bg-[#EEB100]/5 dark:bg-[#EEB100]/10"
              : "border-[#E5DEC9] dark:border-[#38342C] hover:border-[#EEB100]/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5A52] dark:text-[#A8A296]">
              Total Aktivitas
            </span>
            <div className="p-1.5 rounded-lg bg-[#EEB100]/15 text-[#EEB100]">
              <Activity size={15} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-sans text-[#1A1A1A] dark:text-[#F5EDDC]">
            {stats.total}
          </div>
          <p className="text-[11px] text-[#8A857B] mt-0.5">Semua riwayat tercatat</p>
        </Card>

        {/* Aktivitas Login */}
        <Card
          onClick={() => setSelectedCategory("auth")}
          className={`p-4 cursor-pointer transition-all border ${
            selectedCategory === "auth"
              ? "border-[#2F7A4B] shadow-sm bg-[#2F7A4B]/5 dark:bg-[#2F7A4B]/10"
              : "border-[#E5DEC9] dark:border-[#38342C] hover:border-[#2F7A4B]/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5A52] dark:text-[#A8A296]">
              Aktivitas Login
            </span>
            <div className="p-1.5 rounded-lg bg-[#2F7A4B]/15 text-[#2F7A4B] dark:text-[#7FD39B]">
              <LogIn size={15} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-sans text-[#1A1A1A] dark:text-[#F5EDDC]">
            {stats.auth}
          </div>
          <p className="text-[11px] text-[#8A857B] mt-0.5">Sesi masuk & otentikasi</p>
        </Card>

        {/* Penambahan Data Booking */}
        <Card
          onClick={() => setSelectedCategory("booking_add")}
          className={`p-4 cursor-pointer transition-all border ${
            selectedCategory === "booking_add"
              ? "border-[#EEB100] shadow-sm bg-[#EEB100]/10 dark:bg-[#EEB100]/15"
              : "border-[#E5DEC9] dark:border-[#38342C] hover:border-[#EEB100]/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5A52] dark:text-[#A8A296]">
              Penambahan Booking
            </span>
            <div className="p-1.5 rounded-lg bg-[#EEB100]/20 text-[#9C7300] dark:text-[#EEB100]">
              <CalendarPlus size={15} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-sans text-[#1A1A1A] dark:text-[#F5EDDC]">
            {stats.create}
          </div>
          <p className="text-[11px] text-[#8A857B] mt-0.5">Pesanan baru dibuat</p>
        </Card>

        {/* Edit Data Booking */}
        <Card
          onClick={() => setSelectedCategory("booking_edit")}
          className={`p-4 cursor-pointer transition-all border ${
            selectedCategory === "booking_edit"
              ? "border-[#2E5F8A] shadow-sm bg-[#2E5F8A]/5 dark:bg-[#2E5F8A]/10"
              : "border-[#E5DEC9] dark:border-[#38342C] hover:border-[#2E5F8A]/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5E5A52] dark:text-[#A8A296]">
              Edit Data Booking
            </span>
            <div className="p-1.5 rounded-lg bg-[rgba(46,95,138,0.15)] text-[#2E5F8A] dark:text-[#93C5FD]">
              <FileEdit size={15} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-sans text-[#1A1A1A] dark:text-[#F5EDDC]">
            {stats.edit}
          </div>
          <p className="text-[11px] text-[#8A857B] mt-0.5">Pembaruan & edit pesanan</p>
        </Card>
      </div>

      {/* Filter Kategori & Search Bar */}
      <Card className="p-4 space-y-3 border-[#E5DEC9] dark:border-[#38342C]">
        {/* Pills Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "all"
                ? "bg-[#EEB100] text-[#111111] font-semibold"
                : "text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
            }`}
          >
            <span>Semua Aktivitas</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "all" ? "bg-black/15 text-black" : "bg-[#E5DEC9] dark:bg-[#38342C]"
            }`}>
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("auth")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "auth"
                ? "bg-[#2F7A4B] text-white font-semibold"
                : "text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
            }`}
          >
            <LogIn size={13} />
            <span>Aktivitas Login</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "auth" ? "bg-white/20 text-white" : "bg-[#E5DEC9] dark:bg-[#38342C]"
            }`}>
              {stats.auth}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("booking_add")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "booking_add"
                ? "bg-[#EEB100] text-[#111111] font-semibold"
                : "text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
            }`}
          >
            <CalendarPlus size={13} />
            <span>Penambahan Booking</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "booking_add" ? "bg-black/15 text-black" : "bg-[#E5DEC9] dark:bg-[#38342C]"
            }`}>
              {stats.create}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCategory("booking_edit")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === "booking_edit"
                ? "bg-[#2E5F8A] text-white font-semibold"
                : "text-[#5E5A52] dark:text-[#A8A296] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
            }`}
          >
            <FileEdit size={13} />
            <span>Edit Data Booking</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedCategory === "booking_edit" ? "bg-white/20 text-white" : "bg-[#E5DEC9] dark:bg-[#38342C]"
            }`}>
              {stats.edit}
            </span>
          </button>
        </div>

        {/* Input Pencarian & Filter Status */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A857B]" size={15} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengantin, email, aktivitas, atau perangkat..."
              className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-[#E5DEC9] dark:border-[#38342C] bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-[#F5EDDC] placeholder:text-[#8A857B] focus:outline-hidden focus:ring-1 focus:ring-[#EEB100]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC]"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-[#E5DEC9] dark:border-[#38342C] bg-[#FFFFFF] dark:bg-[#1E1E1E] text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-hidden focus:ring-1 focus:ring-[#EEB100] cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="success">Sukses (Success)</option>
              <option value="info">Informasi (Info)</option>
              <option value="warning">Peringatan (Warning)</option>
              <option value="danger">Kritis / Bahaya (Danger)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Daftar Baris Log Aktivitas */}
      <Card className="divide-y divide-[#E5DEC9] dark:divide-[#38342C] border-[#E5DEC9] dark:border-[#38342C] overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF6ED] dark:bg-[#252525] flex items-center justify-center text-[#8A857B]">
              <Search size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                Tidak ada aktivitas yang ditemukan
              </p>
              <p className="text-xs text-[#8A857B] mt-0.5">
                {searchQuery || statusFilter !== "all" || selectedCategory !== "all"
                  ? "Coba ubah kata kunci pencarian atau bersihkan filter."
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
                className="text-xs h-8 border-[#E5DEC9] dark:border-[#38342C] cursor-pointer"
              >
                Reset Filter
              </Button>
            )}
          </div>
        ) : (
          displayedLogs.map((log) => {
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
                className="p-4 hover:bg-[#FAF7F0] dark:hover:bg-[#252525]/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                  {/* Icon & Deskripsi */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${meta.iconBgClass}`}>
                      <IconComp size={18} />
                    </div>

                    <div className="min-w-0 space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border shrink-0 ${meta.badgeClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                          {log.description}
                        </span>
                      </div>

                      {/* Baris Metadata (Aktor, Perangkat, IP) */}
                      <div className="flex items-center gap-3 flex-wrap text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                        {/* Aktor */}
                        <div className="inline-flex items-center gap-1.5">
                          <User size={12} className="text-[#EEB100]" />
                          <span>
                            Aktor: <span className="font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">{log.actor}</span>
                          </span>
                        </div>

                        {/* Perangkat */}
                        {log.device && (
                          <>
                            <span>•</span>
                            <div className="inline-flex items-center gap-1.5">
                              {isMobileDevice ? (
                                <Smartphone size={12} className="text-[#8A857B]" />
                              ) : (
                                <Laptop size={12} className="text-[#8A857B]" />
                              )}
                              <span>
                                Perangkat: <span className="font-medium text-[#1A1A1A] dark:text-[#F5EDDC]">{log.device}</span>
                              </span>
                            </div>
                          </>
                        )}

                        {/* IP Address */}
                        {log.ip && (
                          <>
                            <span>•</span>
                            <div className="inline-flex items-center gap-1 text-mono">
                              <Globe size={11} className="text-[#8A857B]" />
                              <span>IP: {log.ip}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Rincian Tambahan jika Diperluas */}
                      {isExpanded && log.details && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] text-xs space-y-1.5 font-mono">
                          <div className="font-sans font-semibold text-[11px] text-[#5E5A52] dark:text-[#A8A296] uppercase tracking-wider mb-1">
                            Rincian Parameter Event
                          </div>
                          {Object.entries(log.details).map(([key, val]) => (
                            <div key={key} className="flex items-center gap-2 text-[11px]">
                              <span className="text-[#8A857B]">{key}:</span>
                              <span className="font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Waktu & Tombol Aksi */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-1.5 pt-1 sm:pt-0">
                    <div className="flex items-center gap-1 text-[11px] text-[#8A857B] font-medium">
                      <Clock size={11} className="text-[#EEB100]" />
                      <span>{formatRelativeTime(log.timestamp)}</span>
                    </div>

                    <div className="text-[10px] text-[#8A857B] font-mono">
                      {formatFullDateTime(log.timestamp)}
                    </div>

                    {log.details && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(log.id)}
                        className="text-[11px] text-[#EEB100] hover:underline flex items-center gap-0.5 mt-1 cursor-pointer font-medium"
                      >
                        <span>{isExpanded ? "Tutup Detail" : "Lihat Detail"}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </Card>

      {/* Tombol Tampilkan Lebih Banyak jika > 20 */}
      {filteredLogs.length > visibleCount && (
        <div className="text-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="text-xs h-9 px-6 border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] cursor-pointer"
          >
            Tampilkan Lebih Banyak ({filteredLogs.length - visibleCount} sisa)
          </Button>
        </div>
      )}
    </div>
  );
}
