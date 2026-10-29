"use client";
import React, { useState, useMemo, useRef, useSyncExternalStore, useEffect, useCallback } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Palette,
  MessageSquare,
  Shield,
  Sparkles,
  Info,
  Layers,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  Send,
  Smartphone,
  Tag,
  ExternalLink,
  Lock,
  Key,
  LogOut,
  AlertTriangle,
  User,
  Activity,
  FileText,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useTheme, Theme } from "@/components/theme/theme-provider";
import {
  getStoredWhatsAppTemplate,
  saveStoredWhatsAppTemplate,
  resetStoredWhatsAppTemplate,
  formatWhatsAppMessage,
  createWhatsAppUrl,
  PRESET_WA_TEMPLATES,
  WA_AVAILABLE_VARIABLES,
  DEFAULT_WA_TEMPLATE,
} from "@/lib/whatsapp";
import { updatePassword, logout } from "@/lib/actions/auth";
import { fetchAuditLogs } from "@/lib/actions/security";
import type { AuditLogEntry } from "@/types/activity-log";
import { ActivityLogTab } from "@/components/settings/activity-log-tab";

export interface SecurityDetails {
  id?: string;
  email?: string;
  role?: string;
  lastSignInAt?: string | null;
  createdAt?: string | null;
}

interface SettingsClientProps {
  initialSecurityDetails?: SecurityDetails | null;
}

const emptySubscribe = () => () => {};

