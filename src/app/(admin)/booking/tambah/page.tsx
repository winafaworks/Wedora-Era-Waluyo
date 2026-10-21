"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Sparkles,
  CheckCircle2,
  Clock,
  Shirt,
  Flower2,
  Flame,
  Camera,
  Wallet,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPackages, createBooking } from "@/lib/actions/booking";

interface PackageItem {
  id: string;
  nama: string;
  harga_dasar: number | null;
  deskripsi: string | null;
}

interface TableItem {
  item: string;
  jumlah: string;
  keterangan: string;
  meter?: string;
}

const DEFAULT_MUA_ITEMS: TableItem[] = [
  { item: "Sepasang Pengantin", jumlah: "2", keterangan: "" },
  { item: "Orang Tua / Besan", jumlah: "4", keterangan: "" },
  { item: "Domas / Manggolo", jumlah: "", keterangan: "" },
  { item: "Terima Tamu", jumlah: "", keterangan: "" },
  { item: "Among Tamu", jumlah: "", keterangan: "" },
  { item: "Patah", jumlah: "", keterangan: "" },
  { item: "Keluarga / Lain-Lain", jumlah: "", keterangan: "" },
];

const DEFAULT_DEKORASI_ITEMS: TableItem[] = [
  { item: "Dekorasi Pelaminan", jumlah: "1", meter: "8", keterangan: "" },
  { item: "Mini Garden", jumlah: "", keterangan: "" },
  { item: "Dekorasi Photobooth", jumlah: "", keterangan: "" },
  { item: "Lighting Dekorasi", jumlah: "", keterangan: "" },
  { item: "Wedding Gate", jumlah: "", keterangan: "" },
  { item: "Welcome Sign", jumlah: "", keterangan: "" },
  { item: "Dekorasi Jalan", jumlah: "", keterangan: "" },
  { item: "Meja dan Kursi Akad", jumlah: "", keterangan: "" },
  { item: "Dekorasi Kamar Penganten", jumlah: "", keterangan: "" },
  { item: "Janur dan Kembar Mayang", jumlah: "", keterangan: "" },
];

const DEFAULT_ADAT_ITEMS: TableItem[] = [
  { item: "Siraman", jumlah: "", keterangan: "" },
  { item: "Midodareni", jumlah: "", keterangan: "" },
  { item: "MC", jumlah: "1", keterangan: "" },
  { item: "Cucuk Lampah", jumlah: "", keterangan: "" },
  { item: "Begalan", jumlah: "", keterangan: "" },
];

function TambahBookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillTanggal = searchParams.get("tanggal") || "";

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State Utama Sesuai Lembar Fisik Era Waluyo
  const [formData, setFormData] = useState({
    namaPelanggan: "",
    noWa: "",
    tanggalAcara: prefillTanggal,
    lokasi: "",
    jamAkad: "09:00",
    jamAdat: "",
    jamResepsi: "11:00",
    lokasiMakeup: "",
    packageId: "",
    kebayaBaju: "",
    ukuran: "",
    dekorasi: "",
    mc: "",
    makeup: "",
    fotografer: "",
    video: "",
    hiburan: "",
    catatanKhusus: "",
    totalBiaya: 12500000,
    nominalDp: 3000000,
    dpDiterima: true,
  });

  const [itemsMua, setItemsMua] = useState<TableItem[]>(DEFAULT_MUA_ITEMS);
  const [itemsDekorasi, setItemsDekorasi] = useState<TableItem[]>(DEFAULT_DEKORASI_ITEMS);
  const [itemsAdat, setItemsAdat] = useState<TableItem[]>(DEFAULT_ADAT_ITEMS);

  useEffect(() => {
    async function fetchPackages() {
      const data = await getPackages();
      setPackages(data as PackageItem[]);
      if (data && data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          packageId: data[0].id,
          totalBiaya: data[0].harga_dasar ? Number(data[0].harga_dasar) : prev.totalBiaya,
        }));
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
    } else if (name === "packageId") {
      const selectedPkg = packages.find((p) => p.id === value);
      setFormData((prev) => ({
        ...prev,
        packageId: value,
        totalBiaya: selectedPkg?.harga_dasar ? Number(selectedPkg.harga_dasar) : prev.totalBiaya,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler Tabel Dinamis
  const handleItemChange = (
    setter: React.Dispatch<React.SetStateAction<TableItem[]>>,
    index: number,
    field: keyof TableItem,
    val: string
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleAddItem = (
    setter: React.Dispatch<React.SetStateAction<TableItem[]>>,
    defaultName = "Item Tambahan"
  ) => {
    setter((prev) => [...prev, { item: defaultName, jumlah: "", keterangan: "" }]);
  };

  const handleRemoveItem = (
    setter: React.Dispatch<React.SetStateAction<TableItem[]>>,
    index: number
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  // Hitung sisa tagihan
  const sisaPembayaran = Math.max(0, Number(formData.totalBiaya || 0) - Number(formData.nominalDp || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Rangkum ringkasan teks untuk kompatibilitas
    const summaryMua = itemsMua
      .filter((m) => m.jumlah || m.keterangan)
      .map((m) => `${m.item} (${m.jumlah || "-"}): ${m.keterangan || "-"}`)
      .join("; ");

    const summaryDekorasi = itemsDekorasi
      .filter((d) => d.jumlah || d.keterangan || d.meter)
      .map((d) => `${d.item}${d.meter ? ` ${d.meter}m` : ""}: ${d.keterangan || "-"}`)
      .join("; ");

    const summaryAdat = itemsAdat
      .filter((a) => a.jumlah || a.keterangan)
      .map((a) => `${a.item}: ${a.keterangan || "-"}`)
      .join("; ");

    const payload = {
      ...formData,
      makeup: summaryMua || formData.makeup,
      dekorasi: summaryDekorasi || formData.dekorasi,
      mc: summaryAdat || formData.mc,
      itemsMua,
      itemsDekorasi,
      itemsAdat,
      sisaPembayaran,
    };

    const res = await createBooking(payload);

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
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DEC9]">
        <div className="flex items-center gap-4">
          <Link href="/booking">
            <button className="p-2 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:bg-[#FAF6ED] text-[#5E5A52] hover:text-[#1A1A1A] transition-colors cursor-pointer shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className="font-sans text-[28px] font-bold text-[#1A1A1A]">
              Jadwal Rias Pengantin & Dekorasi
            </h1>
            <p className="text-[14px] text-[#5E5A52] mt-0.5">
              Formulir pencatatan pesanan terstruktur sesuai lembar kerja Era Waluyo
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-[rgba(224,122,110,0.12)] border border-[#B13C30] text-[#B13C30] text-sm">
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 md:p-8 space-y-8">
          {/* =========================================================================
              BAGIAN 1: DATA CALON PENGANTIN & WAKTU ACARA
          ========================================================================= */}
          <div>
            <h2 className="font-sans text-[20px] font-bold text-[#EEB100] mb-4 flex items-center gap-2">
              <Sparkles size={18} />
              <span>Data Calon Pengantin & Waktu Acara</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Nama Capeng (Calon Pengantin) <span className="text-[#B13C30]">*</span>
                </label>
                <input
                  type="text"
                  name="namaPelanggan"
                  required
                  placeholder="Contoh: Aulia & Fajar"
                  value={formData.namaPelanggan}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Nomor HP / WhatsApp <span className="text-[#B13C30]">*</span>
                </label>
                <input
                  type="text"
                  name="noWa"
                  required
                  placeholder="Contoh: 081234567890"
                  value={formData.noWa}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Hari / Tanggal Acara <span className="text-[#B13C30]">*</span>
                </label>
                <input
                  type="date"
                  name="tanggalAcara"
                  required
                  value={formData.tanggalAcara}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Alamat / Lokasi Pelaksanaan <span className="text-[#B13C30]">*</span>
                </label>
                <input
                  type="text"
                  name="lokasi"
                  required
                  placeholder="Contoh: Gedung Soetedja / Rumah Mempelai Putri"
                  value={formData.lokasi}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              {/* Rangkaian Jam Acara */}
              <div className="md:col-span-2 p-4 bg-[#FAF7F0] border border-[#E5DEC9] rounded-xl space-y-3">
                <span className="text-xs font-semibold text-[#EEB100] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock size={14} />
                  <span>Jadwal Jam Rangkaian Acara & Lokasi Makeup</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-[#5E5A52] mb-1">
                      Jam Akad
                    </label>
                    <input
                      type="text"
                      name="jamAkad"
                      placeholder="Contoh: 09.00 WIB"
                      value={formData.jamAkad}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#5E5A52] mb-1">
                      Jam Adat
                    </label>
                    <input
                      type="text"
                      name="jamAdat"
                      placeholder="Contoh: 10.00 WIB"
                      value={formData.jamAdat}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#5E5A52] mb-1">
                      Jam Resepsi
                    </label>
                    <input
                      type="text"
                      name="jamResepsi"
                      placeholder="Contoh: 11.00 WIB"
                      value={formData.jamResepsi}
                      onChange={handleChange}
                      className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-[#5E5A52] mb-1">
                    Catatan Lokasi Makeup
                  </label>
                  <input
                    type="text"
                    name="lokasiMakeup"
                    placeholder="Contoh: Makeup di Gedung / Makeup di Kamar Pengantin"
                    value={formData.lokasiMakeup}
                    onChange={handleChange}
                    className="w-full h-10 px-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-lg text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 2: PILIHAN PAKET & RINCIAN BUSANA
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <h2 className="font-sans text-[20px] font-bold text-[#EEB100] mb-4 flex items-center gap-2">
              <Shirt size={18} />
              <span>Paket Acara & Rincian Busana Utama</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Paket Layanan Era Waluyo
                </label>
                <select
                  name="packageId"
                  value={formData.packageId}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm cursor-pointer"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.nama} {pkg.harga_dasar ? `(Rp${pkg.harga_dasar.toLocaleString("id-ID")})` : ""}
                    </option>
                  ))}
                  <option value="">Custom / Tanpa Paket Terdaftar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Model & Warna Busana Pengantin
                </label>
                <input
                  type="text"
                  name="kebayaBaju"
                  placeholder="Contoh: Kebaya Solo Basahan Beludru Hitam & Beskap Sikepan Gold"
                  value={formData.kebayaBaju}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Ukuran Busana & Kelengkapan Kain/Sandal
                </label>
                <input
                  type="text"
                  name="ukuran"
                  placeholder="Contoh: Pengantin Cewe M / Cowo L2; Sandal padi no 39; Blangkon no 7 tirto"
                  value={formData.ukuran}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 3: TABEL ITEM MUA (TATA RIAS & BUSANA)
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-sans text-[20px] font-bold text-[#EEB100] flex items-center gap-2">
                  <Sparkles size={18} />
                  <span>Item MUA (Tata Rias & Busana)</span>
                </h2>
                <p className="text-xs text-[#5E5A52]">
                  Sesuai Tabel 1 lembar fisik: Pengantin, Orang Tua, Domas, Among Tamu, dll.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem(setItemsMua, "Baris Tambahan MUA")}
                className="text-xs text-[#EEB100] hover:text-[#DDA400] inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-44">Item MUA</th>
                    <th className="py-2.5 px-3 w-20 text-center">Jml</th>
                    <th className="py-2.5 px-3">Keterangan (Rias / Hairdo / Busana)</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {itemsMua.map((m, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                      <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-[#1A1A1A]">
                        <input
                          type="text"
                          value={m.item}
                          onChange={(e) => handleItemChange(setItemsMua, idx, "item", e.target.value)}
                          className="w-full bg-transparent border-0 font-medium focus:outline-none focus:ring-1 focus:ring-[#EEB100] rounded px-1"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="0"
                          value={m.jumlah}
                          onChange={(e) => handleItemChange(setItemsMua, idx, "jumlah", e.target.value)}
                          className="w-full text-center bg-[#FFFFFF] border border-[#D6CEBE] rounded px-1.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Contoh: Akad Hair do kepyur diangkat; Resepsi Solo putri mawar fresh..."
                          value={m.keterangan}
                          onChange={(e) => handleItemChange(setItemsMua, idx, "keterangan", e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D6CEBE] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        {idx >= 7 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(setItemsMua, idx)}
                            className="text-[#B13C30] hover:text-[#8E281E] p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 4: TABEL ITEM DEKORASI
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-sans text-[20px] font-bold text-[#EEB100] flex items-center gap-2">
                  <Flower2 size={18} />
                  <span>Item Dekorasi Pelaminan & Lokasi</span>
                </h2>
                <p className="text-xs text-[#5E5A52]">
                  Sesuai Tabel 2 lembar fisik: Pelaminan, Mini Garden, Photobooth, Gate, Janur, dll.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem(setItemsDekorasi, "Item Dekorasi Baru")}
                className="text-xs text-[#EEB100] hover:text-[#DDA400] inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-48">Item Dekorasi</th>
                    <th className="py-2.5 px-3 w-28">Ukuran / Jml</th>
                    <th className="py-2.5 px-3">Keterangan Khusus</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {itemsDekorasi.map((d, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                      <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-[#1A1A1A]">
                        <input
                          type="text"
                          value={d.item}
                          onChange={(e) => handleItemChange(setItemsDekorasi, idx, "item", e.target.value)}
                          className="w-full bg-transparent border-0 font-medium focus:outline-none focus:ring-1 focus:ring-[#EEB100] rounded px-1"
                        />
                      </td>
                      <td className="py-2 px-3">
                        {idx === 0 ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={d.meter || ""}
                              onChange={(e) => handleItemChange(setItemsDekorasi, idx, "meter", e.target.value)}
                              placeholder="8"
                              className="w-12 text-center bg-[#FFFFFF] border border-[#D6CEBE] rounded px-1.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                            />
                            <span className="text-[#5E5A52] text-[11px]">meter</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Ya / 1 set"
                            value={d.jumlah}
                            onChange={(e) => handleItemChange(setItemsDekorasi, idx, "jumlah", e.target.value)}
                            className="w-full bg-[#FFFFFF] border border-[#D6CEBE] rounded px-1.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                          />
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Keterangan warna, tema, atau perlengkapan..."
                          value={d.keterangan}
                          onChange={(e) => handleItemChange(setItemsDekorasi, idx, "keterangan", e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D6CEBE] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        {idx >= 10 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(setItemsDekorasi, idx)}
                            className="text-[#B13C30] hover:text-[#8E281E] p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 5: TABEL ITEM ADAT
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-sans text-[20px] font-bold text-[#EEB100] flex items-center gap-2">
                  <Flame size={18} />
                  <span>Item Upacara Adat</span>
                </h2>
                <p className="text-xs text-[#5E5A52]">
                  Sesuai Tabel 3 lembar fisik: Siraman, Midodareni, Cucuk Lampah, Begalan, MC.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddItem(setItemsAdat, "Item Adat Tambahan")}
                className="text-xs text-[#EEB100] hover:text-[#DDA400] inline-flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus size={14} />
                <span>Tambah Baris</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-[#E5DEC9] rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-[#E5DEC9] text-[#5E5A52]">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-48">Item Upacara Adat</th>
                    <th className="py-2.5 px-3 w-20 text-center">Jml</th>
                    <th className="py-2.5 px-3">Keterangan / Rincian Busana & Petugas</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DC]">
                  {itemsAdat.map((a, idx) => (
                    <tr key={idx} className="hover:bg-[#FAF7F0]/60">
                      <td className="py-2 px-3 text-center text-[#8A857B]">{idx + 1}</td>
                      <td className="py-2 px-3 font-medium text-[#1A1A1A]">
                        <input
                          type="text"
                          value={a.item}
                          onChange={(e) => handleItemChange(setItemsAdat, idx, "item", e.target.value)}
                          className="w-full bg-transparent border-0 font-medium focus:outline-none focus:ring-1 focus:ring-[#EEB100] rounded px-1"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Ya / 1"
                          value={a.jumlah}
                          onChange={(e) => handleItemChange(setItemsAdat, idx, "jumlah", e.target.value)}
                          className="w-full text-center bg-[#FFFFFF] border border-[#D6CEBE] rounded px-1.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Contoh: Beskap maroon payet bapak L2, 43; Ibu 100; Jarik truntum..."
                          value={a.keterangan}
                          onChange={(e) => handleItemChange(setItemsAdat, idx, "keterangan", e.target.value)}
                          className="w-full bg-[#FFFFFF] border border-[#D6CEBE] rounded px-2.5 py-1 text-xs focus:outline-none focus:border-[#EEB100]"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        {idx >= 5 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(setItemsAdat, idx)}
                            className="text-[#B13C30] hover:text-[#8E281E] p-1 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 6: VENDOR DOKUMENTASI, HIBURAN, & CATATAN KHUSUS
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <h2 className="font-sans text-[20px] font-bold text-[#EEB100] mb-4 flex items-center gap-2">
              <Camera size={18} />
              <span>Dokumentasi, Hiburan & Catatan Khusus</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Fotografer & Dokumentasi
                </label>
                <input
                  type="text"
                  name="fotografer"
                  placeholder="Contoh: Tim Foto Studio & Dokumentasi Era Waluyo"
                  value={formData.fotografer}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Video Cinematic
                </label>
                <input
                  type="text"
                  name="video"
                  placeholder="Contoh: Video Teaser 1 Menit & Liputan Full Acara"
                  value={formData.video}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Hiburan / Sound System
                </label>
                <input
                  type="text"
                  name="hiburan"
                  placeholder="Contoh: Musik Akustik / Gamelan Pengiring Resepsi"
                  value={formData.hiburan}
                  onChange={handleChange}
                  className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                  Catatan Tambahan & Keterangan Khusus
                </label>
                <textarea
                  name="catatanKhusus"
                  rows={2}
                  placeholder="Catatan tambahan untuk tim pelaksana di lapangan..."
                  value={formData.catatanKhusus}
                  onChange={handleChange}
                  className="w-full p-3 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#EEB100] transition-colors shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* =========================================================================
              BAGIAN 7: RINCIAN KEUANGAN (TOTAL, DP, & SISA PELUNASAN)
          ========================================================================= */}
          <div className="pt-6 border-t border-[#E5DEC9]">
            <h2 className="font-sans text-[20px] font-bold text-[#EEB100] mb-4 flex items-center gap-2">
              <Wallet size={18} />
              <span>Rincian Biaya & Pembayaran DP</span>
            </h2>

            <div className="p-5 bg-gradient-to-r from-[#FAF7F0] to-[#FFFFFF] border border-[#D6CEBE] rounded-2xl space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                    Total Biaya Paket / Acara (Rp) <span className="text-[#B13C30]">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalBiaya"
                    required
                    min={0}
                    step={100000}
                    value={formData.totalBiaya}
                    onChange={handleChange}
                    className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-base text-[#1A1A1A] font-bold focus:outline-none focus:border-[#EEB100] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                    Uang Muka / DP Diterima (Rp) <span className="text-[#B13C30]">*</span>
                  </label>
                  <input
                    type="number"
                    name="nominalDp"
                    required
                    min={0}
                    step={100000}
                    value={formData.nominalDp}
                    onChange={handleChange}
                    className="w-full h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-base text-[#2F7A4B] font-bold focus:outline-none focus:border-[#EEB100] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5E5A52] mb-1.5">
                    Sisa Pelunasan (Otomatis)
                  </label>
                  <div className="w-full h-11 px-4 bg-[#F5EDDC]/50 border border-[#D6CEBE] rounded-xl text-base text-[#EEB100] font-bold flex items-center">
                    Rp{sisaPembayaran.toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E2D2]">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="dpDiterima"
                    checked={formData.dpDiterima}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-[#D6CEBE] bg-[#FFFFFF] text-[#EEB100] accent-[#EEB100]"
                  />
                  <div>
                    <span className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-[#2F7A4B]" />
                      DP Sah Diterima (Syarat Sah Booking)
                    </span>
                    <p className="text-xs text-[#5E5A52]">
                      Sesuai SOP Era Waluyo, tanggal baru sah dicatat setelah pembayaran uang muka diterima.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-6 border-t border-[#E5DEC9] flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link href="/booking" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full sm:w-auto gap-2 px-6 shadow-sm"
            >
              <Save size={18} />
              <span>{isLoading ? "Menyimpan Data..." : "Simpan Pesanan"}</span>
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

export default function TambahBookingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#5E5A52]">Memuat formulir booking...</div>}>
      <TambahBookingForm />
    </Suspense>
  );
}
