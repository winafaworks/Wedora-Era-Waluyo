"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { driver, Driver } from "driver.js";
import "driver.js/dist/driver.css";

export function TourGuide() {
  const pathname = usePathname();
  const driverRef = useRef<Driver | null>(null);

  useEffect(() => {
    // Fungsi untuk merakit langkah-langkah tur sesuai ketersediaan elemen
    const startTour = (isManual = false) => {
      // Jika bukan manual dan sudah pernah melihat tur, lewati
      if (!isManual) {
        try {
          const hasSeen = localStorage.getItem("wedora_admin_tour_completed");
          if (hasSeen === "true") return;
        } catch {
          // ignore
        }
      }

      // Pastikan driver sebelumnya dihentikan jika sedang aktif
      if (driverRef.current?.isActive()) {
        driverRef.current.destroy();
      }

      const steps = [
        {
          element: "#tour-brand",
          popover: {
            title: "Selamat Datang di WEDORA! ✨",
            description:
              "Sistem Manajemen Digital Pernikahan Era Waluyo. Panduan singkat ini akan mengenalkan fitur-fitur utama agar Anda dapat mengelola operasional acara dengan cepat dan mudah.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#tour-sidebar-nav",
          popover: {
            title: "Menu Navigasi Operasional 🧭",
            description:
              "Akses lengkap ke Dashboard, Kalender Booking, Data Pelanggan, Katalog Gaun & Dekorasi, Checklist Acara, dan Rekap Laporan.",
            side: "right" as const,
            align: "start" as const,
          },
        },
        {
          element: "#tour-search",
          popover: {
            title: "Pencarian Cepat & Instan 🔍",
            description:
              "Cari data calon pengantin, tanggal acara, atau checklist perlengkapan acara dengan mudah langsung dari sini.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#tour-notifications",
          popover: {
            title: "Pusat Notifikasi Real-time 🔔",
            description:
              "Pantau pembaruan otomatis saat calon pengantin mengonfirmasi form fisik atau mengajukan koreksi data acara.",
            side: "bottom" as const,
            align: "end" as const,
          },
        },
      ];

      // Tambahkan langkah khusus dashboard jika sedang berada di dashboard dan elemen tersedia
      if (document.querySelector("#tour-stats")) {
        steps.push({
          element: "#tour-stats",
          popover: {
            title: "Ringkasan Statistik Acara 📊",
            description:
              "Lihat total booking, jadwal acara bulan ini, status verifikasi pelanggan, dan jadwal terdekat secara real-time.",
            side: "bottom" as const,
            align: "start" as const,
          },
        });
      }

      if (document.querySelector("#tour-new-booking")) {
        steps.push({
          element: "#tour-new-booking",
          popover: {
            title: "Tambah Booking Pernikahan ✍️",
            description:
              "Klik tombol ini untuk mendaftarkan jadwal pernikahan baru, memilih paket layanan, dan mencatat data calon mempelai.",
            side: "bottom" as const,
            align: "end" as const,
          },
        });
      }

      // Langkah terakhir mengarahkan ke tombol bantuan agar admin tahu cara membukanya lagi
      steps.push({
        element: "#tour-help-btn",
        popover: {
          title: "Buka Panduan Kapan Saja 💡",
          description:
            "Anda selalu dapat mengulang panduan tur ini kapan pun diperlukan dengan mengklik tombol ikon bantuan ini.",
          side: "bottom" as const,
          align: "end" as const,
        },
      });

      const d = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        stagePadding: 8,
        stageRadius: 14,
        popoverClass: "wedora-tour-popover",
        showProgress: true,
        progressText: "{{current}} dari {{total}}",
        nextBtnText: "Lanjut →",
        prevBtnText: "← Kembali",
        doneBtnText: "Selesai ✓",
        skipMissingElement: true,
        onDestroyed: () => {
          try {
            localStorage.setItem("wedora_admin_tour_completed", "true");
          } catch {
            // ignore
          }
        },
        steps,
      });

      driverRef.current = d;
      d.drive();
    };

    // Event listener untuk memicu manual dari tombol bantuan di Topbar
    const handleManualStart = () => startTour(true);
    window.addEventListener("wedora-start-tour", handleManualStart);

    // Otomatis jalankan jika pertama kali setelah render halaman stabil
    const timer = setTimeout(() => {
      startTour(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wedora-start-tour", handleManualStart);
      if (driverRef.current?.isActive()) {
        driverRef.current.destroy();
      }
    };
  }, [pathname]);

  return null;
}
