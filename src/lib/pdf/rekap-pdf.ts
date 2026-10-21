import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface RekapPdfBookingItem {
  id: string;
  nama_pelanggan: string;
  tanggal_acara: string;
  lokasi?: string | null;
  no_wa?: string | null;
  status: string | null;
  dp_nominal: number | null;
  dp_diterima: boolean | null;
  packages?: {
    nama: string;
    harga_dasar?: number | null;
  } | null;
}

export interface RekapPdfMetrics {
  totalAcara: number;
  totalDpMasuk: number;
  totalEstimasiOmzet: number;
  totalDikonfirmasi: number;
  totalBelumDikonfirmasi: number;
  totalPerluKoreksi: number;
  totalDibatalkan: number;
  konfirmasiRate: number;
}

export interface GenerateRekapPdfOptions {
  bookings: RekapPdfBookingItem[];
  metrics: RekapPdfMetrics;
  periodLabel: string;
  action?: "print" | "download";
}

export function generateRekapPdf({
  bookings,
  metrics,
  periodLabel,
  action = "print",
}: GenerateRekapPdfOptions) {
  // Inisialisasi dokumen A4 portrait (lebar: 210mm, tinggi: 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // =========================================================================
  // 1. KOP SURAT & HEADER BRAND WEDORA
  // =========================================================================
  // Background Header Charcoal
  doc.setFillColor(44, 44, 44); // #2C2C2C (Wedora Charcoal)
  doc.rect(margin, 12, contentWidth, 20, "F");

  // Garis Emas di bawah kop
  doc.setFillColor(212, 173, 92); // #D4AD5C (Gold)
  doc.rect(margin, 32, contentWidth, 1.5, "F");

  // Teks Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(245, 237, 220); // #F5EDDC (Krem)
  doc.text("WEDORA — ERA WALUYO", margin + 6, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(184, 179, 168); // #B8B3A8
  doc.text(
    "LAPORAN REKAPITULASI BOOKING & KEUANGAN DP PERNIKAHAN",
    margin + 6,
    27
  );

  // Waktu Cetak di kanan atas
  const now = new Date();
  const datePrinted = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.setFontSize(7.5);
  doc.setTextColor(212, 173, 92);
  doc.text(`Dicetak: ${datePrinted}`, pageWidth - margin - 6, 25, {
    align: "right",
  });

  // =========================================================================
  // 2. KOTAK INFORMASI PERIODE & STATISTIK RINGKAS (4 KOLOM)
  // =========================================================================
  const statsStartY = 38;
  const statBoxHeight = 20;
  const colWidth = (contentWidth - 6) / 4;

  const statCols = [
    {
      label: "PERIODE LAPORAN",
      val1: periodLabel,
      val2: `${metrics.totalAcara} Acara Terdaftar`,
      color: [166, 124, 36], // Gold
    },
    {
      label: "TOTAL DP MASUK",
      val1: `Rp ${Number(metrics.totalDpMasuk || 0).toLocaleString("id-ID")}`,
      val2: "Akumulasi Pembayaran DP",
      color: [47, 122, 75], // Success Green
    },
    {
      label: "ESTIMASI NILAI PAKET",
      val1: `Rp ${Number(metrics.totalEstimasiOmzet || 0).toLocaleString("id-ID")}`,
      val2: "Potensi Omzet Acara",
      color: [46, 95, 138], // Info Blue
    },
    {
      label: "TINGKAT KONFIRMASI",
      val1: `${metrics.konfirmasiRate}%`,
      val2: `${metrics.totalDikonfirmasi} dari ${metrics.totalAcara} Acara`,
      color: [142, 68, 173], // Purple Accent
    },
  ];

  statCols.forEach((st, idx) => {
    const x = margin + idx * (colWidth + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 222, 201); // #E5DEC9
    doc.setLineWidth(0.3);
    doc.roundedRect(x, statsStartY, colWidth, statBoxHeight, 1.5, 1.5, "FD");

    // Label Header Card
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(138, 133, 123); // #8A857B
    doc.text(st.label, x + 3.5, statsStartY + 5.5);

    // Nilai Utama
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.val1, x + 3.5, statsStartY + 11.5);

    // Keterangan Tambahan
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(94, 90, 82);
    doc.text(st.val2, x + 3.5, statsStartY + 16.5);
  });

  // =========================================================================
  // 3. TABEL DATA RINCIAN BOOKING (DENGAN AUTOTABLE)
  // =========================================================================
  const formatStatusLabel = (status: string | null) => {
    switch (status) {
      case "dikonfirmasi":
        return "Dikonfirmasi";
      case "belum_dikonfirmasi":
        return "Belum Konfirmasi";
      case "perlu_koreksi":
        return "Perlu Koreksi";
      case "dibatalkan":
        return "Dibatalkan";
      default:
        return status || "-";
    }
  };

  const tableData = bookings.map((b, idx) => {
    const dpNominal = Number(b.dp_nominal || 0);
    const dpStatus = b.dp_diterima ? "Diterima" : "Belum";
    const dpFormatted = dpNominal > 0 ? `Rp ${dpNominal.toLocaleString("id-ID")}` : "-";

    const lokasiRaw = b.lokasi || "-";
    const truncatedLokasi =
      lokasiRaw.length > 32 ? lokasiRaw.substring(0, 30) + "..." : lokasiRaw;

    return [
      (idx + 1).toString(),
      b.tanggal_acara || "-",
      b.nama_pelanggan || "-",
      b.packages?.nama || "Paket Khusus",
      truncatedLokasi,
      formatStatusLabel(b.status),
      `${dpStatus}\n${dpFormatted}`,
    ];
  });

  autoTable(doc, {
    startY: statsStartY + statBoxHeight + 5,
    margin: { left: margin, right: margin, bottom: 35 },
    head: [
      [
        "No",
        "Tgl Acara",
        "Nama Pengantin",
        "Paket Acara",
        "Lokasi Pelaksanaan",
        "Status Pesanan",
        "Status & DP",
      ],
    ],
    body: tableData,
    foot: [
      [
        "",
        "",
        "",
        "",
        "",
        "TOTAL DP MASUK",
        `Rp ${Number(metrics.totalDpMasuk || 0).toLocaleString("id-ID")}`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [44, 44, 44], // #2C2C2C
      textColor: [245, 237, 220], // #F5EDDC
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
      cellPadding: 2.5,
    },
    footStyles: {
      fillColor: [245, 237, 220], // #F5EDDC
      textColor: [26, 26, 26], // #1A1A1A
      fontStyle: "bold",
      fontSize: 8,
      halign: "right",
      cellPadding: 3,
    },
    styles: {
      font: "helvetica",
      fontSize: 7.5,
      textColor: [26, 26, 26],
      lineColor: [229, 222, 201], // #E5DEC9
      lineWidth: 0.2,
      cellPadding: 2.5,
      valign: "middle",
    },
    alternateRowStyles: {
      fillColor: [253, 250, 245], // Soft cream
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" }, // No
      1: { cellWidth: 22 }, // Tgl Acara
      2: { cellWidth: 36, fontStyle: "bold" }, // Nama Pengantin
      3: { cellWidth: 34 }, // Paket
      4: { cellWidth: 36 }, // Lokasi
      5: { cellWidth: 24, halign: "center" }, // Status Pesanan
      6: { cellWidth: 22, halign: "right", fontStyle: "bold" }, // Status & DP
    },
    didParseCell: (data) => {
      // Warna khusus status pesanan
      if (data.section === "body" && data.column.index === 5) {
        const val = String(data.cell.raw);
        if (val === "Dikonfirmasi") {
          data.cell.styles.textColor = [47, 122, 75]; // Green
          data.cell.styles.fontStyle = "bold";
        } else if (val === "Belum Konfirmasi") {
          data.cell.styles.textColor = [165, 96, 28]; // Orange
        } else if (val === "Perlu Koreksi") {
          data.cell.styles.textColor = [177, 60, 48]; // Red
        }
      }

      // Warna khusus status DP
      if (data.section === "body" && data.column.index === 6) {
        const val = String(data.cell.raw);
        if (val.startsWith("Diterima")) {
          data.cell.styles.textColor = [47, 122, 75];
        } else {
          data.cell.styles.textColor = [138, 133, 123];
        }
      }
    },
  });

  // Ambil posisi Y akhir dari tabel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 160;

  // =========================================================================
  // 4. KOTAK TANDA TANGAN & PENGESAHAN DOKUMEN
  // =========================================================================
  let signStartY = finalY + 8;
  const signBlockHeight = 32;

  // Cek apakah muat di halaman yang sama, jika tidak buat halaman baru
  if (signStartY + signBlockHeight > pageHeight - 16) {
    doc.addPage();
    signStartY = 16;
  }

  // Bagian Kiri: Catatan Laporan
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(94, 90, 82);
  doc.text("Catatan Laporan:", margin + 2, signStartY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(138, 133, 123);
  doc.text("• Dokumen ini merupakan rekapitulasi data resmi dari sistem WEDORA Era Waluyo.", margin + 2, signStartY + 9);
  doc.text("• Data mencakup seluruh pesanan pernikahan yang sesuai dengan filter periode aktif.", margin + 2, signStartY + 14);
  doc.text("• Seluruh pembayaran DP telah diverifikasi bersama bukti transfer pelanggan.", margin + 2, signStartY + 19);

  // Bagian Kanan: Tanda Tangan Pengelola
  const signRightX = margin + contentWidth - 60;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(94, 90, 82);
  doc.text(`Purwokerto, ${datePrinted}`, signRightX, signStartY + 4);

  doc.setFont("helvetica", "bold");
  doc.text("Pengelola Era Waluyo:", signRightX, signStartY + 9);

  doc.line(signRightX, signStartY + 26, margin + contentWidth - 2, signStartY + 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("( Nama & Cap Resmi Galeri )", signRightX + 4, signStartY + 30);

  // =========================================================================
  // 5. FOOTER HALAMAN DENGAN PENOMORAN OTOMATIS
  // =========================================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(138, 133, 123);

    // Garis pemisah footer
    doc.setDrawColor(229, 222, 201);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    // Kiri: Catatan sistem
    doc.text(
      "WEDORA — Dokumen Resmi Rekapitulasi Keuangan & Booking Era Waluyo",
      margin,
      pageHeight - 6
    );

    // Kanan: Penomoran Halaman
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 6, {
      align: "right",
    });
  }

  // =========================================================================
  // 6. EKSEKUSI OUTPUT (DOWNLOAD ATAU BUKA CETAK PDF)
  // =========================================================================
  const sanitizedPeriod = periodLabel.replace(/[^a-zA-Z0-9_-]/g, "_").substring(0, 30);
  const fileName = `Laporan-Rekap-Wedora-${sanitizedPeriod}.pdf`;

  if (action === "download") {
    doc.save(fileName);
  } else {
    // Buat Blob URL lalu buka di tab baru agar browser membuka PDF viewer bersih
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  }
}
