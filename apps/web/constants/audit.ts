import type { AuditAction } from "@/lib/types"

export const auditActions: Record<AuditAction, string> = {
  "user.ban": "Banned user",
  "user.unban": "Unbanned user",
  "user.set_role": "Changed role",
  "user.impersonate": "Impersonated",
  "user.delete": "Deleted user",
  "session.revoke": "Revoked sessions",
  "credits.grant": "Granted credits",
  "credits.revoke": "Revoked credits",
  "analysis.delete": "Deleted analysis",
}
