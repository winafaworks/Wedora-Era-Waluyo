export interface WhatsAppTemplateData {
  nama: string;
  tanggal?: string;
  paket?: string;
  lokasi?: string;
  tautan?: string;
  nominal_dp?: string | number;
  status_dp?: string;
}

export const WA_TEMPLATE_STORAGE_KEY = "wedora_wa_template";

export const DEFAULT_WA_TEMPLATE = `Halo Kak {nama}, terima kasih sudah memesan layanan pernikahan di Era Waluyo.

Mohon periksa rincian pesanan Kakak untuk acara pada tanggal {tanggal} ({paket}) lewat tautan resmi berikut, lalu konfirmasi jika data sudah sesuai:

{tautan}

Jika ada catatan atau penyesuaian, Kakak dapat menuliskannya langsung pada halaman tersebut. Terima kasih!`;

export const PRESET_WA_TEMPLATES = [
  {
    id: "default",
    name: "Standar & Tautan Konfirmasi",
    description: "Template resmi sesuai PRD untuk mengirimkan link konfirmasi booking.",
    content: DEFAULT_WA_TEMPLATE,
  },
  {
    id: "lengkap",
    name: "Lengkap dengan Lokasi & DP",
    description: "Menyertakan rincian lengkap tanggal acara, paket, lokasi, status DP, dan tautan.",
    content: `Halo Kak {nama}, terima kasih banyak telah mempercayakan hari bahagia Kakak kepada Era Waluyo.

Berikut rincian pesanan Kakak:
• Tanggal Acara: {tanggal}
• Paket: {paket}
• Lokasi: {lokasi}
• Status DP: {status_dp} ({nominal_dp})

Silakan cek rincian lengkap busana, tata rias, dan kelengkapan lainnya pada tautan resmi berikut:
{tautan}

Mohon konfirmasi jika data sudah sesuai. Terima kasih!`,
  },
  {
    id: "ringkas",
    name: "Formal & Singkat",
    description: "Format singkat langsung menuju pokok pesan dan link konfirmasi.",
    content: `Halo Kak {nama}, salam dari Era Waluyo.

Berikut tautan konfirmasi pesanan pernikahan Kakak ({tanggal}):
{tautan}

Silakan buka tautan di atas untuk memeriksa dan menyetujui rincian pesanan. Terima kasih.`,
  },
  {
    id: "reminder",
    name: "Pengingat / Reminder H-7",
    description: "Pesan pengingat persiapan jelang hari pelaksanaan acara pernikahan.",
    content: `Halo Kak {nama}, salam hangat dari tim Era Waluyo.

Mengingatkan kembali untuk jadwal acara pernikahan Kakak pada tanggal {tanggal} di {lokasi}. Rincian pesanan dapat dicek kembali lewat tautan:
{tautan}

Jika ada perlengkapan atau kebutuhan tambahan, segera hubungi kami ya Kak. Semoga acara berjalan lancar dan penuh berkah!`,
  },
];

export const WA_AVAILABLE_VARIABLES = [
  { tag: "{nama}", label: "Nama Pengantin", example: "Candra" },
  { tag: "{tanggal}", label: "Tanggal Acara", example: "21 Oktober 2026" },
  { tag: "{paket}", label: "Paket Acara", example: "PAKET SIRAMAN" },
  { tag: "{lokasi}", label: "Lokasi Acara", example: "Hotel Heritage" },
  { tag: "{tautan}", label: "Tautan Konfirmasi", example: "https://wedora.id/konfirmasi/abc123xyz" },
  { tag: "{nominal_dp}", label: "Nominal DP", example: "Rp 5.000.000" },
  { tag: "{status_dp}", label: "Status DP", example: "DP Diterima" },
];

/**
 * Format teks template WhatsApp dengan mengganti variabel dinamis
 */
export function formatWhatsAppMessage(
  template: string,
  data: WhatsAppTemplateData
): string {
  let result = template || DEFAULT_WA_TEMPLATE;

  const replaceMap: Record<string, string> = {
    "{nama}": data.nama || "Pelanggan",
    "{tanggal}": data.tanggal || "-",
    "{paket}": data.paket || "Paket Khusus",
    "{lokasi}": data.lokasi || "-",
    "{tautan}": data.tautan || "",
    "{nominal_dp}":
      typeof data.nominal_dp === "number"
        ? `Rp ${data.nominal_dp.toLocaleString("id-ID")}`
        : data.nominal_dp || "Rp 0",
    "{status_dp}": data.status_dp || "DP Diterima",
  };

  Object.entries(replaceMap).forEach(([tag, value]) => {
    // Replace all occurrences (case-insensitive)
    const regex = new RegExp(tag.replace(/[{}]/g, "\\$&"), "gi");
    result = result.replace(regex, value);
  });

  return result;
}

/**
 * Ambil template WhatsApp dari localStorage (khusus sisi client) atau gunakan default
 */
export function getStoredWhatsAppTemplate(): string {
  if (typeof window === "undefined") {
    return DEFAULT_WA_TEMPLATE;
  }
  try {
    const saved = localStorage.getItem(WA_TEMPLATE_STORAGE_KEY);
    return saved && saved.trim().length > 0 ? saved : DEFAULT_WA_TEMPLATE;
  } catch {
    return DEFAULT_WA_TEMPLATE;
  }
}

/**
 * Simpan template WhatsApp ke localStorage
 */
export function saveStoredWhatsAppTemplate(template: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(WA_TEMPLATE_STORAGE_KEY, template);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reset template WhatsApp ke nilai bawaan
 */
export function resetStoredWhatsAppTemplate(): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.removeItem(WA_TEMPLATE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Buat URL WhatsApp Click-to-chat resmi (wa.me)
 */
export function createWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = (phone || "").replace(/\D/g, "").replace(/^0/, "62");
  const encoded = encodeURIComponent(message || "");
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}
