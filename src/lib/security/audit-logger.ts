/**
 * Audit Trail & Security Logger
 * Mencatat peristiwa keamanan dan aktivitas operasional krusial untuk pemantauan administrator:
 * - Aktivitas Login & Otentikasi
 * - Penambahan Data Booking Terbaru
 * - Edit & Pembaruan Data Booking
 * - Perubahan Keamanan & Pengaturan
 */

export * from "@/types/activity-log";
import { AuditLogEntry, SecurityEventType } from "@/types/activity-log";

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

const MAX_LOGS = 100;

// Log representatif awal jika server baru dinyalakan
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

// In-Memory Ring Buffer yang persisten di globalThis runtime
const globalStore = globalThis as unknown as { __wedoraAuditLogs?: AuditLogEntry[] };

if (!globalStore.__wedoraAuditLogs) {
  globalStore.__wedoraAuditLogs = [...DEFAULT_SEED_LOGS];
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

  if (!globalStore.__wedoraAuditLogs) {
    globalStore.__wedoraAuditLogs = [...DEFAULT_SEED_LOGS];
  }

  globalStore.__wedoraAuditLogs.unshift(entry);
  if (globalStore.__wedoraAuditLogs.length > MAX_LOGS) {
    globalStore.__wedoraAuditLogs.pop();
  }

  // Log ke server console untuk observability
  console.log(`[AUDIT_LOG] [${entry.timestamp}] [${event}] ${actor} (${device || "Unknown Device"}): ${description}`);

  return entry;
}

export function getRecentAuditLogs(): AuditLogEntry[] {
  if (!globalStore.__wedoraAuditLogs) {
    globalStore.__wedoraAuditLogs = [...DEFAULT_SEED_LOGS];
  }
  return [...globalStore.__wedoraAuditLogs];
}

export function clearAllAuditLogs(): void {
  globalStore.__wedoraAuditLogs = [];
}
