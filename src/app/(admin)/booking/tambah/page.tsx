"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPackages, createBooking } from "@/lib/actions/booking";

interface PackageItem {
  id: string;
  nama: string;
  harga_dasar: number | null;
  deskripsi: string | null;
}

function TambahBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillTanggal = searchParams.get("tanggal") || "";

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    namaPelanggan: "",
    noWa: "",
    tanggalAcara: prefillTanggal,
    lokasi: "",
    packageId: "",
    kebayaBaju: "",
    ukuran: "M",
    dekorasi: "",
    mc: "",
    makeup: "",
    fotografer: "",
    video: "",
    hiburan: "",
    catatanKhusus: "",
    nominalDp: 3000000,
    dpDiterima: true,
  });

  useEffect(() => {
    async function fetchPackages() {
      const data = await getPackages();
      setPackages(data as PackageItem[]);
      if (data && data.length > 0) {
        setFormData((prev) => ({ ...prev, packageId: data[0].id }));
      }
    }
    fetchPackages();
  }, []);

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

    const res = await createBooking(formData);

    if (res.success && res.booking) {
      router.push(`/booking/${res.booking.id}`);
    } else {
      setIsLoading(false);
      setErrorMsg(res.error || "Terjadi kesalahan saat menyimpan booking.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#4D4D4D]">
        <div className="flex items-center gap-4">
          <Link href="/booking">
            <button className="p-2 rounded-xl bg-[#404040] hover:bg-[#4A4A4A] text-[#B8B3A8] hover:text-[#F5EDDC] transition-colors cursor-pointer">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-medium text-[#F5EDDC]">
              Catat Booking Baru
            </h1>
            <p className="text-sm text-[#B8B3A8] mt-0.5">
              Input pesanan pernikahan setelah pembayaran uang muka (DP) diterima
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[rgba(224,122,110,0.14)] border border-[#E07A6E] text-[#E07A6E] text-sm">
          {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-6">
          {/* Bagian 1: Data Utama Pelanggan & Acara */}
          <div>
            <h2 className="font-serif text-xl font-medium text-[#D4AD5C] mb-4 flex items-center gap-2">
              <Sparkles size={18} />
              <span>Data Pelanggan & Waktu Acara</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Nama Pasangan / Pelanggan <span className="text-[#E07A6E]">*</span>
                </label>
                <input
                  type="text"
                  name="namaPelanggan"
                  required
                  placeholder="Contoh: Aulia & Fajar"
                  value={formData.namaPelanggan}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Nomor WhatsApp <span className="text-[#E07A6E]">*</span>
                </label>
                <input
                  type="text"
                  name="noWa"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.noWa}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Tanggal Acara <span className="text-[#E07A6E]">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalAcara"
                  required
                  value={formData.tanggalAcara}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Lokasi Pelaksanaan Acara <span className="text-[#E07A6E]">*</span>
                </label>
                <input
                  type="text"
                  name="lokasi"
                  required
                  placeholder="Contoh: Gedung Soetedja / Rumah Mempelai Putri"
                  value={formData.lokasi}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Paket & Busana */}
          <div className="pt-6 border-t border-[#4D4D4D]">
            <h2 className="font-serif text-xl font-medium text-[#D4AD5C] mb-4">
              Pilihan Paket & Rincian Busana
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Paket Layanan
                </label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                >
                  {packages.map((pkg) => (
                     <option key={pkg.id} value={pkg.id}>
                      {pkg.nama} {pkg.harga_dasar ? `(Rp${pkg.harga_dasar.toLocaleString("id-ID")})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Ukuran Busana
                </label>
                <select
                  name="ukuran"
                  value={formData.ukuran}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                >
                  <option value="S">Ukuran S</option>
                  <option value="M">Ukuran M</option>
                  <option value="L">Ukuran L</option>
                  <option value="XL">Ukuran XL</option>
                  <option value="Custom">Custom / Menyesuaikan</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Model Kebaya / Beskap Adat
                </label>
                <input
                  type="text"
                  name="kebayaBaju"
                  placeholder="Contoh: Kebaya Solo Basahan Beludru Hitam & Beskap Sikepan Gold"
                  value={formData.kebayaBaju}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Layanan Tambahan */}
          <div className="pt-6 border-t border-[#4D4D4D]">
            <h2 className="font-serif text-xl font-medium text-[#D4AD5C] mb-4">
              Layanan Vendor & Pendukung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Dekorasi Pelaminan
                </label>
                <input
                  type="text"
                  name="dekorasi"
                  placeholder="Contoh: Gebyok Kayu Ukir 8M + Taman Melati"
                  value={formData.dekorasi}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Tata Rias (MUA)
                </label>
                <input
                  type="text"
                  name="makeup"
                  placeholder="Contoh: Tim MUA Era Waluyo Tradisional"
                  value={formData.makeup}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Master of Ceremony (MC)
                </label>
                <input
                  type="text"
                  name="mc"
                  placeholder="Contoh: Kak Deni Purwokerto"
                  value={formData.mc}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Fotografer & Video
                </label>
                <input
                  type="text"
                  name="fotografer"
                  placeholder="Contoh: Tim Dokumentasi Foto & Cinematic Video"
                  value={formData.fotografer}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Catatan Khusus / Permintaan Pasangan
                </label>
                <textarea
                  name="catatanKhusus"
                  rows={2}
                  placeholder="Contoh: Akad pukul 08.00 WIB, resepsi mulai 11.00 WIB."
                  value={formData.catatanKhusus}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#F5EDDC] focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Bagian 4: Pembayaran Uang Muka (DP) */}
          <div className="pt-6 border-t border-[#4D4D4D]">
            <h2 className="font-serif text-xl font-medium text-[#D4AD5C] mb-4">
              Konfirmasi Pembayaran DP
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div>
                <label className="block text-xs font-medium text-[#B8B3A8] mb-1.5">
                  Nominal DP yang Diterima (Rp) <span className="text-[#E07A6E]">*</span>
                </label>
                <input
                  type="number"
                  name="nominalDp"
                  required
                  min={0}
                  step={500000}
                  value={formData.nominalDp}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#404040] border border-[#4D4D4D] rounded-xl text-sm text-[#D4AD5C] font-semibold focus:outline-none focus:border-[#D4AD5C] transition-colors"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="dpDiterima"
                    checked={formData.dpDiterima}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#616161] bg-[#404040] text-[#D4AD5C] accent-[#D4AD5C]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#F5EDDC] flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#7FD39B]" />
                      DP Sudah Sah Diterima
                    </span>
                    <p className="text-xs text-[#B8B3A8]">
                      Sesuai SOP Era Waluyo, tanggal sah dibooking setelah DP masuk.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#4D4D4D] flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link href="/booking" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full sm:w-auto gap-2"
            >
              <Save size={18} />
              <span>{isLoading ? "Menyimpan Data..." : "Simpan Booking Baru"}</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default function TambahBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#B8B3A8]">Memuat formulir booking...</div>}>
      <TambahBookingForm />
    </Suspense>
  );
}
