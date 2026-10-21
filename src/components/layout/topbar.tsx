"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Search,
  Bell,
  Check,
  Clock,
  AlertTriangle,
  X,
  User,
  CheckSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { searchBookingsAndChecklists } from "@/lib/actions/booking";

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

interface SearchResultItem {
  id: string;
  nama_pelanggan: string;
  tanggal_acara: string;
  lokasi: string;
  status: string | null;
  packages: {
    nama: string;
  } | null;
}

export function Topbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const formattedDate = useSyncExternalStore(
    emptySubscribe,
    getClientToday,
    () => ""
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Handle input search change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
    }
  };

  // Debounce pencarian nama pengantin & checklist acara
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      if (!isMounted) return;
      setIsSearching(true);
      try {
        const results = await searchBookingsAndChecklists(q);
        if (isMounted) {
          setSearchResults(results as SearchResultItem[]);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error("Gagal melakukan pencarian:", err);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // Tutup dropdown pencarian & notifikasi ketika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle submit search form (Tekan Enter atau klik tombol cari)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (searchResults.length > 0) {
      // Langsung arahkan ke halaman detail pesanan hasil pertama
      const first = searchResults[0];
      router.push(`/booking/${first.id}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    } else {
      // Filter daftar booking jika tidak ada direct match
      router.push(`/booking?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  // Navigasi langsung ketika salah satu item hasil pencarian diklik
  const handleSelectResult = (targetUrl: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(targetUrl);
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
    // Topbar dengan posisi fixed/sticky permanen, warna tetap #2C2C2C konsisten dengan sidebar
    <header className="sticky top-0 z-40 w-full bg-[#2C2C2C] border-b border-[#3E3E3E] text-[#F5EDDC] shadow-sm select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Sisi Kiri: Badge Tanggal & Kolom Pencarian */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 max-w-2xl">
          {/* Badge Tanggal Hari Ini - Warna gelap tetap seperti tema sidebar */}
          <div
            className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-[#383838] border border-[#484848] text-xs sm:text-sm font-semibold text-[#F5EDDC] shrink-0 shadow-xs"
            title="Tanggal hari ini"
          >
            <Calendar size={15} className="text-[#D4AD5C] shrink-0" />
            <span className="whitespace-nowrap">{formattedDate || "Memuat..."}</span>
          </div>

          {/* Kolom Pencarian Cepat Nama Pengantin & Checklist Acara */}
          <div className="relative flex-1 min-w-0" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A857B] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsSearchOpen(true);
                }}
                onChange={handleInputChange}
                placeholder="Cari nama pengantin atau checklist acara..."
                className="w-full pl-9 sm:pl-10 pr-9 py-2 rounded-xl bg-[#1E1E1E] border border-[#3E3E3E] text-xs sm:text-sm text-[#F5EDDC] placeholder-[#8A857B] focus:outline-none focus:border-[#D4AD5C] focus:ring-1 focus:ring-[#D4AD5C]/30 transition-all"
              />
              {isSearching ? (
                <Loader2
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4AD5C] animate-spin"
                />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A857B] hover:text-[#F5EDDC] cursor-pointer"
                >
                  <X size={15} />
                </button>
              ) : null}
            </form>

            {/* Dropdown Hasil Pencarian Langsung Ke Halaman Dituju */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#2C2C2C] border border-[#3E3E3E] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-[#242424] border-b border-[#3E3E3E] flex items-center justify-between text-xs text-[#B8B3A8]">
                  <span>Hasil pencarian: &quot;{searchQuery}&quot;</span>
                  <span>{searchResults.length} ditemukan</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#383838]">
                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-5 text-center text-xs text-[#8A857B]">
                      Tidak ditemukan nama pengantin atau acara dengan kata kunci tersebut.
                    </div>
                  ) : (
                    searchResults.map((b) => (
                      <div key={b.id} className="p-2 space-y-1 bg-[#2C2C2C]">
                        {/* 1. Opsi Langsung: Halaman Detail Pengantin / Booking */}
                        <button
                          type="button"
                          onClick={() => handleSelectResult(`/booking/${b.id}`)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#383838] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[rgba(212,173,92,0.18)] text-[#D4AD5C] flex items-center justify-center shrink-0">
                              <User size={16} />
                            </div>
                            <div className="truncate">
                              <span className="block text-xs font-bold text-[#F5EDDC] group-hover:text-[#EEB100] transition-colors truncate">
                                {b.nama_pelanggan}
                              </span>
                              <span className="block text-[11px] text-[#A8A296] truncate">
                                Acara: {b.tanggal_acara} • {b.lokasi || "Lokasi Era Waluyo"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#D4AD5C] bg-[#1E1E1E] px-2 py-1 rounded-lg border border-[#3E3E3E] flex items-center gap-1 shrink-0 ml-2">
                            <span>Data Booking</span>
                            <ArrowRight size={11} />
                          </span>
                        </button>

                        {/* 2. Opsi Langsung: Halaman Checklist Acara */}
                        <button
                          type="button"
                          onClick={() => handleSelectResult(`/checklist?bookingId=${b.id}`)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#383838] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[rgba(47,122,75,0.25)] text-[#7FD39B] flex items-center justify-center shrink-0">
                              <CheckSquare size={16} />
                            </div>
                            <div className="truncate">
                              <span className="block text-xs font-bold text-[#F5EDDC] group-hover:text-[#7FD39B] transition-colors truncate">
                                Checklist Acara: {b.nama_pelanggan}
                              </span>
                              <span className="block text-[11px] text-[#A8A296] truncate">
                                Paket: {b.packages?.nama || "Perlengkapan Acara"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-[#7FD39B] bg-[#1E1E1E] px-2 py-1 rounded-lg border border-[#3E3E3E] flex items-center gap-1 shrink-0 ml-2">
                            <span>Buka Checklist</span>
                            <ArrowRight size={11} />
                          </span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
                ? "bg-[#383838] border-[#D4AD5C] text-[#D4AD5C]"
                : "bg-[#383838] border-[#484848] text-[#B8B3A8] hover:text-[#F5EDDC] hover:bg-[#444444]"
            }`}
            title="Notifikasi"
            aria-label="Buka notifikasi"
          >
            <Bell size={18} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#D4AD5C] ring-2 ring-[#383838]" />
            )}
          </button>

          {/* Dropdown Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#2C2C2C] border border-[#3E3E3E] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-[#3E3E3E] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#F5EDDC]">
                    Notifikasi
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(212,173,92,0.18)] text-[#D4AD5C]">
                    Baru
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="p-1 rounded-lg text-[#8A857B] hover:text-[#F5EDDC] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="divide-y divide-[#383838] max-h-80 overflow-y-auto">
                {sampleNotifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setIsNotifOpen(false)}
                      className="p-3.5 flex items-start gap-3 hover:bg-[#383838] transition-colors block"
                    >
                      <div
                        className={`w-8 h-8 rounded-full ${n.bg} ${n.color} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#F5EDDC]">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-[#B8B3A8] mt-0.5 leading-snug">
                          {n.desc}
                        </p>
                        <span className="text-[10px] text-[#8A857B] mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="p-3 bg-[#242424] border-t border-[#3E3E3E] text-center">
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-[#D4AD5C] hover:text-[#EEB100] cursor-pointer inline-flex items-center gap-1.5"
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
