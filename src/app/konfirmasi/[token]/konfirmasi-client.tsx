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
        <div className="text-center space-y-2.5 py-4 border-b border-[#DDD2BA] dark:border-[#38342C]">
          <h1 className="font-brand-logo text-3xl font-bold tracking-[0.2em] text-[#EEB100]">
            ERA WALUYO
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-[#5E5A52] dark:text-[#A8A49B] font-medium">
            Wedding Organizer & Traditional Attire • Purwokerto
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <a
              href="https://wa.me/6285747566123"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF7EC] dark:bg-[#252525] border border-[#DDD2BA] dark:border-[#38342C] text-[#5E5A52] dark:text-[#C7C2B6] hover:border-[#EEB100] hover:text-[#EEB100] transition-colors"
              title="Hubungi MUA via WhatsApp"
            >
              <Phone size={12} className="text-[#EEB100]" />
              <span>MUA: <strong className="font-semibold text-[#111111] dark:text-[#F5EDDC]">0857-4756-6123</strong></span>
            </a>
            <a
              href="https://wa.me/6281328443228"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBF7EC] dark:bg-[#252525] border border-[#DDD2BA] dark:border-[#38342C] text-[#5E5A52] dark:text-[#C7C2B6] hover:border-[#EEB100] hover:text-[#EEB100] transition-colors"
              title="Hubungi Vila & Dekorasi via WhatsApp"
            >
              <Phone size={12} className="text-[#EEB100]" />
              <span>Vila & Dekorasi: <strong className="font-semibold text-[#111111] dark:text-[#F5EDDC]">0813-2844-3228</strong></span>
            </a>
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
          <div className="bg-[#FBF7EC] dark:bg-[#1E1E1E] border border-[#DDD2BA] dark:border-[#38342C] rounded-2xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(127,211,155,0.2)] flex items-center justify-center text-[#2F7A4B] dark:text-[#7FD39B]">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="font-sans text-[20px] font-bold text-[#111111] dark:text-[#F5EDDC]">
              Pesanan Telah Dikonfirmasi
            </h2>
            <p className="text-[14px] text-[#5E5A52] dark:text-[#A8A49B] leading-relaxed">
              Terima kasih Kak <strong>{booking.nama_pelanggan}</strong>. Rincian kesepakatan acara pernikahan telah tersimpan resmi dan terkonfirmasi di sistem Era Waluyo.
            </p>
            {koreksi && (
              <div className="p-4 bg-[#FFFFFF] dark:bg-[#252525] rounded-xl border border-[#DDD2BA] dark:border-[#38342C] text-left text-xs text-[#5E5A52] dark:text-[#A8A49B]">
                <strong className="block text-[#111111] dark:text-[#F5EDDC] mb-1 font-semibold">
                  Catatan Koreksi Anda:
                </strong>
                {koreksi}
              </div>
            )}
            <div className="pt-2 text-[11px] text-[#8F8A7F] dark:text-[#777777]">
              Waktu Konfirmasi: {new Date().toLocaleDateString("id-ID")}
            </div>
          </div>
        ) : (
          /* Form & Rincian Pesanan */
          <div className="space-y-6">
            <div className="bg-[#FBF7EC] dark:bg-[#1E1E1E] border border-[#DDD2BA] dark:border-[#38342C] rounded-2xl p-6 space-y-4 shadow-sm">
              <div>
                <span className="text-xs font-semibold text-[#EEB100] uppercase tracking-wider">
                  Konfirmasi Kesepakatan Resmi
                </span>
                <h2 className="font-sans text-[20px] font-bold text-[#111111] dark:text-[#F5EDDC] mt-1">
                  Halo, {booking.nama_pelanggan}
                </h2>
                <p className="text-[14px] text-[#5E5A52] dark:text-[#A8A49B] mt-1">
                  Mohon periksa rincian pesanan Anda di bawah ini dengan teliti sebelum menyetujui.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#EADFC8] dark:border-[#38342C] text-sm">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-[#EEB100] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52] dark:text-[#A8A49B]">Tanggal Acara</div>
                    <div className="font-semibold text-[#111111] dark:text-[#F5EDDC]">
                      {booking.tanggal_acara}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-[#EEB100] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52] dark:text-[#A8A49B]">Lokasi Pelaksanaan</div>
                    <div className="font-semibold text-[#111111] dark:text-[#F5EDDC]">
                      {booking.lokasi}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-[#EEB100] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs text-[#5E5A52] dark:text-[#A8A49B]">Paket Pilihan</div>
                    <div className="font-semibold text-[#111111] dark:text-[#F5EDDC]">
                      {booking.packages?.nama || "Paket Khusus Era Waluyo"}
                    </div>
                  </div>
                </div>

                {/* Jam Rangkaian Acara */}
                {(booking.jam_akad || booking.jam_adat || booking.jam_resepsi) && (
                  <div className="p-3 bg-white dark:bg-[#252525] border border-[#DDD2BA] dark:border-[#38342C] rounded-xl grid grid-cols-3 gap-2 text-xs text-center">
                    <div>
                      <span className="text-[#5E5A52] dark:text-[#A8A49B] block text-[10px]">Akad</span>
                      <strong className="text-[#111111] dark:text-[#F5EDDC]">{booking.jam_akad || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-[#5E5A52] dark:text-[#A8A49B] block text-[10px]">Adat</span>
                      <strong className="text-[#111111] dark:text-[#F5EDDC]">{booking.jam_adat || "-"}</strong>
                    </div>
                    <div>
                      <span className="text-[#5E5A52] dark:text-[#A8A49B] block text-[10px]">Resepsi</span>
                      <strong className="text-[#111111] dark:text-[#F5EDDC]">{booking.jam_resepsi || "-"}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Rincian Busana & Dekorasi */}
              <div className="pt-4 border-t border-[#EADFC8] dark:border-[#38342C] space-y-2 text-xs">
                <div className="font-semibold text-[#111111] dark:text-[#F5EDDC]">Rincian Layanan Disepakati:</div>
                <ul className="space-y-1.5 text-[#5E5A52] dark:text-[#A8A49B] list-disc list-inside">
                  {booking.kebaya_baju && (
                    <li><strong>Busana / Kebaya:</strong> {booking.kebaya_baju}</li>
                  )}
                  {booking.ukuran && (
                    <li><strong>Ukuran Busana / Kain:</strong> {booking.ukuran}</li>
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

              <div className="pt-4 border-t border-[#EADFC8] dark:border-[#38342C] space-y-2 text-xs">
                {Number(booking.total_biaya || 0) > 0 && (
                  <div className="flex items-center justify-between text-[#5E5A52] dark:text-[#A8A49B]">
                    <span>Total Biaya Acara:</span>
                    <span className="font-bold text-[#111111] dark:text-[#F5EDDC] text-sm">
                      Rp{Number(booking.total_biaya).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#5E5A52] dark:text-[#A8A49B]">
                  <span>Uang Muka (DP) Diterima:</span>
                  <span className="font-semibold text-[#2F7A4B] dark:text-[#7FD39B] text-sm">
                    Rp{Number(booking.dp_nominal || 0).toLocaleString("id-ID")} (Lunas DP)
                  </span>
                </div>
                {Number(booking.total_biaya || 0) > 0 && (
                  <div className="flex items-center justify-between text-[#5E5A52] dark:text-[#A8A49B] pt-1 border-t border-dashed border-[#DDD2BA] dark:border-[#38342C]">
                    <span>Sisa Pelunasan:</span>
                    <span className="font-bold text-[#EEB100] text-sm">
                      Rp{Number(booking.sisa_pembayaran || Math.max(0, (booking.total_biaya || 0) - (booking.dp_nominal || 0))).toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Kolom Catatan / Koreksi Pelanggan */}
            <div className="bg-[#FBF7EC] dark:bg-[#1E1E1E] border border-[#DDD2BA] dark:border-[#38342C] rounded-2xl p-6 space-y-3 shadow-sm">
              <label
                htmlFor="koreksi"
                className="block text-sm font-semibold text-[#111111] dark:text-[#F5EDDC] flex items-center gap-2"
              >
                <MessageSquare size={16} className="text-[#EEB100]" />
                <span>Ada rincian yang perlu diperbaiki? (Opsional)</span>
              </label>
              <textarea
                id="koreksi"
                value={koreksi}
                onChange={(e) => setKoreksi(e.target.value)}
                placeholder="Tuliskan di sini jika ada perubahan jam, ukuran baju, atau catatan lainnya..."
                rows={3}
                className="w-full p-3 bg-white dark:bg-[#252525] border border-[#DDD2BA] dark:border-[#38342C] rounded-xl text-sm text-[#111111] dark:text-[#F5EDDC] placeholder-[#8F8A7F] dark:placeholder-[#777777] focus:outline-none focus:border-[#EEB100] transition-colors"
              />
            </div>

            {/* Tombol Konfirmasi Utama */}
            <div>
              <button
                onClick={handleKonfirmasi}
                disabled={isSubmitting}
                className="w-full h-12 bg-[#EEB100] hover:bg-[#DDA400] active:bg-[#C89400] text-[#111111] font-semibold rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50 text-base"
              >
                {isSubmitting ? "Menyimpan Konfirmasi..." : "Saya Setuju & Konfirmasi Pesanan"}
              </button>
              <p className="text-center text-[11px] text-[#8F8A7F] dark:text-[#777777] mt-3">
                Dengan menekan tombol di atas, Anda menyetujui rincian pesanan untuk diproses oleh Era Waluyo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
