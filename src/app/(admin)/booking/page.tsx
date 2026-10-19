"use client";

import React from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { BookingSummary } from "@/types";

const mockBookings: BookingSummary[] = [
  {
    id: "BK-001",
    namaPelanggan: "Aulia & Fajar",
    noWa: "081234567890",
    tanggalAcara: "24 Oktober 2026",
    paket: "Paket Premium Gold",
    status: "dikonfirmasi",
    nominalDp: 5000000,
    dpDiterima: true,
  },
  {
    id: "BK-002",
    namaPelanggan: "Rina & Dimas",
    noWa: "082198765432",
    tanggalAcara: "31 Oktober 2026",
    paket: "Paket Classic Royal",
    status: "belum_dikonfirmasi",
    nominalDp: 3500000,
    dpDiterima: true,
  },
  {
    id: "BK-003",
    namaPelanggan: "Siti & Rizky",
    noWa: "085712344321",
    tanggalAcara: "07 November 2026",
    paket: "Paket Adat Lengkap",
    status: "perlu_koreksi",
    nominalDp: 4000000,
    dpDiterima: true,
  },
  {
    id: "BK-004",
    namaPelanggan: "Nadia & Yoga",
    noWa: "081399887766",
    tanggalAcara: "15 November 2026",
    paket: "Paket Modern Elegan",
    status: "dikonfirmasi",
    nominalDp: 6000000,
    dpDiterima: true,
  },
];

export default function BookingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2F2F2F]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Data Booking
          </h1>
          <p className="text-sm md:text-base text-[#A8A49B] mt-1">
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6B64]" size={18} />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelanggan atau nomor WhatsApp..."
            className="w-full h-11 pl-11 pr-4 bg-[#242424] border border-[#2F2F2F] rounded-xl text-sm text-[#F5EDDC] placeholder-[#6E6B64] focus:outline-none focus:border-[#D4AD5C] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" className="gap-2">
            <Filter size={16} />
            <span>Filter Status</span>
          </Button>
        </div>
      </div>

      {/* List */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#242424] text-[#A8A49B] text-xs uppercase tracking-wider border-b border-[#2F2F2F]">
              <tr>
                <th className="py-4 px-6 font-medium">Tanggal</th>
                <th className="py-4 px-6 font-medium">Pelanggan</th>
                <th className="py-4 px-6 font-medium">Paket</th>
                <th className="py-4 px-6 font-medium">Nominal DP</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F2F2F]">
              {mockBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#242424] transition-colors">
                  <td className="py-4 px-6 font-semibold text-[#F5EDDC]">
                    {b.tanggalAcara}
                  </td>
                  <td className="py-4 px-6 text-[#F5EDDC]">
                    <div>{b.namaPelanggan}</div>
                    <div className="text-xs text-[#6E6B64]">{b.noWa}</div>
                  </td>
                  <td className="py-4 px-6 text-[#A8A49B]">{b.paket}</td>
                  <td className="py-4 px-6 text-[#D4AD5C] font-medium">
                    Rp{b.nominalDp.toLocaleString("id-ID")}
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
      </Card>
    </div>
  );
}
