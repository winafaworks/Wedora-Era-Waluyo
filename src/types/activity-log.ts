/**
 * Definisi Tipe & Kategori Log Aktivitas
 * Aman diimpor oleh Server Components maupun Client Components (bebas dependensi Node.js / fs).
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
 * Mengelompokkan jenis event ke dalam kategori filter
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
