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
  },
];

export function logSecurityEvent(
  event: SecurityEventType,
  actor: string,
  description: string,
  status: "success" | "warning" | "danger" | "info" = "info",
  ip?: string
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    event,
    actor,
    description,
    status,
    ip,
  };

  memoryLogs.unshift(entry);
  if (memoryLogs.length > MAX_LOGS) {
    memoryLogs.pop();
  }

  // Log ke console server untuk observability
  console.log(`[AUDIT_LOG] [${entry.timestamp}] [${event}] ${actor}: ${description}`);

  return entry;
}

export function getRecentAuditLogs(): AuditLogEntry[] {
  return [...memoryLogs];
}
