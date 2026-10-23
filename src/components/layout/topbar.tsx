"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Search,
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
  User,
  CheckSquare,
  ArrowRight,
  Loader2,
  HelpCircle,
} from "lucide-react";
import {
  searchBookingsAndChecklists,
  getAdminNotifications,
  AdminNotification,
} from "@/lib/actions/booking";

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

  // State Notifikasi Real-Time Konfirmasi & Koreksi
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  const formattedDate = useSyncExternalStore(
    emptySubscribe,
    getClientToday,
    () => ""
  );

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Ambil notifikasi konfirmasi & koreksi dari server
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Gagal memuat notifikasi:", err);
    }
  }, []);

  // Muat status read dari localStorage & mulai polling berkala
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("wedora_read_notifications");
        if (saved) {
          setReadIds(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
      fetchNotifications();
    }, 0);

    // Poll setiap 30 detik agar notifikasi konfirmasi/koreksi otomatis muncul
    const interval = setInterval(fetchNotifications, 30000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  // Hitung jumlah notifikasi yang belum dibaca
  const unreadCount = useMemo(() => {
    const readSet = new Set(readIds);
    return notifications.filter((n) => !readSet.has(n.id)).length;
  }, [notifications, readIds]);

  // Aksi tandai semua sudah dibaca
  const handleMarkAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem("wedora_read_notifications", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Klik sebuah notifikasi -> tandai dibaca & buka detail pesanan
  const handleNotificationClick = (n: AdminNotification) => {
    if (!readIds.includes(n.id)) {
      const updated = [...readIds, n.id];
      setReadIds(updated);
      try {
        localStorage.setItem("wedora_read_notifications", JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setIsNotifOpen(false);
    router.push(`/booking/${n.booking_id}`);
  };

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

  return (
    // Topbar dengan posisi fixed/sticky permanen, warna tetap #2C2C2C konsisten dengan sidebar
    <header className="sticky top-0 z-40 w-full bg-[#2C2C2C] border-b border-[#3E3E3E] text-[#F5EDDC] shadow-sm select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Sisi Kiri: Badge Tanggal & Kolom Pencarian */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 max-w-2xl">
          {/* Badge Tanggal Hari Ini - Ringkas ikon di mobile agar input pencarian luas, lengkap teks di tablet/desktop */}
          <div
            className="flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-[#383838] border border-[#484848] text-xs sm:text-sm font-semibold text-[#F5EDDC] shrink-0 shadow-xs"
            title={`Tanggal hari ini: ${formattedDate}`}
          >
            <Calendar size={15} className="text-[#D4AD5C] shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">{formattedDate || "Memuat..."}</span>
          </div>

          {/* Kolom Pencarian Cepat Nama Pengantin & Checklist Acara */}
          <div id="tour-search" className="relative flex-1 min-w-0" ref={searchContainerRef}>
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

            {/* Backdrop penutup di layar mobile */}
            {isSearchOpen && searchQuery.trim() && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-150"
                onClick={() => setIsSearchOpen(false)}
              />
            )}

            {/* Dropdown Hasil Pencarian: Full ke kanan dan ke kiri di mobile (fixed left-3 right-3) */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="fixed left-3 right-3 top-[60px] sm:absolute sm:left-0 sm:right-0 sm:top-full sm:mt-2 bg-[#2C2C2C] border border-[#3E3E3E] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 bg-[#242424] border-b border-[#3E3E3E] flex items-center justify-between text-xs text-[#B8B3A8]">
                  <span className="font-medium truncate mr-2">
                    Hasil pencarian: &quot;{searchQuery}&quot;
                  </span>
                  <span className="shrink-0">{searchResults.length} ditemukan</span>
                </div>

                <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-[#383838]">
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
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-[rgba(212,173,92,0.18)] text-[#D4AD5C] flex items-center justify-center shrink-0">
                              <User size={16} />
                            </div>
                            <div className="truncate min-w-0 flex-1">
                              <span className="block text-xs sm:text-sm font-bold text-[#F5EDDC] group-hover:text-[#EEB100] transition-colors truncate">
                                {b.nama_pelanggan}
                              </span>
                              <span className="block text-[11px] sm:text-xs text-[#A8A296] truncate">
                                Acara: {b.tanggal_acara} • {b.lokasi || "Lokasi Era Waluyo"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold text-[#D4AD5C] bg-[#1E1E1E] px-2.5 py-1.5 rounded-lg border border-[#3E3E3E] flex items-center gap-1 shrink-0 ml-2">
                            <span>Data Booking</span>
                            <ArrowRight size={12} />
                          </span>
                        </button>

                        {/* 2. Opsi Langsung: Halaman Checklist Acara */}
                        <button
                          type="button"
                          onClick={() => handleSelectResult(`/checklist?bookingId=${b.id}`)}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#383838] transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-full bg-[rgba(47,122,75,0.25)] text-[#7FD39B] flex items-center justify-center shrink-0">
                              <CheckSquare size={16} />
                            </div>
                            <div className="truncate min-w-0 flex-1">
                              <span className="block text-xs sm:text-sm font-bold text-[#F5EDDC] group-hover:text-[#7FD39B] transition-colors truncate">
                                Checklist Acara: {b.nama_pelanggan}
                              </span>
                              <span className="block text-[11px] sm:text-xs text-[#A8A296] truncate">
                                Paket: {b.packages?.nama || "Perlengkapan Acara"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] sm:text-xs font-semibold text-[#7FD39B] bg-[#1E1E1E] px-2.5 py-1.5 rounded-lg border border-[#3E3E3E] flex items-center gap-1 shrink-0 ml-2">
                            <span>Buka Checklist</span>
                            <ArrowRight size={12} />
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

        {/* Sisi Kanan: Panduan Fitur & Notifikasi Konfirmasi */}
        <div className="flex items-center gap-2 sm:gap-2.5 relative">
          {/* Tombol Panduan Fitur Highlight (disembunyikan di tampilan mobile) */}
          <button
            id="tour-help-btn"
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("wedora-start-tour"));
            }}
            className="hidden sm:flex p-2.5 rounded-xl border border-[#484848] bg-[#383838] text-[#B8B3A8] hover:text-[#EEB100] hover:border-[#D4AD5C]/50 hover:bg-[#444444] transition-all cursor-pointer shadow-xs items-center justify-center"
            title="Buka Panduan Fitur"
            aria-label="Panduan Fitur"
          >
            <HelpCircle size={18} />
          </button>

          {/* Notifikasi Konfirmasi & Koreksi Pelanggan */}
          <div className="relative" ref={notifRef}>
            <button
              id="tour-notifications"
              type="button"
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                if (!isNotifOpen) {
                  fetchNotifications();
                }
              }}
              className={`relative p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isNotifOpen
                  ? "bg-[#383838] border-[#D4AD5C] text-[#D4AD5C]"
                  : "bg-[#383838] border-[#484848] text-[#B8B3A8] hover:text-[#F5EDDC] hover:bg-[#444444]"
              }`}
              title="Notifikasi konfirmasi & koreksi pelanggan"
              aria-label="Buka notifikasi"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#B13C30] text-[#FFFFFF] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#2C2C2C] shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

          {/* Dropdown Notifikasi */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#2C2C2C] border border-[#3E3E3E] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 border-b border-[#3E3E3E] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#F5EDDC]">
                    Notifikasi Pelanggan
                  </span>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#B13C30] text-white">
                      {unreadCount} Baru
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[rgba(212,173,92,0.18)] text-[#D4AD5C]">
                      Terbaru
                    </span>
                  )}
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
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#8A857B]">
                    Belum ada notifikasi konfirmasi atau koreksi dari pelanggan.
                  </div>
                ) : (
                  notifications.map((n) => {
                    const isRead = readIds.includes(n.id);
                    const isConfirmed = n.type === "dikonfirmasi";

                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left p-3.5 flex items-start gap-3 hover:bg-[#383838] transition-colors cursor-pointer block relative ${
                          !isRead ? "bg-[#333333]" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isConfirmed
                              ? "bg-[rgba(47,122,75,0.25)] text-[#7FD39B]"
                              : "bg-[rgba(177,60,48,0.25)] text-[#FFA39E]"
                          }`}
                        >
                          {isConfirmed ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#F5EDDC] truncate">
                              {n.title}
                            </span>
                            <span
                              className={`text-[9px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                                isConfirmed
                                  ? "bg-[rgba(47,122,75,0.25)] text-[#7FD39B] border border-[rgba(47,122,75,0.4)]"
                                  : "bg-[rgba(177,60,48,0.25)] text-[#FFA39E] border border-[rgba(177,60,48,0.4)]"
                              }`}
                            >
                              {isConfirmed ? "Dikonfirmasi" : "Butuh Koreksi"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#D1C6AD] mt-1 leading-snug line-clamp-2">
                            {n.description}
                          </p>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-[#8A857B]">
                            <span>{n.nama_pelanggan}</span>
                            <span>{n.time}</span>
                          </div>
                        </div>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD5C] shrink-0 mt-2" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-[#242424] border-t border-[#3E3E3E] text-center">
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="text-xs font-semibold text-[#D4AD5C] hover:text-[#EEB100] cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Tandai semua sudah dibaca</span>
                  </button>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </header>
  );
}
