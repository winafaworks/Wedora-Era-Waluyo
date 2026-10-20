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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#3D3D3D]">
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
          {upcomingBookings.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-[rgba(212,173,92,0.14)] flex items-center justify-center text-[#D4AD5C]">
                <CalendarX size={24} />
              </div>
              <h3 className="font-serif text-lg font-medium text-[#F5EDDC]">
                Belum Ada Acara Tercatat
              </h3>
              <p className="text-xs text-[#A8A49B]">
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
                  <thead className="bg-[#303030] text-[#A8A49B] text-xs uppercase tracking-wider border-b border-[#3D3D3D]">
                    <tr>
                      <th className="py-4 px-6 font-medium">Tanggal Acara</th>
                      <th className="py-4 px-6 font-medium">Nama Pasangan / Pelanggan</th>
                      <th className="py-4 px-6 font-medium">Paket</th>
                      <th className="py-4 px-6 font-medium">Status Konfirmasi</th>
                      <th className="py-4 px-6 font-medium text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3D3D3D]">
                    {upcomingBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-[#303030] transition-colors"
                      >
                        <td className="py-4 px-6 font-semibold text-[#F5EDDC]">
                          {booking.tanggal_acara}
                        </td>
                        <td className="py-4 px-6 text-[#F5EDDC]">
                          <div>{booking.nama_pelanggan}</div>
                          <div className="text-xs text-[#6E6B64]">{booking.no_wa}</div>
                        </td>
                        <td className="py-4 px-6 text-[#A8A49B]">
                          {booking.packages?.nama || "-"}
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

              {/* Mobile View */}
              <div className="divide-y divide-[#3D3D3D] md:hidden">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-semibold text-[#D4AD5C]">
                          {booking.tanggal_acara}
                        </span>
                        <h3 className="text-base font-semibold text-[#F5EDDC] mt-0.5">
                          {booking.nama_pelanggan}
                        </h3>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                    <div className="text-xs text-[#A8A49B]">
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
