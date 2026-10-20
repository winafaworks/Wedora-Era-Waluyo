"use client";
import React, { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { deleteBooking } from "@/lib/actions/booking";

interface BookingDetailProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any;
  appUrl: string;
}

const emptySubscribe = () => () => {};

export default function BookingDetailClient({ booking, appUrl }: BookingDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const currentOrigin = useSyncExternalStore(
    emptySubscribe,
    () => window.location.origin,
    () => appUrl
  );

  const confirmationLink = `${currentOrigin}/konfirmasi/${booking.token_konfirmasi}`;

  // WhatsApp click-to-chat URL sesuai prd.md bagian 6.8
  const cleanPhone = booking.no_wa.replace(/\D/g, "").replace(/^0/, "62");
  const waMessage = encodeURIComponent(
    `Halo Kak ${booking.nama_pelanggan}, terima kasih sudah memesan di Era Waluyo. Mohon cek rincian pesanan Kakak lewat tautan berikut, lalu konfirmasi jika sudah sesuai:\n\n${confirmationLink}`
  );
  const waUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`;

  const handleDelete = async () => {
    if (
      confirm(
        `Hapus booking ${booking.nama_pelanggan} (${booking.tanggal_acara})?\nTindakan ini tidak dapat dibatalkan.`
      )
    ) {
      setIsDeleting(true);
      const res = await deleteBooking(booking.id);
      if (res.success) {
        router.push("/booking");
      } else {
        alert("Gagal menghapus booking: " + res.error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-4">
          <Link href="/booking">
            <button className="p-2 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:bg-[#FAF6ED] text-[#5E5A52] hover:text-[#1A1A1A] transition-colors cursor-pointer shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A]">
                {booking.nama_pelanggan}
              </h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-[#5E5A52] mt-1">
              ID Pesanan: {booking.id.slice(0, 8)} • Dibuat pada:{" "}
              {new Date(booking.dibuat_pada).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href="/checklist">
            <Button variant="outline" size="sm" className="gap-1.5 bg-[#FFFFFF]">
              <CheckSquare size={16} className="text-[#8A6A22]" />
              <span>Checklist</span>
            </Button>
          </Link>
          <Link href={`/booking/${booking.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Edit3 size={16} />
              <span>Ubah</span>
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="gap-1.5"
          >
            <Trash2 size={16} />
            <span>{isDeleting ? "Menghapus..." : "Hapus"}</span>
          </Button>
        </div>
      </div>

      {/* WhatsApp Confirmation Banner */}
      <Card className="p-6 bg-gradient-to-r from-[#FFFFFF] to-[#FAF6ED] border-[#D6CEBE] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6A22] flex items-center gap-1.5">
            <MessageCircle size={14} />
            Konfirmasi Pesanan Pelanggan
          </span>
          <p className="text-sm text-[#1A1A1A] font-medium">
            Kirimkan tautan konfirmasi resmi ini kepada calon pengantin via WhatsApp
          </p>
          <p className="text-xs text-[#5E5A52] break-all">
            {confirmationLink}
          </p>
        </div>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-full md:w-auto"
        >
          <Button variant="primary" className="w-full md:w-auto gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-black">
            <MessageCircle size={18} />
            <span>Kirim via WhatsApp</span>
          </Button>
        </a>
      </Card>

      {/* Catatan Koreksi Pelanggan (jika ada) */}
      {booking.customer_notes && booking.customer_notes.length > 0 && (
        <Card className="p-6 bg-[rgba(232,162,95,0.12)] border-[#E8A25F]/50 space-y-3">
          <div className="flex items-center gap-2 text-[#A5601C] font-semibold text-sm">
            <AlertTriangle size={18} />
            <span>Catatan Koreksi dari Pelanggan:</span>
          </div>
          <div className="space-y-2">
            {booking.customer_notes.map((note: { id: string; isi: string; dibuat_pada: string }) => (
              <div
                key={note.id}
                className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5DEC9] text-xs text-[#1A1A1A] shadow-sm"
              >
                <p>{note.isi}</p>
                <span className="block text-[10px] text-[#5E5A52] mt-1">
                  Waktu: {new Date(note.dibuat_pada).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Rincian Pesanan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Acara & Waktu */}
        <Card className="p-6 space-y-4">
          <h2 className="font-sans text-[20px] font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2">
            Jadwal & Lokasi Acara
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-[#8A6A22] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#5E5A52]">Hari / Tanggal Acara</span>
                <p className="font-semibold text-[#1A1A1A]">
                  {booking.tanggal_acara}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-[#8A6A22] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#5E5A52]">Lokasi Pelaksanaan</span>
                <p className="font-semibold text-[#1A1A1A]">
                  {booking.lokasi}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={18} className="text-[#8A6A22] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#5E5A52]">Kontak WhatsApp</span>
                <p className="font-semibold text-[#1A1A1A]">{booking.no_wa}</p>
              </div>
            </div>

            {/* Jam Rangkaian Acara */}
            <div className="pt-2 border-t border-[#EFE9DC] grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-[#FBF7EC] rounded-lg">
                <span className="text-[#5E5A52] block">Akad</span>
                <strong className="text-[#1A1A1A]">{booking.jam_akad || "-"}</strong>
              </div>
              <div className="p-2 bg-[#FBF7EC] rounded-lg">
                <span className="text-[#5E5A52] block">Adat</span>
                <strong className="text-[#1A1A1A]">{booking.jam_adat || "-"}</strong>
              </div>
              <div className="p-2 bg-[#FBF7EC] rounded-lg">
                <span className="text-[#5E5A52] block">Resepsi</span>
                <strong className="text-[#1A1A1A]">{booking.jam_resepsi || "-"}</strong>
              </div>
            </div>

            {booking.lokasi_makeup && (
              <div className="text-xs text-[#5E5A52]">
                <span>Lokasi Rias: </span>
                <strong className="text-[#1A1A1A]">{booking.lokasi_makeup}</strong>
              </div>
            )}
          </div>
        </Card>

        {/* Informasi Pembayaran & Pelunasan */}
        <Card className="p-6 space-y-4">
          <h2 className="font-sans text-[20px] font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2">
            Rincian Biaya & Pelunasan
          </h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-[#5E5A52]">Total Biaya Acara</span>
                <p className="text-lg font-sans font-bold text-[#1A1A1A] mt-0.5">
                  Rp{Number(booking.total_biaya || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <span className="text-xs text-[#5E5A52]">Uang Muka (DP)</span>
                <p className="text-lg font-sans font-bold text-[#2F7A4B] mt-0.5">
                  Rp{Number(booking.dp_nominal || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl flex items-center justify-between">
              <span className="text-xs text-[#5E5A52] font-medium">Sisa Pelunasan:</span>
              <span className="text-base font-bold text-[#8A6A22]">
                Rp{Number(booking.sisa_pembayaran || Math.max(0, (booking.total_biaya || 0) - (booking.dp_nominal || 0))).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <CheckCircle2 size={16} className="text-[#2F7A4B]" />
              <span className="text-[#2F7A4B] font-semibold">
                Uang Muka (DP) Sah Diterima
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#5E5A52]">
              <Clock size={16} />
              <span>
                Status Konfirmasi:{" "}
                <strong className="text-[#1A1A1A] uppercase">
                  {booking.status?.replace("_", " ")}
                </strong>
              </span>
            </div>
          </div>
        </Card>

        {/* Tabel Rincian MUA jika ada */}
        {Array.isArray(booking.items_mua) && booking.items_mua.some((m: { jumlah?: string; keterangan?: string }) => m.jumlah || m.keterangan) && (
          <Card className="p-6 space-y-3 md:col-span-2">
            <h3 className="font-sans text-base font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2 flex items-center gap-2">
              <Sparkles size={16} />
              <span>Tabel 1: Item MUA (Tata Rias & Busana)</span>
            </h3>
            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-48">Item MUA</th>
                    <th className="py-2 px-3 w-20 text-center">Jml</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {booking.items_mua
                    .filter((m: { jumlah?: string; keterangan?: string }) => m.jumlah || m.keterangan)
                    .map((m: { item: string; jumlah: string; keterangan: string }, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                        <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-[#1A1A1A]">{m.item}</td>
                        <td className="py-2 px-3 text-center">{m.jumlah || "-"}</td>
                        <td className="py-2 px-3 text-[#5E5A52]">{m.keterangan || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tabel Rincian Dekorasi jika ada */}
        {Array.isArray(booking.items_dekorasi) && booking.items_dekorasi.some((d: { jumlah?: string; meter?: string; keterangan?: string }) => d.jumlah || d.meter || d.keterangan) && (
          <Card className="p-6 space-y-3 md:col-span-2">
            <h3 className="font-sans text-base font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2 flex items-center gap-2">
              <Sparkles size={16} />
              <span>Tabel 2: Item Dekorasi Pelaminan & Lokasi</span>
            </h3>
            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-48">Item Dekorasi</th>
                    <th className="py-2 px-3 w-24">Ukuran/Jml</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {booking.items_dekorasi
                    .filter((d: { jumlah?: string; meter?: string; keterangan?: string }) => d.jumlah || d.meter || d.keterangan)
                    .map((d: { item: string; jumlah?: string; meter?: string; keterangan: string }, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                        <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-[#1A1A1A]">{d.item}</td>
                        <td className="py-2 px-3 text-[#1A1A1A]">{d.meter ? `${d.meter} meter` : (d.jumlah || "Ya")}</td>
                        <td className="py-2 px-3 text-[#5E5A52]">{d.keterangan || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tabel Rincian Adat jika ada */}
        {Array.isArray(booking.items_adat) && booking.items_adat.some((a: { jumlah?: string; keterangan?: string }) => a.jumlah || a.keterangan) && (
          <Card className="p-6 space-y-3 md:col-span-2">
            <h3 className="font-sans text-base font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2 flex items-center gap-2">
              <Sparkles size={16} />
              <span>Tabel 3: Item Upacara Adat</span>
            </h3>
            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2 px-3 w-10 text-center">No</th>
                    <th className="py-2 px-3 w-48">Item Adat</th>
                    <th className="py-2 px-3 w-20 text-center">Jml</th>
                    <th className="py-2 px-3">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {booking.items_adat
                    .filter((a: { jumlah?: string; keterangan?: string }) => a.jumlah || a.keterangan)
                    .map((a: { item: string; jumlah: string; keterangan: string }, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                        <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-[#1A1A1A]">{a.item}</td>
                        <td className="py-2 px-3 text-center">{a.jumlah || "Ya"}</td>
                        <td className="py-2 px-3 text-[#5E5A52]">{a.keterangan || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Rincian Busana & Vendor Pendukung */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <h2 className="font-sans text-[20px] font-bold text-[#8A6A22] border-b border-[#E5DEC9] pb-2 flex items-center gap-2">
            <Sparkles size={18} />
            <span>Paket Layanan & Vendor Pendukung</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Paket Pilihan</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.packages?.nama || "Paket Khusus"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Model Busana / Kebaya</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.kebaya_baju || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Ukuran Baju / Kain</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.ukuran || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Dekorasi</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.dekorasi || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Tata Rias (MUA)</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.makeup || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Master of Ceremony (MC)</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.mc || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Dokumentasi Foto</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.fotografer || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Dokumentasi Video</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.video || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9]">
              <span className="text-[#5E5A52] block">Hiburan / Musik</span>
              <strong className="text-sm text-[#1A1A1A] block mt-0.5">
                {booking.hiburan || "-"}
              </strong>
            </div>
          </div>

          {booking.catatan_khusus && (
            <div className="pt-2 text-xs">
              <span className="text-[#5E5A52] block mb-1">Catatan Tambahan:</span>
              <p className="p-3 bg-[#FBF7EC] rounded-xl border border-[#E5DEC9] text-[#1A1A1A]">
                {booking.catatan_khusus}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
