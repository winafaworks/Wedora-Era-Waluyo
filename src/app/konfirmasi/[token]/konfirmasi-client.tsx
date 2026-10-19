"use client";

import React, { useState } from "react";
import { CheckCircle2, Phone, Calendar, MapPin, Sparkles, MessageSquare } from "lucide-react";

interface KonfirmasiClientProps {
  token: string;
}

export default function KonfirmasiClient({ token }: KonfirmasiClientProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [koreksi, setKoreksi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockPesanan = {
    nama: "Aulia & Fajar",
    tanggalAcara: "24 Oktober 2026",
    lokasi: "Gedung Soetedja, Purwokerto",
    paket: "Paket Premium Gold Era Waluyo",
    kebaya: "Kebaya Solo Basahan Beludru Hitam (Ukuran M)",
    beskap: "Beskap Sikepan Hitam Gold (Ukuran L)",
    dekorasi: "Dekorasi Pelaminan Jawa Klasik 8 Meter + Mini Garden",
    mc: "Kak Deni Purwokerto",
    makeup: "Tim Era Waluyo Traditional MUA",
    catatan: "Akad pukul 08.00 WIB, resepsi mulai pukul 11.00 WIB.",
  };

  const handleKonfirmasi = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmed(true);
    }, 600);
  };

  return (
    <div className="theme-cream min-h-screen py-8 px-4 flex justify-center items-start text-[#111111]">
      <div className="w-full max-w-[560px] space-y-6">
        {/* Header Resmi Era Waluyo */}
        <div className="text-center space-y-2 py-4 border-b border-[#DDD2BA]">
          <h1 className="font-serif text-3xl font-bold tracking-[0.2em] text-[#B8923F]">
            ERA WALUYO
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#5E5A52] font-medium">
            Wedding Organizer & Traditional Attire • Purwokerto
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#5E5A52] bg-[#FBF7EC] px-3 py-1 rounded-full border border-[#DDD2BA]">
            <Phone size={12} />
            <span>Kontak Resmi: 0812-3456-7890</span>
          </div>
        </div>

        {confirmed ? (
          /* State Konfirmasi Berhasil */
          <div className="bg-[#FBF7EC] border border-[#DDD2BA] rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(127,211,155,0.2)] flex items-center justify-center text-[#2F7A4B]">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#111111]">
              Pesanan Telah Dikonfirmasi
            </h2>
            <p className="text-sm text-[#5E5A52] leading-relaxed">
              Terima kasih Kak <strong>{mockPesanan.nama}</strong>. Rincian kesepakatan acara telah tersimpan resmi di sistem Era Waluyo.
            </p>
            {koreksi && (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#DDD2BA] text-left text-xs text-[#5E5A52]">
                <strong className="block text-[#111111] mb-1 font-semibold">
                  Catatan Koreksi Anda:
                </strong>
                {koreksi}
              </div>
            )}
            <div className="pt-2 text-xs text-[#8F8A7F]">
              Token Verifikasi: {token || "RESMI-EW-2026"}
            </div>
          </div>
        ) : (
          /* Form & Rincian Pesanan */
          <div className="space-y-6">
            <div className="bg-[#FBF7EC] border border-[#DDD2BA] rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-xs font-semibold text-[#B8923F] uppercase tracking-wider">
                  Konfirmasi Kesepakatan
                </span>
                <h2 className="font-serif text-2xl font-medium text-[#111111] mt-1">
                  Halo, {mockPesanan.nama}
                </h2>
                <p className="text-xs text-[#5E5A52] mt-1">
                  Mohon periksa rincian pesanan Anda di bawah ini dengan teliti sebelum menyetujui.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#EADFC8] text-sm">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-[#B8923F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52]">Tanggal Acara</div>
                    <div className="font-semibold text-[#111111]">
                      {mockPesanan.tanggalAcara}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#B8923F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52]">Lokasi Pelaksanaan</div>
                    <div className="font-semibold text-[#111111]">
                      {mockPesanan.lokasi}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-[#B8923F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52]">Paket Pilihan</div>
                    <div className="font-semibold text-[#111111]">
                      {mockPesanan.paket}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Busana & Dekorasi */}
              <div className="pt-4 border-t border-[#EADFC8] space-y-2 text-xs">
                <div className="font-semibold text-[#111111]">Rincian Layanan:</div>
                <ul className="space-y-1.5 text-[#5E5A52] list-disc list-inside">
                  <li><strong>Busana Akad/Resepsi:</strong> {mockPesanan.kebaya} & {mockPesanan.beskap}</li>
                  <li><strong>Dekorasi:</strong> {mockPesanan.dekorasi}</li>
                  <li><strong>Master of Ceremony:</strong> {mockPesanan.mc}</li>
                  <li><strong>Tata Rias (MUA):</strong> {mockPesanan.makeup}</li>
                  <li><strong>Catatan Khusus:</strong> {mockPesanan.catatan}</li>
                </ul>
              </div>
            </div>

            {/* Kolom Catatan / Koreksi Pelanggan */}
            <div className="bg-[#FBF7EC] border border-[#DDD2BA] rounded-2xl p-6 space-y-3 shadow-sm">
              <label
                htmlFor="koreksi"
                className="block text-sm font-semibold text-[#111111] flex items-center gap-2"
              >
                <MessageSquare size={16} className="text-[#B8923F]" />
                <span>Ada rincian yang perlu diperbaiki? (Opsional)</span>
              </label>
              <textarea
                id="koreksi"
                value={koreksi}
                onChange={(e) => setKoreksi(e.target.value)}
                placeholder="Tuliskan di sini jika ada perubahan jam, ukuran baju, atau catatan lainnya..."
                rows={3}
                className="w-full p-3 bg-white border border-[#DDD2BA] rounded-xl text-sm text-[#111111] placeholder-[#8F8A7F] focus:outline-none focus:border-[#B8923F] transition-colors"
              />
            </div>

            {/* Tombol Konfirmasi Utama */}
            <div>
              <button
                onClick={handleKonfirmasi}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#B8923F] hover:bg-[#A68032] active:bg-[#8F6C27] text-white font-semibold rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50 text-base"
              >
                {isSubmitting ? "Menyimpan Konfirmasi..." : "Saya Setuju & Konfirmasi Pesanan"}
              </button>
              <p className="text-center text-[11px] text-[#8F8A7F] mt-3">
                Dengan menekan tombol di atas, Anda menyetujui rincian pesanan untuk diproses oleh Era Waluyo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
