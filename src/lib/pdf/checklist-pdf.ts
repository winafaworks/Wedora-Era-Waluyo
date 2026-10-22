import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChecklistItemData, ChecklistBookingOption } from "@/lib/actions/checklist";
import { parseItemName } from "@/lib/checklist-utils";

interface GenerateChecklistPdfOptions {
  booking: ChecklistBookingOption;
  items: ChecklistItemData[];
  action?: "print" | "download";
}

export function generateChecklistPdf({
  booking,
  items,
  action = "print",
}: GenerateChecklistPdfOptions) {
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
  // 1. KOP SURAT & HEADER WEDORA
  // =========================================================================
  // Background Header Bar Tipis
  doc.setFillColor(44, 44, 44); // #2C2C2C (Wedora Dark Charcoal)
  doc.rect(margin, 12, contentWidth, 20, "F");

  // Garis Aksen Emas di bawah kop
  doc.setFillColor(212, 173, 92); // #D4AD5C (Gold)
  doc.rect(margin, 32, contentWidth, 1.5, "F");

  // Teks Header Brand
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(245, 237, 220); // #F5EDDC (Krem)
  doc.text("WEDORA — ERA WALUYO", margin + 6, 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(184, 179, 168); // #B8B3A8
  doc.text(
    "LEMBAR KONTROL OPERASIONAL & CHECKLIST BARANG PERNIKAHAN",
    margin + 6,
    27
  );

  // Waktu Cetak di kanan header
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
  // 2. KOTAK INFORMASI ACARA (EVENT METADATA BOX)
  // =========================================================================
  const metaStartY = 38;
  const metaBoxHeight = 30;

  // Background box info
  doc.setFillColor(250, 246, 237); // #FAF6ED
  doc.setDrawColor(229, 222, 201); // #E5DEC9
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, metaStartY, contentWidth, metaBoxHeight, 2, 2, "FD");

  // Format tanggal acara
  let formattedEventDate = booking.tanggal_acara;
  try {
    const d = new Date(booking.tanggal_acara);
    if (!isNaN(d.getTime())) {
      formattedEventDate = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  } catch {
    // Gunakan nilai asli jika gagal parse
  }

  // Kolom Kiri
  const col1X = margin + 5;
  const col1ValX = col1X + 32;

  doc.setFontSize(8);
  doc.setTextColor(94, 90, 82); // #5E5A52
  doc.setFont("helvetica", "bold");
  doc.text("Nama Pelanggan", col1X, metaStartY + 8);
  doc.text("Tanggal Acara", col1X, metaStartY + 15);
  doc.text("Lokasi Acara", col1X, metaStartY + 22);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 26, 26); // #1A1A1A
  doc.text(`:  ${booking.nama_pelanggan || "-"}`, col1ValX, metaStartY + 8);
  doc.setFont("helvetica", "bold");
  doc.text(`:  ${formattedEventDate || "-"}`, col1ValX, metaStartY + 15);
  doc.setFont("helvetica", "normal");

  // Potong lokasi jika terlalu panjang
  const lokasiText = booking.lokasi || "-";
  const truncatedLokasi =
    lokasiText.length > 36 ? lokasiText.substring(0, 34) + "..." : lokasiText;
  doc.text(`:  ${truncatedLokasi}`, col1ValX, metaStartY + 22);

  // Kolom Kanan
  const col2X = margin + contentWidth / 2 + 5;
  const col2ValX = col2X + 28;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(94, 90, 82);
  doc.text("Paket Acara", col2X, metaStartY + 8);
  doc.text("No. WhatsApp", col2X, metaStartY + 15);
  doc.text("Status Pesanan", col2X, metaStartY + 22);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 26, 26);
  doc.text(`:  ${booking.packages?.nama || "Paket Khusus"}`, col2ValX, metaStartY + 8);
  doc.text(`:  ${booking.no_wa || "-"}`, col2ValX, metaStartY + 15);

  const statusLabel =
    booking.status === "dikonfirmasi"
      ? "Dikonfirmasi"
      : booking.status === "belum_dikonfirmasi"
      ? "Belum Dikonfirmasi"
      : booking.status || "-";
  doc.text(`:  ${statusLabel}`, col2ValX, metaStartY + 22);

  // =========================================================================
  // 3. STATISTIK RINGKASAN PROGRESS BARANG
  // =========================================================================
  const statsStartY = metaStartY + metaBoxHeight + 4;
  const totalItems = items.length;
  const sudahDimuat = items.filter((i) => i.dimuat).length;
  const sudahKembali = items.filter((i) => i.kembali).length;
  const diLokasi = items.filter((i) => i.dimuat && !i.kembali).length;

  const statCols = [
    { label: "Total Barang", val: `${totalItems} Item`, color: [166, 124, 36] },
    {
      label: "Sudah Dimuat",
      val: `${sudahDimuat} (${totalItems > 0 ? Math.round((sudahDimuat / totalItems) * 100) : 0}%)`,
      color: [46, 95, 138],
    },
    {
      label: "Sudah Kembali",
      val: `${sudahKembali} (${totalItems > 0 ? Math.round((sudahKembali / totalItems) * 100) : 0}%)`,
      color: [47, 122, 75],
    },
    {
      label: "Di Luar / Belum Kembali",
      val: `${diLokasi} Item`,
      color: diLokasi > 0 ? [177, 60, 48] : [94, 90, 82],
    },
  ];

  const colWidth = (contentWidth - 6) / 4;
  statCols.forEach((st, idx) => {
    const x = margin + idx * (colWidth + 2);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 222, 201);
    doc.roundedRect(x, statsStartY, colWidth, 12, 1.5, 1.5, "FD");

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(138, 133, 123); // #8A857B
    doc.text(st.label.toUpperCase(), x + 3, statsStartY + 4.5);

    doc.setFontSize(9);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.val, x + 3, statsStartY + 9.5);
  });

  // =========================================================================
  // 4. TABEL CHECKLIST BARANG (DENGAN AUTOTABLE)
  // =========================================================================
  const formatTimeOnly = (isoString: string | null) => {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const tableData = items.map((item, index) => {
    const dimuatTime = formatTimeOnly(item.dimuat_pada);
    const kembaliTime = formatTimeOnly(item.kembali_pada);

    const dimuatText = item.dimuat
      ? `[V] Dimuat\n${dimuatTime ? `(${dimuatTime})` : ""}`
      : "[   ] Belum Dimuat";

    const kembaliText = item.kembali
      ? `[V] Kembali\n${kembaliTime ? `(${kembaliTime})` : ""}`
      : item.dimuat
      ? "[ ! ] BELUM KEMBALI"
      : "[   ] Belum Kembali";

    const statusText = item.kembali
      ? "SELESAI"
      : item.dimuat
      ? "DI LOKASI"
      : "MENUNGGU";

    const parsed = parseItemName(item.nama_barang);
    const displayName =
      parsed.category && parsed.category !== "Umum"
        ? `[${parsed.category.toUpperCase()}]\n${parsed.name}`
        : parsed.name;

    return [
      (index + 1).toString(),
      displayName,
      dimuatText,
      kembaliText,
      statusText,
      "", // Kolom paraf/catatan fisik kosong untuk ditulis tangan
    ];
  });

  autoTable(doc, {
    startY: statsStartY + 16,
    margin: { left: margin, right: margin, bottom: 35 },
    head: [
      [
        "No",
        "Nama Barang & Perlengkapan",
        "Status Dimuat",
        "Status Kembali",
        "Status Akhir",
        "Paraf / Cek Fisik",
      ],
    ],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [44, 44, 44], // #2C2C2C
      textColor: [245, 237, 220], // #F5EDDC
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
      lineWidth: 0.2,
      lineColor: [212, 173, 92], // Aksen emas pada garis header
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [26, 26, 26],
      cellPadding: 2.5,
      valign: "middle",
      lineWidth: 0.15,
      lineColor: [229, 222, 201],
    },
    alternateRowStyles: {
      fillColor: [253, 251, 247],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: "auto", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 36, fontSize: 7.5 },
      3: { halign: "center", cellWidth: 36, fontSize: 7.5 },
      4: { halign: "center", cellWidth: 26, fontSize: 7.5 },
      5: { halign: "center", cellWidth: 30 },
    },
    didParseCell: (data) => {
      // Highlight status krusial (belum kembali padahal sudah dimuat)
      if (data.section === "body") {
        const rowItem = items[data.row.index];
        if (rowItem) {
          if (data.column.index === 3 && rowItem.dimuat && !rowItem.kembali) {
            data.cell.styles.textColor = [177, 60, 48]; // Merah krusial
            data.cell.styles.fontStyle = "bold";
          }
          if (data.column.index === 4) {
            if (rowItem.kembali) {
              data.cell.styles.textColor = [47, 122, 75]; // Hijau
              data.cell.styles.fontStyle = "bold";
            } else if (rowItem.dimuat) {
              data.cell.styles.textColor = [177, 60, 48]; // Merah
              data.cell.styles.fontStyle = "bold";
            } else {
              data.cell.styles.textColor = [138, 133, 123];
            }
          }
        }
      }
    },
  });

  // =========================================================================
  // 5. AREA TANDA TANGAN & PENGESAHAN LAPANGAN (DI HALAMAN TERAKHIR)
  // =========================================================================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY : 150;
  
  // Periksa apakah masih cukup ruang untuk kolom tanda tangan di halaman yang sama
  const signatureHeight = 32;
  let signStartY = finalY + 6;

  if (signStartY + signatureHeight > pageHeight - 15) {
    doc.addPage();
    signStartY = 20;
  }

  // Box Tanda Tangan
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(229, 222, 201);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, signStartY, contentWidth, signatureHeight, 2, 2, "FD");

  // Garis pemisah tengah
  doc.setDrawColor(229, 222, 201);
  doc.line(
    margin + contentWidth / 2,
    signStartY,
    margin + contentWidth / 2,
    signStartY + signatureHeight
  );

  // Teks Tanda Tangan Kiri: Tim Logistik
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(94, 90, 82);
  doc.text("Petugas Pengangkut / Logistik Box:", margin + 8, signStartY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("(Muat berangkat & Cek kembali)", margin + 8, signStartY + 10);
  doc.line(margin + 8, signStartY + 25, margin + contentWidth / 2 - 8, signStartY + 25);
  doc.text("Nama & Tanda Tangan", margin + 8, signStartY + 29);

  // Teks Tanda Tangan Kanan: Penanggung Jawab Rias & Busana
  const signRightX = margin + contentWidth / 2 + 8;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(94, 90, 82);
  doc.text("Penanggung Jawab Acara / MUA:", signRightX, signStartY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("(Serah terima perlengkapan di lokasi)", signRightX, signStartY + 10);
  doc.line(signRightX, signStartY + 25, margin + contentWidth - 8, signStartY + 25);
  doc.text("Nama & Tanda Tangan", signRightX, signStartY + 29);

  // =========================================================================
  // 6. FOOTER HALAMAN DENGAN PENOMORAN OTOMATIS
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
      "WEDORA — Dokumen Resmi Operasional Acara Era Waluyo",
      margin,
      pageHeight - 6
    );

    // Kanan: Penomoran Halaman
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 6, {
      align: "right",
    });
  }

  // =========================================================================
  // 7. EKSEKUSI OUTPUT (DOWNLOAD ATAU BUKA CETAK PDF)
  // =========================================================================
  const sanitizedName = (booking.nama_pelanggan || "Acara")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 30);
  const sanitizedDate = (booking.tanggal_acara || "Tanggal").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `Checklist-Wedora-${sanitizedName}-${sanitizedDate}.pdf`;

  if (action === "download") {
    doc.save(fileName);
  } else {
    // Buat Blob URL lalu buka di tab baru agar browser membuka PDF viewer bersih
    const pdfBlob = doc.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");
  }
}
