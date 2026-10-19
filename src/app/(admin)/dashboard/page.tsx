"use client";

import React from "react";
import Link from "next/link";
import { Plus, Calendar, Clock, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { BookingSummary, DashboardStats } from "@/types";

const mockStats: DashboardStats = {
  totalBooking: 12,
  acaraBulanIni: 4,
  belumDikonfirmasi: 2,
  acaraMendatang: 7,
};

const mockUpcomingBookings: BookingSummary[] = [
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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2F2F2F]">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-[#F5EDDC]">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[#A8A49B] mt-1">
            Ringkasan booking pernikahan dan acara Era Waluyo
          </p>
        </div>
        <div>
          <Link href="/booking/tambah">
            <Button variant="primary" className="gap-2 shadow-md">
              <Plus size={18} />
              <span>Booking Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Booking"
          value={mockStats.totalBooking}
          subtitle="Tercatat dalam sistem"
          icon={<Sparkles size={20} />}
        />
        <StatCard
          title="Acara Bulan Ini"
          value={mockStats.acaraBulanIni}
          subtitle="Oktober 2026"
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Belum Dikonfirmasi"
          value={mockStats.belumDikonfirmasi}
          subtitle="Menunggu respon pelanggan"
          icon={<AlertCircle size={20} />}
        />
        <StatCard
          title="Acara Mendatang"
          value={mockStats.acaraMendatang}
          subtitle="Jadwal berikutnya"
          icon={<Clock size={20} />}
        />
      </div>

      {/* Tabel Acara Terdekat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-medium text-[#F5EDDC]">
            Acara Terdekat
          </h2>
          <Link
            href="/booking"
            className="text-xs md:text-sm text-[#D4AD5C] hover:text-[#E3C27D] inline-flex items-center gap-1 font-medium"
          >
            Lihat semua booking <ArrowRight size={14} />
          </Link>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#242424] text-[#A8A49B] text-xs uppercase tracking-wider border-b border-[#2F2F2F]">
                <tr>
                  <th className="py-4 px-6 font-medium">Tanggal Acara</th>
                  <th className="py-4 px-6 font-medium">Nama Pasangan / Pelanggan</th>
                  <th className="py-4 px-6 font-medium">Paket</th>
                  <th className="py-4 px-6 font-medium">Status Konfirmasi</th>
                  <th className="py-4 px-6 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2F2F2F]">
                {mockUpcomingBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-[#242424] transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-[#F5EDDC]">
                      {booking.tanggalAcara}
                    </td>
                    <td className="py-4 px-6 text-[#F5EDDC]">
                      <div>{booking.namaPelanggan}</div>
                      <div className="text-xs text-[#6E6B64]">{booking.noWa}</div>
                    </td>
                    <td className="py-4 px-6 text-[#A8A49B]">
                      {booking.paket}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/booking/${booking.id}`}>
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

          {/* Mobile Card View */}
          <div className="divide-y divide-[#2F2F2F] md:hidden">
            {mockUpcomingBookings.map((booking) => (
              <div key={booking.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-[#D4AD5C]">
                      {booking.tanggalAcara}
                    </span>
                    <h3 className="text-base font-semibold text-[#F5EDDC] mt-0.5">
                      {booking.namaPelanggan}
                    </h3>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="text-xs text-[#A8A49B]">
                  <div>Paket: {booking.paket}</div>
                  <div>Kontak: {booking.noWa}</div>
                </div>
                <div className="pt-2 flex justify-end">
                  <Link href={`/booking/${booking.id}`} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      Lihat Rincian Detail
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
