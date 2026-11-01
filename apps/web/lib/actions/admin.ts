"use server"

import { requireAdmin } from "@/lib/session"
import { can, type Permissions } from "@repo/permission"

export type AdminActionResult = { ok: true } | { ok: false; message: string }

async function authorize(permissions: Permissions): Promise<AdminActionResult> {
  const actor = await requireAdmin()
  return can(actor.role, permissions) ? { ok: true } : { ok: false, message: "Only superadmins can do that." }
}

export async function adjustCredits(input: { email: string; amount: number; note: string; direction: "grant" | "revoke" }) {
  const check = await authorize({ credits: [input.direction] })
  if (!check.ok) return check
  if (!Number.isInteger(input.amount) || input.amount < 1 || input.amount > 1000) {
    return { ok: false, message: "Enter a whole number from 1 to 1000." } satisfies AdminActionResult
  }
  if (input.note.trim().length < 3) return { ok: false, message: "Add a short reason." } satisfies AdminActionResult
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
