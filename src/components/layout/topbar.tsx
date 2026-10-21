"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Calendar, Search, Bell, Check, Clock, AlertTriangle, X } from "lucide-react";

const emptySubscribe = () => () => {};

function getClientToday() {
  const today = new Date();
  const day = today.getDate();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  ];
  const month = months[today.getMonth()];
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
}

export function Topbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const formattedDate = useSyncExternalStore(
    emptySubscribe,
    getClientToday,
    () => ""
  );
  const notifRef = useRef<HTMLDivElement>(null);

  // Tutup notifikasi ketika klik di luar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  // Handle pencarian cepat
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/booking?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const sampleNotifications = [
    {
      id: "1",
      title: "Jadwal Acara Terdekat",
      desc: "Acara pernikahan terdekat dalam 7 hari ke depan memerlukan verifikasi checklist.",
      time: "Hari ini",
      href: "/checklist",
      icon: Clock,
      color: "text-[#EEB100]",
      bg: "bg-[rgba(238,177,0,0.15)]",
    },
    {
      id: "2",
      title: "Konfirmasi Pesanan",
      desc: "Terdapat pesanan booking baru yang menunggu konfirmasi dari pelanggan.",
      time: "Kemarin",
      href: "/booking",
      icon: AlertTriangle,
      color: "text-[#B13C30]",
      bg: "bg-[rgba(177,60,48,0.15)]",
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FFFFFF]/90 dark:bg-[#1E1E1E]/90 backdrop-blur-md border-b border-[#E5DEC9] dark:border-[#2E2A22] transition-colors duration-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Sisi Kiri: Tanggal Hari Ini & Input Search */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 max-w-2xl">
          {/* Badge Tanggal Hari Ini */}
          <div
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] text-xs sm:text-sm font-semibold text-[#1A1A1A] dark:text-[#F5EDDC] shrink-0 shadow-xs select-none"
            title="Tanggal hari ini"
          >
            <Calendar size={16} className="text-[#EEB100] shrink-0" />
            <span className="whitespace-nowrap">{formattedDate || "Memuat..."}</span>
          </div>

          {/* Kolom Pencarian */}
          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A857B] dark:text-[#888888] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi atau catatan..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F0] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] text-xs sm:text-sm text-[#1A1A1A] dark:text-[#F5EDDC] placeholder-[#8A857B] dark:placeholder-[#888888] focus:outline-none focus:border-[#EEB100] dark:focus:border-[#EEB100] focus:ring-2 focus:ring-[#EEB100]/20 transition-all"
            />
          </form>
        </div>

        {/* Sisi Kanan: Notifikasi (Tanpa profile sesuai instruksi) */}
        <div className="flex items-center relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setHasUnread(false);
            }}
            className={`relative p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
              isNotifOpen
                ? "bg-[#FAF7F0] dark:bg-[#2E2E2E] border-[#EEB100] text-[#EEB100]"
                : "bg-[#FAF7F0] dark:bg-[#252525] border-[#E5DEC9] dark:border-[#38342C] text-[#5E5A52] dark:text-[#F5EDDC] hover:bg-[#F3EEDF] dark:hover:bg-[#2F2F2F]"
            }`}
            title="Notifikasi"
            aria-label="Buka notifikasi"
          >
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#EEB100] ring-2 ring-[#FAF7F0] dark:ring-[#252525]" />
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#FFFFFF] dark:bg-[#252525] border border-[#E5DEC9] dark:border-[#38342C] shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-[#E5DEC9] dark:border-[#38342C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1A1A1A] dark:text-[#F5EDDC]">
                    Notifikasi
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(238,177,0,0.15)] text-[#EEB100]">
                    Baru
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-[#8A857B] hover:text-[#1A1A1A] dark:hover:text-[#F5EDDC] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="divide-y divide-[#E5DEC9]/50 dark:divide-[#38342C]/50 max-h-80 overflow-y-auto">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-[#FAF7F0] dark:hover:bg-[#2E2E2E] transition-colors block"
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${n.bg} ${n.color} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1A1A1A] dark:text-[#F5EDDC]">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[#5E5A52] dark:text-[#A8A296] mt-0.5 leading-snug">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-[#8A857B] dark:text-[#888888] mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-3 bg-[#FAF7F0] dark:bg-[#1E1E1E] border-t border-[#E5DEC9] dark:border-[#38342C] text-center">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-[#EEB100] hover:underline cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Tandai semua sudah dibaca</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
