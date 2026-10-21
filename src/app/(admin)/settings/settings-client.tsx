"use client";
import React, { useState, useRef, useSyncExternalStore } from "react";
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
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  Send,
  Smartphone,
  Tag,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
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

const emptySubscribe = () => () => {};

export default function SettingsClient() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  // Ambil initial tab dari URL query jika ada (misal /settings?tab=whatsapp)
  const initialTab = useSyncExternalStore<"appearance" | "whatsapp" | "security">(
    emptySubscribe,
    () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      return tabParam === "whatsapp" || tabParam === "security" ? tabParam : "appearance";
    },
    () => "appearance"
  );

  const [activeTab, setActiveTab] = useState<"appearance" | "whatsapp" | "security">(initialTab);
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

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
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#FAF7F0] border border-[#E5DEC9] rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "appearance"
              ? "bg-[#EEB100] text-[#111111] shadow-xs"
              : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
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
              : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
          }`}
        >
          <MessageSquare size={16} />
          <span>Template WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer opacity-75 hover:opacity-100 ${
            activeTab === "security"
              ? "bg-[#EEB100] text-[#111111]"
              : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
          }`}
        >
          <Shield size={16} />
          <span>Keamanan Akun</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE1CF] text-[#5E5A52]">
            Tahap 2
          </span>
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
                      onClick={() => {
                        if (confirm("Kembalikan template pesan WhatsApp ke pengaturan bawaan Era Waluyo?")) {
                          resetStoredWhatsAppTemplate();
                          setWaTemplate(DEFAULT_WA_TEMPLATE);
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        }
                      }}
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

      {/* Tab Content: Placeholder for Security */}
      {activeTab === "security" && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] text-[#EEB100] flex items-center justify-center">
            <Shield size={28} />
          </div>
          <div>
            <h3 className="font-sans text-[20px] font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
              Keamanan Akun Admin
            </h3>
            <p className="text-xs text-[#5E5A52] dark:text-[#A8A296] mt-1 max-w-md mx-auto">
              Fitur ubah kata sandi admin dan autentikasi multi-faktor dijadwalkan pada pembaruan tahap berikutnya.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("appearance")}
            className="text-xs"
          >
            Kembali ke Pengaturan Tema
          </Button>
        </Card>
      )}
    </div>
  );
}
