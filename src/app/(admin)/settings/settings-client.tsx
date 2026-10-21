"use client";

import React, { useState } from "react";
import {
  Sun,
  Moon,
  Laptop,
  Check,
  Palette,
  Building2,
  MessageSquare,
  Shield,
  Sparkles,
  Info,
  Layers,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { useTheme, Theme } from "@/components/theme/theme-provider";

export default function SettingsClient() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"appearance" | "profile" | "whatsapp" | "security">("appearance");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

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
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer opacity-75 hover:opacity-100 ${
            activeTab === "profile"
              ? "bg-[#EEB100] text-[#111111]"
              : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
          }`}
        >
          <Building2 size={16} />
          <span>Profil & Rekening</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE1CF] text-[#5E5A52]">
            Tahap 2
          </span>
        </button>

        <button
          onClick={() => setActiveTab("whatsapp")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer opacity-75 hover:opacity-100 ${
            activeTab === "whatsapp"
              ? "bg-[#EEB100] text-[#111111]"
              : "text-[#5E5A52] hover:text-[#1A1A1A] hover:bg-[#FAF6ED]"
          }`}
        >
          <MessageSquare size={16} />
          <span>Template WhatsApp</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE1CF] text-[#5E5A52]">
            Tahap 2
          </span>
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

      {/* Tab Content: Placeholder for Upcoming Tabs */}
      {activeTab !== "appearance" && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] text-[#EEB100] flex items-center justify-center">
            {activeTab === "profile" && <Building2 size={28} />}
            {activeTab === "whatsapp" && <MessageSquare size={28} />}
            {activeTab === "security" && <Shield size={28} />}
          </div>
          <div>
            <h3 className="font-sans text-[20px] font-bold text-[#1A1A1A]">
              Fitur Dijadwalkan untuk Tahap Berikutnya
            </h3>
            <p className="text-xs text-[#5E5A52] mt-1 max-w-md mx-auto">
              Tab ini akan memuat form pengaturan{" "}
              {activeTab === "profile"
                ? "nama galeri, alamat studio, nomor rekening bank, dan kop surat"
                : activeTab === "whatsapp"
                ? "kustomisasi template pesan otomatis WhatsApp ke calon pengantin"
                : "ubah kata sandi admin dan keamanan akun"}
              .
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
