"use client";

import React, { useState } from "react";
import { CheckCircle2, Phone, Calendar, MapPin, Sparkles, MessageSquare, AlertCircle } from "lucide-react";
import { confirmBookingByCustomer } from "@/lib/actions/booking";

interface KonfirmasiClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any;
}

export default function KonfirmasiClient({ booking }: KonfirmasiClientProps) {
  const [status, setStatus] = useState<string>(booking.status || "belum_dikonfirmasi");
  const [koreksi, setKoreksi] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAlreadyConfirmed = status === "dikonfirmasi";

  const handleKonfirmasi = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await confirmBookingByCustomer(booking.token_konfirmasi, koreksi);

    if (res.success && res.status) {
      setStatus(res.status);
    } else {
      setErrorMessage(res.error || "Gagal menyimpan konfirmasi.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="theme-cream min-h-screen py-8 px-4 flex justify-center items-start text-[#111111]">
      <div className="w-full max-w-[560px] space-y-6">
        {/* Header Resmi Era Waluyo */}
        <div className="text-center space-y-2 py-4 border-b border-[#DDD2BA]">
          <h1 className="font-brand-logo text-3xl font-bold tracking-[0.2em] text-[#B8923F]">
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

        {errorMessage && (
          <div className="p-4 bg-[rgba(224,122,110,0.14)] border border-[#E07A6E] rounded-xl text-xs text-[#B13C30] flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {isAlreadyConfirmed ? (
          /* State Konfirmasi Berhasil */
          <div className="bg-[#FBF7EC] border border-[#DDD2BA] rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(127,211,155,0.2)] flex items-center justify-center text-[#2F7A4B]">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-sans text-2xl font-bold text-[#111111]">
              Pesanan Telah Dikonfirmasi
            </h2>
            <p className="text-sm text-[#5E5A52] leading-relaxed">
              Terima kasih Kak <strong>{booking.nama_pelanggan}</strong>. Rincian kesepakatan acara pernikahan telah tersimpan resmi dan terkonfirmasi di sistem Era Waluyo.
            </p>
            {koreksi && (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#DDD2BA] text-left text-xs text-[#5E5A52]">
                <strong className="block text-[#111111] mb-1 font-semibold">
                  Catatan Koreksi Anda:
                </strong>
                {koreksi}
              </div>
            )}
            <div className="pt-2 text-[11px] text-[#8F8A7F]">
              Waktu Konfirmasi: {new Date().toLocaleDateString("id-ID")}
            </div>
          </div>
        ) : (
          /* Form & Rincian Pesanan */
          <div className="space-y-6">
            <div className="bg-[#FBF7EC] border border-[#DDD2BA] rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-xs font-semibold text-[#B8923F] uppercase tracking-wider">
                  Konfirmasi Kesepakatan Resmi
                </span>
                <h2 className="font-sans text-2xl font-bold text-[#111111] mt-1">
                  Halo, {booking.nama_pelanggan}
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
                      {booking.tanggal_acara}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#B8923F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52]">Lokasi Pelaksanaan</div>
                    <div className="font-semibold text-[#111111]">
                      {booking.lokasi}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-[#B8923F] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52]">Paket Pilihan</div>
                    <div className="font-semibold text-[#111111]">
                      {booking.packages?.nama || "Paket Khusus Era Waluyo"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Busana & Dekorasi */}
              <div className="pt-4 border-t border-[#EADFC8] space-y-2 text-xs">
                <div className="font-semibold text-[#111111]">Rincian Layanan Disepakati:</div>
                <ul className="space-y-1.5 text-[#5E5A52] list-disc list-inside">
                  {booking.kebaya_baju && (
                    <li><strong>Busana / Kebaya:</strong> {booking.kebaya_baju} (Ukuran: {booking.ukuran || "M"})</li>
                  )}
                  {booking.dekorasi && (
                    <li><strong>Dekorasi:</strong> {booking.dekorasi}</li>
                  )}
                  {booking.makeup && (
                    <li><strong>Tata Rias (MUA):</strong> {booking.makeup}</li>
                  )}
                  {booking.mc && (
                    <li><strong>Master of Ceremony (MC):</strong> {booking.mc}</li>
                  )}
                  {booking.fotografer && (
                    <li><strong>Dokumentasi Foto:</strong> {booking.fotografer}</li>
                  )}
                  {booking.video && (
                    <li><strong>Video:</strong> {booking.video}</li>
                  )}
                  {booking.hiburan && (
                    <li><strong>Hiburan:</strong> {booking.hiburan}</li>
                  )}
                  {booking.catatan_khusus && (
                    <li><strong>Catatan Khusus:</strong> {booking.catatan_khusus}</li>
                  )}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#EADFC8] flex items-center justify-between text-xs">
                <span className="text-[#5E5A52]">Uang Muka (DP) Tercatat:</span>
                <span className="font-semibold text-[#2F7A4B] text-sm">
                  Rp{Number(booking.dp_nominal || 0).toLocaleString("id-ID")} (Lunas DP)
                </span>
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