export default function SettingsClient({ initialSecurityDetails }: SettingsClientProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Ambil initial tab dari URL query jika ada (misal /settings?tab=activity)
  const initialTab = useSyncExternalStore<"appearance" | "whatsapp" | "activity" | "security">(
    emptySubscribe,
    () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      return tabParam === "whatsapp" || tabParam === "activity" || tabParam === "security" ? tabParam : "appearance";
    },
    () => "appearance"
  );

  const [activeTab, setActiveTab] = useState<"appearance" | "whatsapp" | "activity" | "security">(initialTab);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
  const [isResetWaModalOpen, setIsResetWaModalOpen] = useState(false);

  // State Template WhatsApp
  const storedTemplate = useSyncExternalStore(
    emptySubscribe,
    () => getStoredWhatsAppTemplate(),
    () => DEFAULT_WA_TEMPLATE
  );

  const [customTemplate, setCustomTemplate] = useState<string | null>(null);
  const waTemplate = customTemplate !== null ? customTemplate : storedTemplate;
  const setWaTemplate = (valOrUpdater: string | ((prev: string) => string)) => {
    if (typeof valOrUpdater === "function") {
      setCustomTemplate((prev) => valOrUpdater(prev !== null ? prev : storedTemplate));
    } else {
      setCustomTemplate(valOrUpdater);
    }
  };

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State Keamanan Akun & Form Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // State Log Audit Keamanan
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const logs = await fetchAuditLogs();
      setAuditLogs(logs);
    } catch {
      // ignore
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (activeTab === "activity" || activeTab === "security") {
      fetchAuditLogs()
        .then((logs) => {
          if (isMounted) {
            setAuditLogs(logs);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("wedora_session_active");
        if ("BroadcastChannel" in window) {
          const channel = new BroadcastChannel("wedora_session_sync");
          channel.postMessage({ type: "LOGOUT" });
          channel.close();
        }
      }
      await logout();
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
      window.location.href = "/login";
    } catch {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Indikator Kekuatan Password Baru
  const passwordStrength = useMemo(() => {
    if (!newPassword) {
      return { score: 0, label: "Belum diisi", color: "text-[#8A857B]", width: "w-0", bg: "bg-gray-300" };
    }
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 10) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[a-zA-Z]/.test(newPassword)) score++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score++;

    if (score <= 2) {
      return { score: 1, label: "Lemah (min. 8 karakter)", color: "text-[#B13C30]", width: "w-1/3", bg: "bg-[#B13C30]" };
    }
    if (score <= 4) {
      return { score: 2, label: "Sedang", color: "text-[#EEB100]", width: "w-2/3", bg: "bg-[#EEB100]" };
    }
    return { score: 3, label: "Sangat Kuat & Aman", color: "text-[#2F7A4B] dark:text-[#7FD39B]", width: "w-full", bg: "bg-[#2F7A4B]" };
  }, [newPassword]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("Kata sandi baru minimal harus 8 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword({
        currentPassword: currentPassword || undefined,
        newPassword,
      });

      if (!res.success) {
        setPasswordError(res.error || "Gagal memperbarui kata sandi.");
      } else {
        setPasswordSuccess(res.message || "Kata sandi akun admin berhasil diperbarui!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      setPasswordError((err as Error).message || "Terjadi kesalahan saat memperbarui kata sandi.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const themeOptions: {
    id: Theme;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    previewBg: string;
    previewSurface: string;
    previewBorder: string;
    previewText: string;
    previewGold: string;
  }[] = [
    {
      id: "light",
      title: "Mode Terang",
      subtitle: "Nuansa krem gading hangat & aksen emas khas Era Waluyo. Ideal untuk siang hari.",
      icon: Sun,
      previewBg: "bg-[#FBF7EC]",
      previewSurface: "bg-[#FFFFFF]",
      previewBorder: "border-[#E5DEC9]",
      previewText: "text-[#1A1A1A]",
      previewGold: "text-[#EEB100]",
    },
    {
      id: "dark",
      title: "Mode Gelap (Luxury Gold)",
      subtitle: "Nuansa obsidian charcoal eksklusif & emas mewah. Nyaman di mata saat kerja malam hari.",
      icon: Moon,
      previewBg: "bg-[#1E1E1E]",
      previewSurface: "bg-[#252525]",
      previewBorder: "border-[#3D382F]",
      previewText: "text-[#F5EDDC]",
      previewGold: "text-[#D4AD5C]",
    },
    {
      id: "system",
      title: "Ikuti Sistem",
      subtitle: "Menyesuaikan otomatis dengan tema perangkat (laptop/smartphone) Anda.",
      icon: Laptop,
      previewBg: "bg-gradient-to-r from-[#FBF7EC] to-[#1E1E1E]",
      previewSurface: "bg-[#FFFFFF]/90",
      previewBorder: "border-[#D4AD5C]",
      previewText: "text-[#1A1A1A]",
      previewGold: "text-[#EEB100]",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="pb-4 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-2.5 text-[#EEB100]">
          <Palette size={22} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Konfigurasi Aplikasi
          </span>
        </div>
        <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A] mt-1">
          Pengaturan Sistem
        </h1>
        <p className="text-[14px] text-[#5E5A52] mt-1">
          Sesuaikan tema tampilan antarmuka, kenyamanan visual, dan konfigurasi sistem WEDORA.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF7F0] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "appearance"
              ? "bg-[#EEB100] text-[#111111] shadow-xs"
              : "text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
          }`}
        >
          <Palette size={16} />
          <span>Tampilan & Tema</span>
        </button>

        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "whatsapp"
              ? "bg-[#EEB100] text-[#111111] shadow-xs"
              : "text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
          }`}
        >
          <MessageSquare size={16} />
          <span>Template WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "activity"
              ? "bg-[#EEB100] text-[#111111] shadow-xs"
              : "text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
          }`}
        >
          <Activity size={16} />
          <span>Log Aktivitas</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-[#EEB100] text-[#111111] shadow-xs"
              : "text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] hover:bg-[#FAF6ED] dark:hover:bg-[#252525]"
          }`}
        >
          <Shield size={16} />
          <span>Keamanan Akun</span>
        </button>
      </div>

      {/* Tab Content: Appearance */}
      {activeTab === "appearance" && (
        <div className="space-y-8">
          {/* Section 1: Pilihan Tema */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-sans text-[20px] font-bold text-[#1A1A1A]">
                  Pilihan Tema Warna
                </h2>
                <p className="text-xs text-[#5E5A52] mt-0.5">
                  Pilih nuansa antarmuka yang paling nyaman untuk Anda bekerja.
                </p>
              </div>

              <div className="text-xs text-[#EEB100] font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(212,173,92,0.14)] border border-[#E5DEC9]">
                <Sparkles size={13} />
                <span>Aktif: {resolvedTheme === "dark" ? "Mode Gelap" : "Mode Terang"}</span>
              </div>
            </div>

            {/* 3 Theme Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {themeOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = theme === opt.id;

                return (
                  <div
                    key={opt.id}
                    onClick={() => setTheme(opt.id)}
                    className={`group relative p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#EEB100] bg-[#FFFFFF] shadow-[0_6px_20px_rgba(238,177,0,0.18)]"
                        : "border-[#E5DEC9] bg-[#FFFFFF] hover:border-[#D4AD5C] hover:shadow-sm"
                    }`}
                  >
                    <div>
                      {/* Mockup Preview Visual Mini */}
                      <div
                        className={`w-full h-28 rounded-xl p-3 border mb-4 flex flex-col justify-between overflow-hidden shadow-inner ${opt.previewBg} ${opt.previewBorder}`}
                      >
                        {/* Header Mockup */}
                        <div className="flex items-center justify-between border-b border-black/10 pb-1.5">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                          </div>
                          <span className={`text-[10px] font-bold ${opt.previewGold}`}>
                            WEDORA
                          </span>
                        </div>

                        {/* Card Mockup Mini */}
                        <div
                          className={`p-2 rounded-lg border ${opt.previewSurface} ${opt.previewBorder} shadow-xs flex items-center justify-between`}
                        >
                          <div>
                            <div className={`text-[9px] font-semibold ${opt.previewText}`}>
                              Total Booking
                            </div>
                            <div className={`text-[12px] font-bold ${opt.previewGold}`}>
                              Rp29.000.000
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full bg-[#EEB100]/30 flex items-center justify-center">
                            <Sparkles size={8} className="text-[#EEB100]" />
                          </div>
                        </div>
                      </div>

                      {/* Header Kartu Pilihan */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-2 rounded-xl border ${
                              isSelected
                                ? "bg-[#EEB100] text-[#111111] border-[#EEB100]"
                                : "bg-[#FAF6ED] text-[#EEB100] border-[#E5DEC9]"
                            }`}
                          >
                            <IconComponent size={18} />
                          </div>
                          <span className="font-sans font-bold text-base text-[#1A1A1A]">
                            {opt.title}
                          </span>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#2F7A4B] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check size={14} />
                          </div>
                        )}
                      </div>

                      {/* Deskripsi */}
                      <p className="text-xs text-[#5E5A52] mt-2.5 leading-relaxed">
                        {opt.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-[#E5DEC9]/50 flex items-center justify-between text-[11px]">
                      <span className="text-[#8A857B]">
                        {isSelected ? "Sedang Digunakan" : "Klik untuk Terapkan"}
                      </span>
                      <span
                        className={`font-semibold ${
                          isSelected ? "text-[#EEB100]" : "text-[#5E5A52] group-hover:text-[#1A1A1A]"
                        }`}
                      >
                        {isSelected ? "Aktif ✓" : "Pilih"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Live Preview Komponen */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#EEB100]">
              <Eye size={18} />
              <h3 className="font-sans text-[17px] font-bold text-[#1A1A1A]">
                Pratinjau Langsung Komponen (Live Preview)
              </h3>
            </div>
            <p className="text-xs text-[#5E5A52]">
              Berikut simulasi elemen kartu, status badge, dan tombol di dalam tema yang saat ini sedang aktif:
            </p>

            <div className="p-5 rounded-xl border border-[#E5DEC9] bg-[#FAF6ED] space-y-4">
              {/* Card Mini Dummy */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-[#FFFFFF] border border-[#E5DEC9] rounded-xl shadow-xs space-y-1">
                  <span className="text-xs text-[#5E5A52]">Contoh Kartu Angka</span>
                  <div className="text-2xl font-bold text-[#EEB100]">7 Acara</div>
                  <span className="text-[11px] text-[#8A857B]">Periode Berjalan</span>
                </div>

                <div className="p-4 bg-[#FFFFFF] border border-[#E5DEC9] rounded-xl shadow-xs space-y-1">
                  <span className="text-xs text-[#5E5A52]">Estimasi Nilai</span>
                  <div className="text-2xl font-bold text-[#2F7A4B]">Rp97.500.000</div>
                  <span className="text-[11px] text-[#8A857B]">Total Potensi Omzet</span>
                </div>

                <div className="p-4 bg-[#FFFFFF] border border-[#E5DEC9] rounded-xl shadow-xs space-y-1">
                  <span className="text-xs text-[#5E5A52]">Indikator Peringatan</span>
                  <div className="text-2xl font-bold text-[#B13C30]">43% Konfirmasi</div>
                  <span className="text-[11px] text-[#8A857B]">Perlu Tindak Lanjut</span>
                </div>
              </div>

              {/* Status Badges & Buttons Dummy */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5DEC9]">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="dikonfirmasi" />
                  <StatusBadge status="belum_dikonfirmasi" />
                  <StatusBadge status="perlu_koreksi" />
                  <StatusBadge status="dibatalkan" />
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Tombol Garis
                  </Button>
                  <Button variant="primary" size="sm">
                    Tombol Utama Gold
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Kerapatan Tampilan */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#EEB100]">
              <Layers size={18} />
              <h3 className="font-sans text-[17px] font-bold text-[#1A1A1A]">
                Kerapatan Tampilan Tabel (Density)
              </h3>
            </div>
            <p className="text-xs text-[#5E5A52]">
              Atur jarak spasi baris tabel data agar sesuai dengan preferensi kenyamanan mata Anda:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
              <button
                type="button"
                onClick={() => setDensity("comfortable")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  density === "comfortable"
                    ? "border-[#EEB100] bg-[rgba(212,173,92,0.12)] text-[#1A1A1A] font-semibold"
                    : "border-[#E5DEC9] bg-[#FFFFFF] text-[#5E5A52] hover:bg-[#FAF6ED]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A]">Nyaman (Comfortable)</span>
                  {density === "comfortable" && <Check size={16} className="text-[#EEB100]" />}
                </div>
                <p className="text-xs text-[#8A857B] mt-1">
                  Spasi baris lega, nyaman dibaca untuk pemakaian harian.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDensity("compact")}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  density === "compact"
                    ? "border-[#EEB100] bg-[rgba(212,173,92,0.12)] text-[#1A1A1A] font-semibold"
                    : "border-[#E5DEC9] bg-[#FFFFFF] text-[#5E5A52] hover:bg-[#FAF6ED]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#1A1A1A]">Ringkas (Compact)</span>
                  {density === "compact" && <Check size={16} className="text-[#EEB100]" />}
                </div>
                <p className="text-xs text-[#8A857B] mt-1">
                  Spasi baris lebih rapat, muat lebih banyak data dalam satu layar monitor.
                </p>
              </button>
            </div>
          </Card>

          {/* Section 4: Informasi Versi Aplikasi */}
          <div className="p-4 rounded-xl bg-[#FAF6ED] border border-[#E5DEC9] flex items-center justify-between text-xs text-[#5E5A52]">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-[#EEB100] shrink-0" />
              <span>
                <strong>WEDORA Sistem Manajemen Digital</strong> — Versi 1.2.0 (Build 2026.10)
              </span>
            </div>
            <span className="font-mono text-[#8A857B]">Next.js 16 • Tailwind 4 • Supabase</span>
          </div>
        </div>
      )}

      {/* Tab Content: WhatsApp Template */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6ED] to-[#FFFFFF] dark:from-[#252525] dark:to-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="font-sans text-[18px] sm:text-[20px] font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                  Kustomisasi Template Pesan WhatsApp
                </h2>
                <p className="text-xs sm:text-sm text-[#5E5A52] dark:text-[#A8A296] mt-0.5 max-w-2xl">
                  Pesan ini akan otomatis terisi saat admin mengklik tombol <strong>&quot;Kirim via WhatsApp&quot;</strong> di halaman rincian booking. Gunakan variabel dinamis agar data pengantin terisi otomatis.
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[rgba(47,122,75,0.15)] text-[#2F7A4B] dark:text-[#7FD39B] border border-[#2F7A4B]/30 text-xs font-semibold animate-in fade-in duration-200 shrink-0">
                <CheckCircle2 size={16} />
                <span>Template Berhasil Disimpan!</span>
              </div>
            )}
          </div>

          {/* 2 Columns: Editor (Left) & WhatsApp Live Preview (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Kolom Kiri: Form Editor Template */}
            <div className="lg:col-span-7 space-y-5">
              {/* Card Pilihan Preset Cepat */}
              <Card className="p-4 sm:p-5 space-y-3 bg-[#FFFFFF] dark:bg-[#202020] border border-[#E5DEC9] dark:border-[#38342C]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#EEB100] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Pilihan Preset Cepat
                  </span>
                  <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                    Klik untuk menerapkan template
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRESET_WA_TEMPLATES.map((preset) => {
                    const isCurrent = waTemplate === preset.content;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setWaTemplate(preset.content);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? "border-[#EEB100] bg-[rgba(212,173,92,0.12)] dark:bg-[#2A261F] shadow-xs"
                            : "border-[#E5DEC9] dark:border-[#38342C] bg-[#FAF7F0] dark:bg-[#252525] hover:border-[#D4AD5C] dark:hover:border-[#EEB100]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                            {preset.name}
                          </span>
                          {isCurrent && <Check size={14} className="text-[#EEB100]" />}
                        </div>
                        <p className="text-[11px] text-[#5E5A52] dark:text-[#A8A296] mt-1 line-clamp-2">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Card Editor Teks & Variabel */}
              <Card className="p-4 sm:p-5 space-y-4 bg-[#FFFFFF] dark:bg-[#202020] border border-[#E5DEC9] dark:border-[#38342C]">
                {/* Chip Variabel Dinamis */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#EEB100] uppercase tracking-wider flex items-center gap-1.5">
                      <Tag size={13} />
                      Sisipkan Variabel Dinamis (Klik Tag)
                    </label>
                    <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                      Otomatis diisi sistem
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {WA_AVAILABLE_VARIABLES.map((v) => (
                      <button
                        key={v.tag}
                        type="button"
                        onClick={() => {
                          if (!textareaRef.current) {
                            setWaTemplate((prev) => prev + " " + v.tag);
                            return;
                          }
                          const start = textareaRef.current.selectionStart || 0;
                          const end = textareaRef.current.selectionEnd || 0;
                          const updated = waTemplate.substring(0, start) + v.tag + waTemplate.substring(end);
                          setWaTemplate(updated);
                          setTimeout(() => {
                            if (textareaRef.current) {
                              textareaRef.current.focus();
                              textareaRef.current.setSelectionRange(start + v.tag.length, start + v.tag.length);
                            }
                          }, 50);
                        }}
                        className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF6ED] dark:bg-[#28251E] border border-[#D6CEBE] dark:border-[#3D382F] hover:border-[#EEB100] dark:hover:border-[#EEB100] text-xs font-mono font-medium text-[#1A1A1A] dark:text-[#F5EDDC] transition-colors cursor-pointer shadow-2xs"
                        title={`Contoh isi: ${v.example}`}
                      >
                        <span className="text-[#EEB100] font-bold">+</span>
                        <span>{v.tag}</span>
                        <span className="text-[10px] text-[#8A857B] dark:text-[#A8A296] hidden sm:inline">
                          ({v.label})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea Template */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#5E5A52] dark:text-[#A8A296]">
                      Isi Teks Pesan WhatsApp
                    </label>
                    <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                      {waTemplate.length} karakter
                    </span>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={10}
                    value={waTemplate}
                    onChange={(e) => setWaTemplate(e.target.value)}
                    placeholder="Tulis template pesan WhatsApp di sini..."
                    className="w-full p-3.5 bg-[#FFFFFF] dark:bg-[#252525] border border-[#D6CEBE] dark:border-[#38342C] rounded-xl text-xs sm:text-sm font-sans leading-relaxed text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:border-[#EEB100] dark:focus:border-[#EEB100] transition-colors"
                  />
                </div>

                {/* Tombol Aksi Simpan & Reset */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5DEC9] dark:border-[#332F28]">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      onClick={() => {
                        saveStoredWhatsAppTemplate(waTemplate);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 3000);
                      }}
                      className="gap-2 text-xs sm:text-sm shadow-sm"
                    >
                      <Save size={16} />
                      <span>Simpan Template</span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setIsResetWaModalOpen(true)}
                      className="gap-1.5 text-xs sm:text-sm"
                      title="Kembalikan teks ke format standar sistem"
                    >
                      <RotateCcw size={15} />
                      <span>Reset Bawaan</span>
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = {
                        nama: "Candra",
                        tanggal: "21 Oktober 2026",
                        paket: "PAKET SIRAMAN",
                        lokasi: "Hotel Heritage, Purwokerto",
                        tautan: "https://wedora.id/konfirmasi/abc123xyz",
                        nominal_dp: 5000000,
                        status_dp: "DP Diterima",
                      };
                      navigator.clipboard.writeText(formatWhatsAppMessage(waTemplate, sample));
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    }}
                    className="text-xs text-[#5E5A52] dark:text-[#A8A296] hover:text-[#EEB100] dark:hover:text-[#EEB100] inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-[#E5DEC9] dark:border-[#38342C] transition-colors cursor-pointer"
                  >
                    {copySuccess ? <Check size={14} className="text-[#2F7A4B]" /> : <Copy size={14} />}
                    <span>{copySuccess ? "Tersalin!" : "Salin Contoh Pesan"}</span>
                  </button>
                </div>
              </Card>
            </div>

            {/* Kolom Kanan: Simulator Chat WhatsApp Live */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#EEB100] uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone size={14} />
                  Simulasi Tampilan WhatsApp
                </span>
                <span className="text-[11px] text-[#8A857B] dark:text-[#A8A296]">
                  Pratinjau Live Calon Pengantin
                </span>
              </div>

              {/* Phone Mockup Frame */}
              <div className="rounded-3xl border-4 border-[#2C2C2C] dark:border-[#3A3A3A] bg-[#EFEAE2] dark:bg-[#0B141A] shadow-xl overflow-hidden max-w-sm mx-auto w-full">
                {/* Status Bar Ponsel */}
                <div className="bg-[#075E54] dark:bg-[#1F2C34] px-4 py-1 text-white flex items-center justify-between text-[10px] font-mono opacity-90">
                  <span>21:00</span>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span>4G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* WhatsApp Top App Bar */}
                <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white p-3 flex items-center gap-2.5 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-[#FAF6ED] text-[#111111] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D4AD5C]">
                    EW
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold truncate">Era Waluyo Galeri</h4>
                    <p className="text-[10px] text-white/80 leading-none mt-0.5">online</p>
                  </div>
                </div>

                {/* Chat Canvas with Wallpaper */}
                <div className="p-3 sm:p-4 min-h-[360px] max-h-[460px] overflow-y-auto custom-scrollbar flex flex-col justify-end space-y-3 bg-[#EFEAE2] dark:bg-[#0B141A]">
                  {/* Date badge */}
                  <div className="text-center my-1">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-[#FFFFFF]/85 dark:bg-[#182229] text-[10px] text-[#54656F] dark:text-[#8696A0] shadow-2xs font-medium">
                      HARI INI
                    </span>
                  </div>

                  {/* Outgoing WhatsApp Chat Bubble */}
                  <div className="ml-auto max-w-[90%] p-3 rounded-2xl rounded-tr-xs bg-[#E7FFDB] dark:bg-[#005C4B] text-[#111B21] dark:text-[#E9EDEF] shadow-xs text-xs space-y-2 relative border border-black/5">
                    <div className="whitespace-pre-wrap leading-relaxed font-sans text-[12px] break-words">
                      {formatWhatsAppMessage(waTemplate, {
                        nama: "Candra",
                        tanggal: "21 Oktober 2026",
                        paket: "PAKET SIRAMAN",
                        lokasi: "Hotel Heritage, Purwokerto",
                        tautan: "https://wedora.id/konfirmasi/abc123xyz",
                        nominal_dp: 5000000,
                        status_dp: "DP Diterima",
                      })}
                    </div>

                    {/* Timestamp & Read Receipt */}
                    <div className="flex items-center justify-end gap-1 text-[10px] text-[#667781] dark:text-[#8696A0] pt-0.5">
                      <span>21:01</span>
                      <span className="text-[#53BDEB] font-bold tracking-tighter">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Bawah Simulator */}
              <div className="p-3 rounded-xl bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] text-xs text-[#5E5A52] dark:text-[#A8A296] space-y-1">
                <p className="font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] flex items-center gap-1.5">
                  <Info size={14} className="text-[#EEB100]" />
                  Simulasi Variabel Dinamis
                </p>
                <p className="text-[11px] leading-relaxed">
                  Pratinjau di atas menggunakan contoh data pemesan <strong>Kak Candra</strong> (21 Okt 2026). Saat dikirim ke pengantin asli, variabel <code>{`{...}`}</code> otomatis diganti dengan data booking terkait.
                </p>
              </div>

              {/* Tombol Uji Coba Langsung ke WhatsApp */}
              <a
                href={createWhatsAppUrl(
                  "62888888888",
                  formatWhatsAppMessage(waTemplate, {
                    nama: "Candra",
                    tanggal: "21 Oktober 2026",
                    paket: "PAKET SIRAMAN",
                    lokasi: "Hotel Heritage, Purwokerto",
                    tautan: "https://wedora.id/konfirmasi/abc123xyz",
                    nominal_dp: 5000000,
                    status_dp: "DP Diterima",
                  })
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full gap-2 text-xs h-10 border-[#25D366]/40 hover:bg-[#25D366]/10 text-[#25D366] dark:text-[#25D366] cursor-pointer"
                >
                  <Send size={15} />
                  <span>Uji Coba Kirim ke WhatsApp Saya</span>
                  <ExternalLink size={13} className="ml-auto opacity-70" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Log Aktivitas */}
      {activeTab === "activity" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <ActivityLogTab
            logs={auditLogs}
            isLoading={isLoadingLogs}
            onRefresh={loadAuditLogs}
          />
        </div>
      )}

      {/* Tab Content: Keamanan Akun */}
      {activeTab === "security" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6ED] via-[#FFFFFF] to-[#FAF6ED] dark:from-[#252525] dark:via-[#1E1E1E] dark:to-[#252525] border border-[#E5DEC9] dark:border-[#38342C] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#EEB100] text-[#111111] flex items-center justify-center shrink-0 shadow-sm font-bold">
                <Shield size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                  Keamanan & Kredensial Administrator
                </h3>
                <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-0.5">
                  Kelola kata sandi akun, pantau status autentikasi, dan lindungi akses sistem operasional WEDORA.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2F7A4B]/15 text-[#2F7A4B] dark:text-[#7FD39B] border border-[#2F7A4B]/25">
                <CheckCircle2 size={13} />
                Sistem Terlindungi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Kolom Kiri: Form Ubah Kata Sandi */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="p-6 space-y-6 border-[#E5DEC9] dark:border-[#38342C]">
                <div>
                  <div className="flex items-center gap-2 text-[#EEB100]">
                    <Key size={18} />
                    <h2 className="font-sans text-lg font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                      Perbarui Kata Sandi
                    </h2>
                  </div>
                  <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-1">
                    Gunakan kombinasi minimal 8 karakter dengan huruf, angka, dan simbol untuk keamanan maksimal.
                  </p>
                </div>

                {/* Notifikasi Sukses */}
                {passwordSuccess && (
                  <div className="p-3.5 rounded-xl bg-[#2F7A4B]/10 border border-[#2F7A4B]/30 flex items-start gap-2.5 text-xs text-[#2F7A4B] dark:text-[#7FD39B]">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">Berhasil!</p>
                      <p>{passwordSuccess}</p>
                    </div>
                  </div>
                )}

                {/* Notifikasi Error */}
                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-[#B13C30]/10 border border-[#B13C30]/30 flex items-start gap-2.5 text-xs text-[#B13C30] dark:text-[#F87171]">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold">Terjadi Kesalahan</p>
                      <p>{passwordError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {/* Kata Sandi Lama */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                      Kata Sandi Saat Ini <span className="text-[#8A857B] font-normal">(opsional verifikasi)</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan kata sandi lama Anda"
                        autoComplete="current-password"
                        className="w-full h-10 px-3.5 pr-10 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:ring-2 focus:ring-[#EEB100]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] p-1 cursor-pointer"
                        title={showCurrentPass ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                      Kata Sandi Baru <span className="text-[#B13C30]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter baru"
                        autoComplete="new-password"
                        required
                        className="w-full h-10 px-3.5 pr-10 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:ring-2 focus:ring-[#EEB100]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] p-1 cursor-pointer"
                        title={showNewPass ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-1.5 pt-1.5">
                        <div className="h-1.5 w-full bg-[#E5DEC9] dark:bg-[#38342C] rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.bg} ${passwordStrength.width}`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#5E5A52] dark:text-[#A8A296]">Kekuatan Sandi:</span>
                          <span className={`font-semibold ${passwordStrength.color}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                      Konfirmasi Kata Sandi Baru <span className="text-[#B13C30]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        autoComplete="new-password"
                        required
                        className="w-full h-10 px-3.5 pr-10 text-xs rounded-xl bg-[#FAF7F0] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] text-[#1A1A1A] dark:text-[#F5EDDC] focus:outline-none focus:ring-2 focus:ring-[#EEB100]/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] p-1 cursor-pointer"
                        title={showConfirmPass ? "Sembunyikan" : "Tampilkan"}
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {confirmPassword && (
                      <p
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          newPassword === confirmPassword
                            ? "text-[#2F7A4B] dark:text-[#7FD39B]"
                            : "text-[#B13C30]"
                        }`}
                      >
                        {newPassword === confirmPassword ? (
                          <>
                            <Check size={13} /> Kata sandi cocok
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={13} /> Kata sandi belum cocok
                          </>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      type="submit"
                      disabled={isUpdatingPassword || !newPassword || newPassword !== confirmPassword}
                      className="gap-2 bg-[#EEB100] text-[#111111] font-semibold hover:bg-[#D4AD5C] shadow-sm disabled:opacity-50 cursor-pointer text-xs h-10 px-5"
                    >
                      <Lock size={15} />
                      <span>{isUpdatingPassword ? "Menyimpan..." : "Perbarui Kata Sandi"}</span>
                    </Button>

                    {(currentPassword || newPassword || confirmPassword) && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError(null);
                        }}
                        className="text-xs h-10 border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#A8A296] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] cursor-pointer"
                      >
                        Batal
                      </Button>
                    )}
                  </div>
                </form>
              </Card>

              {/* Pedoman Keamanan */}
              <div className="p-4 rounded-2xl bg-[#FAF6ED] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] space-y-2.5">
                <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-[#F5EDDC] flex items-center gap-2">
                  <Shield size={14} className="text-[#EEB100]" />
                  Pedoman Keamanan Akun
                </h4>
                <ul className="text-xs text-[#5E5A52] dark:text-[#A8A296] space-y-1.5 list-disc list-inside">
                  <li>Gunakan kata sandi unik yang tidak digunakan di layanan lain.</li>
                  <li>Kombinasikan huruf kapital, angka, dan karakter khusus seperti <code>@, #, !</code>.</li>
                  <li>Jangan bagikan kredensial login kepada pihak lain di luar tim administrator.</li>
                  <li>Selalu klik <strong>Keluar Akun</strong> jika mengakses dari komputer publik atau bersama.</li>
                </ul>
              </div>
            </div>

            {/* Kolom Kanan: Profil & Sesi Login */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card Informasi Akun */}
              <Card className="p-6 space-y-5 border-[#E5DEC9] dark:border-[#38342C]">
                <div className="flex items-center gap-2 text-[#EEB100]">
                  <User size={18} />
                  <h3 className="font-sans text-base font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                    Profil Administrator
                  </h3>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C]">
                  <div className="w-13 h-13 rounded-2xl bg-[#EEB100] text-[#111111] flex items-center justify-center font-serif text-lg font-black tracking-wider shrink-0 shadow-sm">
                    EW
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-[#1A1A1A] dark:text-[#F5EDDC] truncate">
                        Admin WEDORA
                      </p>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-[#EEB100] text-[#111111] shadow-2xs">
                        {initialSecurityDetails?.role || "Administrator"}
                      </span>
                    </div>
                    <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] truncate mt-0.5">
                      {initialSecurityDetails?.email || "admin@erawaluyo.com"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-xs border-t border-[#E5DEC9] dark:border-[#38342C] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E5A52] dark:text-[#A8A296]">Status Autentikasi:</span>
                    <span className="font-semibold text-[#2F7A4B] dark:text-[#7FD39B] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2F7A4B] animate-pulse"></span>
                      Aktif & Terverifikasi
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E5A52] dark:text-[#A8A296]">ID Pengguna:</span>
                    <span className="font-mono text-[11px] text-[#1A1A1A] dark:text-[#F5EDDC] bg-[#FAF7F0] dark:bg-[#1E1E1E] px-2 py-0.5 rounded border border-[#E5DEC9] dark:border-[#38342C] max-w-[170px] truncate" title={initialSecurityDetails?.id || "admin-system"}>
                      {initialSecurityDetails?.id ? `${initialSecurityDetails.id.slice(0, 8)}...` : "admin-system"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#5E5A52] dark:text-[#A8A296]">Penyedia Akun:</span>
                    <span className="text-[#1A1A1A] dark:text-[#F5EDDC] font-medium">Supabase Auth</span>
                  </div>
                </div>
              </Card>

              {/* Card Sesi Login Aktif */}
              <Card className="p-6 space-y-4 border-[#E5DEC9] dark:border-[#38342C]">
                <div className="flex items-center gap-2 text-[#EEB100]">
                  <Laptop size={18} />
                  <h3 className="font-sans text-base font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                    Sesi & Perangkat Aktif
                  </h3>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F0] dark:bg-[#1E1E1E] border border-[#E5DEC9] dark:border-[#38342C] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2F7A4B]/15 text-[#2F7A4B] dark:text-[#7FD39B] flex items-center justify-center shrink-0 mt-0.5">
                    <Laptop size={16} />
                  </div>
                  <div className="text-xs space-y-0.5 min-w-0">
                    <p className="font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] flex items-center gap-1.5">
                      Peramban Saat Ini (Browser)
                      <span className="text-[10px] px-1.5 py-0.2 bg-[#2F7A4B]/20 text-[#2F7A4B] dark:text-[#7FD39B] rounded font-bold">
                        Sesi Ini
                      </span>
                    </p>
                    <p className="text-[#5E5A52] dark:text-[#A8A296] text-[11px]">
                      {initialSecurityDetails?.lastSignInAt
                        ? `Masuk: ${new Date(initialSecurityDetails.lastSignInAt).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`
                        : "Sesi terotentikasi aktif"}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E5DEC9] dark:border-[#38342C]">
                  {!showLogoutConfirm ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowLogoutConfirm(true)}
                      className="w-full gap-2 text-xs h-10 border-[#B13C30]/40 text-[#B13C30] hover:bg-[#B13C30]/10 hover:text-[#B13C30] cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Keluar dari Akun (Logout)</span>
                    </Button>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#B13C30]/10 border border-[#B13C30]/30 space-y-2.5">
                      <p className="text-xs font-semibold text-[#B13C30] dark:text-[#F87171] flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Yakin ingin keluar dari sesi admin?
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="flex-1 text-xs h-8 bg-[#B13C30] text-white hover:bg-[#8F2D23] cursor-pointer"
                        >
                          {isLoggingOut ? "Mengeluarkan..." : "Ya, Keluar"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLogoutConfirm(false)}
                          disabled={isLoggingOut}
                          className="flex-1 text-xs h-8 border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#A8A296] cursor-pointer"
                        >
                          Batal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Navigasi Cepat & Banner Log Aktivitas */}
            <div className="lg:col-span-12 pt-2">
              <Card className="p-5 border-[#E5DEC9] dark:border-[#38342C] bg-gradient-to-r from-[#FAF6ED] via-[#FFFFFF] to-[#FAF6ED] dark:from-[#252525] dark:via-[#1E1E1E] dark:to-[#252525]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EEB100]/15 text-[#EEB100]">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                        Audit Trail & Log Aktivitas Sistem
                      </h4>
                      <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-0.5">
                        Jejak lengkap aktivitas login, penambahan data booking terbaru, dan edit pesanan telah dipusatkan pada tab Log Aktivitas.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("activity")}
                    className="text-xs gap-1.5 h-8 border-[#EEB100] text-[#1A1A1A] dark:text-[#EEB100] hover:bg-[#EEB100]/10 cursor-pointer font-semibold shrink-0"
                  >
                    <span>Buka Log Aktivitas</span>
                    <ExternalLink size={12} />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

      )}

      <ConfirmModal
        isOpen={isResetWaModalOpen}
        onClose={() => setIsResetWaModalOpen(false)}
        onConfirm={() => {
          resetStoredWhatsAppTemplate();
          setWaTemplate(DEFAULT_WA_TEMPLATE);
          setSaveSuccess(true);
          setIsResetWaModalOpen(false);
          setTimeout(() => setSaveSuccess(false), 3000);
        }}
        title="Reset Template WhatsApp"
        description="Kembalikan format pesan WhatsApp konfirmasi ke pengaturan bawaan Era Waluyo? Seluruh perubahan template kustom saat ini akan diganti dengan format resmi standar."
        confirmText="Reset Template"
        cancelText="Batal"
        variant="warning"
      />
    </div>
  );
}
