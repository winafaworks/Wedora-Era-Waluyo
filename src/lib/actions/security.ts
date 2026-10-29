"use server";

import { getRecentAuditLogs, AuditLogEntry, clearAllAuditLogs } from "@/lib/security/audit-logger";
import { getCurrentUser } from "@/lib/actions/auth";

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getRecentAuditLogs();
}

export async function clearAuditLogs(): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Hanya administrator berwenang yang dapat menghapus log." };
  }
  clearAllAuditLogs();
  return { success: true };
}
