"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

interface BookingListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBookings: any[];
}

export default function BookingListClient({ initialBookings }: BookingListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBookings = useMemo(() => {
    return initialBookings.filter((b) => {
      const matchSearch =
        b.nama_pelanggan.toLowerCase().includes(search.toLowerCase()) ||
        b.no_wa.includes(search) ||
        (b.lokasi && b.lokasi.toLowerCase().includes(search.toLowerCase()));

      const matchStatus =
        statusFilter === "all" ? true : b.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [initialBookings, search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#1A1A1A]">
            Data Booking
          </h1>
          <p className="text-sm md:text-base text-[#5E5A52] mt-1">
            Kelola data pesanan acara pernikahan dan status pembayaran DP
          </p>
        </div>
        <div>
          <Link href="/booking/tambah">
            <Button variant="primary" className="gap-2">
              <Plus size={18} />
              <span>Tambah Booking</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A857B]" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan, nomor WhatsApp, atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] placeholder-[#8A857B] focus:outline-none focus:border-[#A67C24] transition-colors shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl text-sm text-[#1A1A1A] focus:outline-none focus:border-[#A67C24] transition-colors cursor-pointer shadow-sm"
            >
              <option value="all">Semua Status</option>
              <option value="belum_dikonfirmasi">Belum Dikonfirmasi</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="perlu_koreksi">Perlu Koreksi</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#8A6A22]">
              <CalendarX size={24} />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
              Belum Ada Data Booking
            </h3>
            <p className="text-xs text-[#5E5A52] max-w-sm mx-auto">
              {search || statusFilter !== "all"
                ? "Tidak ada pesanan yang sesuai dengan kata kunci pencarian atau filter yang dipilih."
                : "Belum ada pesanan pernikahan yang dicatat. Klik tombol di bawah untuk menambah booking pertama."}
            </p>
            {!search && statusFilter === "all" && (
              <div className="pt-2">
                <Link href="/booking/tambah">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Plus size={16} />
                    <span>Catat Booking Pertama</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5EDDC] text-[#5E5A52] text-xs uppercase tracking-wider border-b border-[#E5DEC9]">
                <tr>
                  <th className="py-4 px-6 font-medium">Tanggal</th>
                  <th className="py-4 px-6 font-medium">Pelanggan</th>
                  <th className="py-4 px-6 font-medium">Lokasi</th>
                  <th className="py-4 px-6 font-medium">Paket</th>
                  <th className="py-4 px-6 font-medium">Nominal DP</th>
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF6ED] transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                      {b.tanggal_acara}
                    </td>
                    <td className="py-4 px-6 text-[#1A1A1A]">
                      <div>{b.nama_pelanggan}</div>
                      <div className="text-xs text-[#5E5A52]">{b.no_wa}</div>
                    </td>
                    <td className="py-4 px-6 text-[#5E5A52] max-w-[180px] truncate">
                      {b.lokasi}
                    </td>
                    <td className="py-4 px-6 text-[#5E5A52]">
                      {b.packages?.nama || "-"}
                    </td>
                    <td className="py-4 px-6 text-[#8A6A22] font-semibold">
                      Rp{Number(b.dp_nominal || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/booking/${b.id}`}>
                        <Button variant="secondary" size="sm">
                          Detail
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
