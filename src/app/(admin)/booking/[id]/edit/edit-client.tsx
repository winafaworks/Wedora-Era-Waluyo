"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { updateBooking } from "@/lib/actions/booking";

interface EditClientProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  booking: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  packages: any[];
}

export default function EditBookingClient({ booking, packages }: EditClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    namaPelanggan: booking.nama_pelanggan || "",
    noWa: booking.no_wa || "",
    tanggalAcara: booking.tanggal_acara || "",
    lokasi: booking.lokasi || "",
    packageId: booking.package_id || (packages[0]?.id || ""),
    kebayaBaju: booking.kebaya_baju || "",
    ukuran: booking.ukuran || "M",
    dekorasi: booking.dekorasi || "",
    mc: booking.mc || "",
    makeup: booking.makeup || "",
    fotografer: booking.fotografer || "",
    video: booking.video || "",
    hiburan: booking.hiburan || "",
    catatanKhusus: booking.catatan_khusus || "",
    nominalDp: Number(booking.dp_nominal || 0),
    dpDiterima: booking.dp_diterima ?? true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const res = await updateBooking(booking.id, formData);

    if (res.success) {
      router.push(`/booking/${booking.id}`);
    } else {
      setIsLoading(false);
      setErrorMsg(res.error || "Gagal memperbarui data pesanan.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#3D3D3D]">
        <div className="flex items-center gap-4">
          <Link href={`/booking/${booking.id}`}>
            <button className="p-2 rounded-xl bg-[#303030] hover:bg-[#3A3A3A] text-[#A8A49B] hover:text-[#F5EDDC] transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-medium text-[#F5EDDC]">
              Ubah Data Booking
            </h1>
            <p className="text-sm text-[#A8A49B] mt-0.5">
              Perbarui rincian pesanan untuk {booking.nama_pelanggan}
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[rgba(224,122,110,0.14)] border border-[#E07A6E] text-[#E07A6E] text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Nama Pasangan / Pelanggan <span className="text-[#E07A6E]">*</span>
              </label>
              <input
                type="text"
                name="namaPelanggan"
                required
                value={formData.namaPelanggan}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Nomor WhatsApp <span className="text-[#E07A6E]">*</span>
              </label>
              <input
                type="text"
                name="noWa"
                required
                value={formData.noWa}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Tanggal Acara <span className="text-[#E07A6E]">*</span>
              </label>
              <input
                type="date"
                name="tanggalAcara"
                required
                value={formData.tanggalAcara}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Lokasi Pelaksanaan Acara <span className="text-[#E07A6E]">*</span>
              </label>
              <input
                type="text"
                name="lokasi"
                required
                value={formData.lokasi}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Paket Layanan
              </label>
              <select
                name="packageId"
                value={formData.packageId}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              >
                {packages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.nama} {pkg.harga_dasar ? `(Rp${pkg.harga_dasar.toLocaleString("id-ID")})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Ukuran Busana
              </label>
              <select
                name="ukuran"
                value={formData.ukuran}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              >
                <option value="S">Ukuran S</option>
                <option value="M">Ukuran M</option>
                <option value="L">Ukuran L</option>
                <option value="XL">Ukuran XL</option>
                <option value="Custom">Custom / Menyesuaikan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Model Kebaya / Beskap
              </label>
              <input
                type="text"
                name="kebayaBaju"
                value={formData.kebayaBaju}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Dekorasi Pelaminan
              </label>
              <input
                type="text"
                name="dekorasi"
                value={formData.dekorasi}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Tata Rias (MUA)
              </label>
              <input
                type="text"
                name="makeup"
                value={formData.makeup}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Nominal DP (Rp)
              </label>
              <input
                type="number"
                name="nominalDp"
                required
                min={0}
                value={formData.nominalDp}
                onChange={handleChange}
                className="w-full h-11 px-4 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#D4AD5C] font-semibold focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#A8A49B] mb-1.5">
                Catatan Khusus
              </label>
              <textarea
                name="catatanKhusus"
                rows={2}
                value={formData.catatanKhusus}
                onChange={handleChange}
                className="w-full p-3 bg-[#303030] border border-[#3D3D3D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-[#3D3D3D] flex items-center justify-end gap-3">
            <Link href={`/booking/${booking.id}`}>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isLoading} className="gap-2">
              <Save size={18} />
              <span>{isLoading ? "Menyimpan Perubahan..." : "Simpan Perubahan"}</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
