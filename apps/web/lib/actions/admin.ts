"use server"

import { requireAdmin } from "@/lib/session"
import { can, type Permissions } from "@repo/permission"
import { adjustCreditsSchema, type AdjustCreditsInput } from "@repo/validation"

export type AdminActionResult = { ok: true } | { ok: false; message: string }

async function authorize(permissions: Permissions): Promise<AdminActionResult> {
  const actor = await requireAdmin()
  return can(actor.role, permissions) ? { ok: true } : { ok: false, message: "Only superadmins can do that." }
}

export async function adjustCredits(input: AdjustCreditsInput): Promise<AdminActionResult> {
  const parsed = adjustCreditsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form and try again." }
  const check = await authorize({ credits: [parsed.data.direction] })
  if (!check.ok) return check
  // TODO: write a ledger entry in the backend, which checks the role again and logs it to the audit log
  return check
}

export async function deleteAnyAnalysis(analysisId: string): Promise<AdminActionResult> {
  const check = await authorize({ analysis: ["delete-any"] })
  if (!check.ok) return check
  // TODO: delete the analysis and its report in the backend, then refresh()
  void analysisId
  return check
}
