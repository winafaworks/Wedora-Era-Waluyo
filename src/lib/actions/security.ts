"use server";

import { getRecentAuditLogs, AuditLogEntry } from "@/lib/security/audit-logger";
import { getCurrentUser } from "@/lib/actions/auth";

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return getRecentAuditLogs();
}
