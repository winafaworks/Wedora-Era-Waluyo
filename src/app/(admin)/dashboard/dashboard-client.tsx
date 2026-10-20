"use client";

import React from "react";
import Link from "next/link";
import { Plus, Calendar, Clock, AlertCircle, Sparkles, ArrowRight, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

interface DashboardProps {
  stats: {
    totalBooking: number;
    acaraBulanIni: number;
    belumDikonfirmasi: number;
    acaraMendatang: number;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  upcomingBookings: any[];
}

export default function DashboardClient({ stats, upcomingBookings }: DashboardProps) {
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5DEC9]">
        <div>
          <h1 className="font-sans text-3xl md:text-4xl font-bold text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="text-sm md:text-base text-[#5E5A52] mt-1">
            Ringkasan booking pernikahan dan acara Era Waluyo
          </p>
        </div>
        <div>
          <Link href="/booking/tambah">
            <Button variant="primary" className="gap-2 shadow-sm">
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
          value={stats.totalBooking}
          subtitle="Tercatat dalam sistem"
          icon={<Sparkles size={20} />}
        />
        <StatCard
          title="Acara Bulan Ini"
          value={stats.acaraBulanIni}
          subtitle="Bulan berjalan"
          icon={<Calendar size={20} />}
        />
        <StatCard
          title="Belum Dikonfirmasi"
          value={stats.belumDikonfirmasi}
          subtitle="Menunggu respon pelanggan"
          icon={<AlertCircle size={20} />}
        />
        <StatCard
          title="Acara Mendatang"
          value={stats.acaraMendatang}
          subtitle="Jadwal berikutnya"
          icon={<Clock size={20} />}
        />
      </div>

      {/* Tabel Acara Terdekat */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-2xl font-bold text-[#1A1A1A]">
            Acara Terdekat
          </h2>
          <Link
            href="/booking"
            className="text-xs md:text-sm text-[#8A6A22] hover:text-[#B8923F] inline-flex items-center gap-1 font-semibold"
          >
            Lihat semua booking <ArrowRight size={14} />
          </Link>
        </div>

        <Card className="p-0 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] border-[#E5DEC9]">
          {upcomingBookings.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(212,173,92,0.18)] flex items-center justify-center text-[#8A6A22]">
                <CalendarX size={24} />
              </div>
              <h3 className="font-sans text-lg font-bold text-[#1A1A1A]">
                Belum Ada Acara Tercatat
              </h3>
              <p className="text-xs text-[#5E5A52]">
                Belum ada pesanan yang tersimpan.
              </p>
              <div className="pt-2">
                <Link href="/booking/tambah">
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <Plus size={16} />
                    <span>Buat Pesanan Pertama</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F5EDDC] text-[#5E5A52] text-xs uppercase tracking-wider border-b border-[#E5DEC9]">
                    <tr>
                      <th className="py-4 px-6 font-semibold">Tanggal Acara</th>
                      <th className="py-4 px-6 font-semibold">Nama Pasangan / Pelanggan</th>
                      <th className="py-4 px-6 font-semibold">Paket</th>
                      <th className="py-4 px-6 font-semibold">Status Konfirmasi</th>
                      <th className="py-4 px-6 font-semibold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DEC9]">
                    {upcomingBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-[#FAF6ED] transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-[#1A1A1A]">
                          {booking.tanggal_acara}
                        </td>
                        <td className="py-4 px-6 text-[#1A1A1A]">
                          <div className="font-medium">{booking.nama_pelanggan}</div>
                          <div className="text-xs text-[#8A857B]">{booking.no_wa}</div>
                        </td>
                        <td className="py-4 px-6 text-[#5E5A52]">
                          {booking.packages?.nama || "-"}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Link href={`/booking/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              Detail
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="divide-y divide-[#E5DEC9] md:hidden">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#8A6A22]">
                          {booking.tanggal_acara}
                        </span>
                        <h3 className="text-base font-semibold text-[#1A1A1A] mt-0.5">
                          {booking.nama_pelanggan}
                        </h3>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-[#5E5A52]">
                      <div>Paket: {booking.packages?.nama || "-"}</div>
                      <div>Kontak: {booking.no_wa}</div>
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
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
