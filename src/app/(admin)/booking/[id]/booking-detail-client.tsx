"use client";

import React, { useState } from "react";
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

export default function BookingDetailClient({ booking, appUrl }: BookingDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmationLink = `${appUrl}/konfirmasi/${booking.token_konfirmasi}`;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4D4D4D]">
        <div className="flex items-center gap-4">
          <Link href="/booking">
            <button className="p-2 rounded-xl bg-[#404040] hover:bg-[#4A4A4A] text-[#B8B3A8] hover:text-[#F5EDDC] transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl font-medium text-[#F5EDDC]">
                {booking.nama_pelanggan}
              </h1>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-xs text-[#B8B3A8] mt-1">
              ID Pesanan: {booking.id.slice(0, 8)} • Dibuat pada:{" "}
              {new Date(booking.dibuat_pada).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
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
      <Card className="p-6 bg-gradient-to-r from-[#363636] to-[#404040] border-[#D4AD5C]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AD5C] flex items-center gap-1.5">
            <MessageCircle size={14} />
            Konfirmasi Pesanan Pelanggan
          </span>
          <p className="text-sm text-[#F5EDDC] font-medium">
            Kirimkan tautan konfirmasi resmi ini kepada calon pengantin via WhatsApp
          </p>
          <p className="text-xs text-[#B8B3A8] break-all">
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
        <Card className="p-6 bg-[rgba(232,162,95,0.08)] border-[#E8A25F]/40 space-y-3">
          <div className="flex items-center gap-2 text-[#E8A25F] font-semibold text-sm">
            <AlertTriangle size={18} />
            <span>Catatan Koreksi dari Pelanggan:</span>
          </div>
          <div className="space-y-2">
            {booking.customer_notes.map((note: { id: string; isi: string; dibuat_pada: string }) => (
              <div
                key={note.id}
                className="p-3 bg-[#363636] rounded-xl border border-[#4D4D4D] text-xs text-[#F5EDDC]"
              >
                <p>{note.isi}</p>
                <span className="block text-[10px] text-[#B8B3A8] mt-1">
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
          <h2 className="font-serif text-lg font-medium text-[#D4AD5C] border-b border-[#4D4D4D] pb-2">
            Jadwal & Lokasi Acara
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Calendar size={18} className="text-[#D4AD5C] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#B8B3A8]">Tanggal Pelaksanaan</span>
                <p className="font-semibold text-[#F5EDDC]">
                  {booking.tanggal_acara}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-[#D4AD5C] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#B8B3A8]">Lokasi Acara</span>
                <p className="font-semibold text-[#F5EDDC]">
                  {booking.lokasi}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone size={18} className="text-[#D4AD5C] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-[#B8B3A8]">Kontak WhatsApp</span>
                <p className="font-semibold text-[#F5EDDC]">{booking.no_wa}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informasi Pembayaran DP */}
        <Card className="p-6 space-y-4">
          <h2 className="font-serif text-lg font-medium text-[#D4AD5C] border-b border-[#4D4D4D] pb-2">
            Status Pembayaran DP
          </h2>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-[#B8B3A8]">Nominal DP Diterima</span>
              <p className="text-2xl font-serif text-[#D4AD5C] font-semibold mt-0.5">
                Rp{Number(booking.dp_nominal || 0).toLocaleString("id-ID")}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <CheckCircle2 size={16} className="text-[#7FD39B]" />
              <span className="text-[#7FD39B] font-semibold">
                Uang Muka (DP) Sah Diterima
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#B8B3A8]">
              <Clock size={16} />
              <span>
                Status Konfirmasi:{" "}
                <strong className="text-[#F5EDDC] uppercase">
                  {booking.status.replace("_", " ")}
                </strong>
              </span>
            </div>
          </div>
        </Card>

        {/* Rincian Busana & Paket */}
        <Card className="p-6 space-y-4 md:col-span-2">
          <h2 className="font-serif text-lg font-medium text-[#D4AD5C] border-b border-[#4D4D4D] pb-2 flex items-center gap-2">
            <Sparkles size={18} />
            <span>Paket Layanan & Busana Pernikahan</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Paket Pilihan</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.packages?.nama || "Paket Khusus"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Model Busana / Kebaya</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.kebaya_baju || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Ukuran Baju</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.ukuran || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Dekorasi Pelaminan</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.dekorasi || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Tata Rias (MUA)</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.makeup || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Master of Ceremony (MC)</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.mc || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Dokumentasi Foto</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.fotografer || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Dokumentasi Video</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.video || "-"}
              </strong>
            </div>

            <div className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D]">
              <span className="text-[#B8B3A8] block">Hiburan / Musik</span>
              <strong className="text-sm text-[#F5EDDC] block mt-0.5">
                {booking.hiburan || "-"}
              </strong>
            </div>
          </div>

          {booking.catatan_khusus && (
            <div className="pt-2 text-xs">
              <span className="text-[#B8B3A8] block mb-1">Catatan Khusus:</span>
              <p className="p-3 bg-[#404040] rounded-xl border border-[#4D4D4D] text-[#F5EDDC]">
                {booking.catatan_khusus}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
