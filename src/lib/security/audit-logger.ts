import fs from "fs";
import path from "path";

/**
 * Audit Trail & Security Logger
 * Mencatat peristiwa keamanan dan aktivitas operasional krusial untuk pemantauan administrator:
 * - Aktivitas Login & Otentikasi
 * - Penambahan Data Booking Terbaru
 * - Edit & Pembaruan Data Booking
 * - Perubahan Keamanan & Pengaturan
 */

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "RATE_LIMIT_BLOCKED"
  | "BOOKING_CREATED"
  | "BOOKING_UPDATED"
  | "BOOKING_DELETED"
  | "BOOKING_CONFIRMED"
  | "CATALOG_DELETED"
  | "TEMPLATE_RESET";

export type ActivityCategory = "all" | "auth" | "booking_add" | "booking_edit" | "security";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: SecurityEventType;
  actor: string;
  description: string;
  status: "success" | "warning" | "danger" | "info";
  ip?: string;
  device?: string;
  details?: Record<string, unknown>;
}

/**
 * Mendeteksi kategori aktivitas untuk keperluan filter UI
 */
export function getActivityCategory(event: SecurityEventType): ActivityCategory {
  if (
    event === "LOGIN_SUCCESS" ||
    event === "LOGIN_FAILED" ||
    event === "LOGOUT" ||
    event === "RATE_LIMIT_BLOCKED"
  ) {
    return "auth";
  }
  if (event === "BOOKING_CREATED") {
    return "booking_add";
  }
  if (
    event === "BOOKING_UPDATED" ||
    event === "BOOKING_DELETED" ||
    event === "BOOKING_CONFIRMED"
  ) {
    return "booking_edit";
  }
  return "security";
}

/**
 * Mendeteksi sistem operasi (Windows, Mac, iOS, Android, Linux) dan browser dari User-Agent
 */
export function parseUserDevice(userAgent?: string | null): string {
  if (!userAgent) return "Perangkat Tidak Dikenal";

  // Deteksi OS
  let os = "Perangkat Lainnya";
  if (/windows/i.test(userAgent)) {
    os = "Windows";
  } else if (/iphone/i.test(userAgent)) {
    os = "iOS (iPhone)";
  } else if (/ipad/i.test(userAgent)) {
    os = "iOS (iPad)";
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    os = "macOS";
  } else if (/android/i.test(userAgent)) {
    os = "Android";
  } else if (/linux/i.test(userAgent)) {
    os = "Linux";
  }

  // Deteksi Browser
  let browser = "";
  if (/edg\//i.test(userAgent)) {
    browser = "Edge";
  } else if (/opr\/|opera/i.test(userAgent)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(userAgent)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(userAgent)) {
    browser = "Firefox";
  } else if (/safari/i.test(userAgent)) {
    browser = "Safari";
  }

  return browser ? `${os} (${browser})` : os;
}

// Lokasi penyimpanan file lokal jika berjalan di lingkungan server Node.js
const DATA_DIR = path.join(process.cwd(), "data");
const LOG_FILE = path.join(DATA_DIR, "activity-logs.json");
const MAX_LOGS = 100;

function ensureDirectoryExists(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch {
    // Abaikan jika read-only
  }
}

function loadPersistedLogs(): AuditLogEntry[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(LOG_FILE)) {
      const raw = fs.readFileSync(LOG_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("[AUDIT_LOG] Gagal membaca log persisten:", err);
  }
  return [];
}

function persistLogs(logs: AuditLogEntry[]) {
  try {
    if (typeof window === "undefined") {
      ensureDirectoryExists(LOG_FILE);
      fs.writeFileSync(LOG_FILE, JSON.stringify(logs.slice(0, MAX_LOGS), null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[AUDIT_LOG] Gagal menyimpan log persisten:", err);
  }
}

// Log awal representatif jika belum ada data sebelumnya
const DEFAULT_SEED_LOGS: AuditLogEntry[] = [
  {
    id: "seed-log-1",
    timestamp: new Date().toISOString(),
    event: "LOGIN_SUCCESS",
    actor: "admin@erawaluyo.com",
    description: "Sesi otentikasi administrator aktif terverifikasi. Sesi aman dimulai.",
    status: "success",
    ip: "127.0.0.1",
    device: "Windows (Chrome)",
    details: { actionType: "auth" },
  },
  {
    id: "seed-log-2",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    event: "BOOKING_UPDATED",
    actor: "admin@erawaluyo.com",
    description: "Pembaruan data booking: Calon Pengantin Anisa & Rizky (Penyesuaian item dekorasi pelaminan & nominal DP).",
    status: "info",
    ip: "127.0.0.1",
    device: "Windows (Chrome)",
    details: { customerName: "Anisa & Rizky", actionType: "update" },
  },
  {
    id: "seed-log-3",
    timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    event: "BOOKING_CREATED",
    actor: "admin@erawaluyo.com",
    description: "Penambahan data booking baru: Calon Pengantin Dimas & Sarah (Paket Premium Gedung 2 - Lokasi: Sasana Kriya).",
    status: "success",
    ip: "127.0.0.1",
    device: "Windows (Chrome)",
    details: { customerName: "Dimas & Sarah", actionType: "create" },
  },
];

let memoryLogs: AuditLogEntry[] = [];

function initializeLogs(): AuditLogEntry[] {
  if (memoryLogs.length > 0) {
    return memoryLogs;
  }

  const loaded = loadPersistedLogs();
  if (loaded.length > 0) {
    memoryLogs = loaded;
  } else {
    memoryLogs = [...DEFAULT_SEED_LOGS];
    persistLogs(memoryLogs);
  }

  return memoryLogs;
}

export function logSecurityEvent(
  event: SecurityEventType,
  actor: string,
  description: string,
  status: "success" | "warning" | "danger" | "info" = "info",
  ip?: string,
  device?: string,
  details?: Record<string, unknown>
): AuditLogEntry {
  initializeLogs();

  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event,
    actor,
    description,
    status,
    ip,
    device,
    details,
  };

  memoryLogs.unshift(entry);
  if (memoryLogs.length > MAX_LOGS) {
    memoryLogs.pop();
  }

  persistLogs(memoryLogs);

  // Log ke server console untuk observability
  console.log(`[AUDIT_LOG] [${entry.timestamp}] [${event}] ${actor} (${device || "Unknown Device"}): ${description}`);

  return entry;
}

export function getRecentAuditLogs(): AuditLogEntry[] {
  return [...initializeLogs()];
}

export function clearAllAuditLogs(): void {
  memoryLogs = [];
  persistLogs(memoryLogs);
}
