/**
 * Audit Trail & Security Logger
 * Mencatat peristiwa keamanan krusial untuk pemantauan dan investigasi administrator.
 */

export type SecurityEventType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "RATE_LIMIT_BLOCKED"
  | "BOOKING_CREATED"
  | "BOOKING_DELETED"
  | "CATALOG_DELETED"
  | "TEMPLATE_RESET";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  event: SecurityEventType;
  actor: string;
  description: string;
  status: "success" | "warning" | "danger" | "info";
  ip?: string;
  device?: string;
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

// In-memory ring buffer (menyimpan 50 log terbaru untuk tampilan live di admin)
const MAX_LOGS = 50;
const memoryLogs: AuditLogEntry[] = [
  {
    id: "init-1",
    timestamp: new Date().toISOString(),
    event: "LOGIN_SUCCESS",
    actor: "admin@erawaluyo.com",
    description: "Sesi otentikasi administrator aktif terverifikasi.",
    status: "success",
    device: "Windows (Chrome)",
  },
];

export function logSecurityEvent(
  event: SecurityEventType,
  actor: string,
  description: string,
  status: "success" | "warning" | "danger" | "info" = "info",
  ip?: string,
  device?: string
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
  };

  memoryLogs.unshift(entry);
  if (memoryLogs.length > MAX_LOGS) {
    memoryLogs.pop();
  }

  // Log ke console server untuk observability
  console.log(`[AUDIT_LOG] [${entry.timestamp}] [${event}] ${actor} (${device || "Unknown Device"}): ${description}`);

  return entry;
}

export function getRecentAuditLogs(): AuditLogEntry[] {
  return [...memoryLogs];
}
