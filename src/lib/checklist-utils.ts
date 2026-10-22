/**
 * Utilitas untuk mengelola kategori dan nama barang pada Checklist WEDORA Era Waluyo
 */

export interface ParsedChecklistItem {
  category: string;
  name: string;
}

// Kategori standar yang umum digunakan di Era Waluyo
export const STANDARD_CATEGORIES = [
  "Make Up",
  "Decoration",
  "MC dan Cucuk Lampah",
  "Adat Siraman",
  "Dokumentasi",
  "Sound & Lighting",
  "Busana",
  "Umum",
] as const;

/**
 * Memisahkan string nama barang seperti "[Make Up] Make up bride and groom"
 * menjadi kategori dan nama barang yang bersih.
 */
export function parseItemName(rawName: string): ParsedChecklistItem {
  if (!rawName) return { category: "Umum", name: "" };
  const match = rawName.match(/^\[(.*?)\]\s*(.*)$/);
  if (match && match[1] && match[2]) {
    return {
      category: match[1].trim(),
      name: match[2].trim(),
    };
  }
  return {
    category: "Umum",
    name: rawName.trim(),
  };
}

/**
 * Menggabungkan kategori dan nama barang menjadi format string database
 * Contoh: formatItemName("Make Up", "Make up bride and groom") -> "[Make Up] Make up bride and groom"
 */
export function formatItemName(category: string, name: string): string {
  const cleanName = name.trim();
  if (!category || category.trim() === "Umum" || category.trim() === "Lainnya") {
    return cleanName;
  }
  return `[${category.trim()}] ${cleanName}`;
}

/**
 * Mengembalikan warna badge dan styling visual yang elegan sesuai kategori
 */
export function getCategoryBadgeStyle(category: string): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  const c = category.toLowerCase();
  if (c.includes("make up") || c.includes("rias") || c.includes("busana")) {
    return {
      bg: "bg-[rgba(238,177,0,0.12)] dark:bg-[rgba(238,177,0,0.2)]",
      text: "text-[#EEB100] dark:text-[#F3BA2F]",
      border: "border-[rgba(238,177,0,0.3)]",
      dot: "bg-[#EEB100]",
    };
  }
  if (c.includes("decor") || c.includes("dekorasi") || c.includes("pelaminan")) {
    return {
      bg: "bg-[rgba(46,95,138,0.12)] dark:bg-[rgba(59,130,246,0.18)]",
      text: "text-[#2E5F8A] dark:text-[#93C5FD]",
      border: "border-[rgba(46,95,138,0.3)]",
      dot: "bg-[#2E5F8A] dark:bg-[#60A5FA]",
    };
  }
  if (c.includes("mc") || c.includes("cucuk") || c.includes("lampah") || c.includes("hiburan")) {
    return {
      bg: "bg-[rgba(168,85,247,0.12)] dark:bg-[rgba(168,85,247,0.2)]",
      text: "text-[#7E22CE] dark:text-[#C084FC]",
      border: "border-[rgba(168,85,247,0.3)]",
      dot: "bg-[#A855F7]",
    };
  }
  if (c.includes("siraman") || c.includes("adat") || c.includes("prosesi")) {
    return {
      bg: "bg-[rgba(47,122,75,0.12)] dark:bg-[rgba(16,185,129,0.18)]",
      text: "text-[#2F7A4B] dark:text-[#6EE7B7]",
      border: "border-[rgba(47,122,75,0.3)]",
      dot: "bg-[#2F7A4B] dark:bg-[#34D399]",
    };
  }
  if (c.includes("sound") || c.includes("light") || c.includes("foto") || c.includes("video") || c.includes("dokumen")) {
    return {
      bg: "bg-[rgba(234,88,12,0.12)] dark:bg-[rgba(251,146,60,0.2)]",
      text: "text-[#C2410C] dark:text-[#FDBA74]",
      border: "border-[rgba(234,88,12,0.3)]",
      dot: "bg-[#F97316]",
    };
  }
  // Default / Umum
  return {
    bg: "bg-[#FAF6ED] dark:bg-[#252525]",
    text: "text-[#5E5A52] dark:text-[#B8B3A8]",
    border: "border-[#E5DEC9] dark:border-[#38342C]",
    dot: "bg-[#8A857B]",
  };
}
