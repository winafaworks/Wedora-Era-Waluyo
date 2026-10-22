/**
 * Utilitas Sanitasi Input Server-Side
 * Membersihkan input teks dari injeksi script berbahaya (XSS) dan karakter kontrol null-byte.
 */

export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") {
    if (input === null || input === undefined) return "";
    return String(input);
  }

  return input
    // Hapus null byte
    .replace(/\0/g, "")
    // Hapus script tags dan isinya
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Hapus event handlers seperti onload, onclick, onerror
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    // Hapus skema javascript: atau vbscript:
    .replace(/(?:javascript|vbscript|data):/gi, "")
    // Trim spasi berlebih di ujung
    .trim();
}

/**
 * Sanitasi rekursif untuk objek payload form
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeText(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === "string"
          ? sanitizeText(item)
          : typeof item === "object" && item !== null
          ? sanitizeObject(item as Record<string, unknown>)
          : item
      );
    } else if (typeof value === "object" && value !== null) {
      result[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}
