import { can, primaryRole, type Permissions } from "@repo/permission"

/**
 * What the admin panel lets someone do, with the reason when it doesn't.
 * This only shapes the UI; the API has to enforce the same rules.
 */

export interface Actor {
  id: string
  role: string | null
}

export type Gate = { ok: true } | { ok: false; reason: string }

const allow: Gate = { ok: true }
const deny = (reason: string): Gate => ({ ok: false, reason })

export const SUPERADMIN_ONLY = "Superadmin only"

export function gate(actor: Actor, permissions: Permissions): Gate {
  return can(actor.role, permissions) ? allow : deny(SUPERADMIN_ONLY)
}

export type UserAction = "sessions" | "revoke" | "ban" | "setRole" | "impersonate" | "remove"

/** Nobody acts on themselves, and admins can only act on regular users. */
export function userGates(actor: Actor, target: { id: string; role: string | null }): Record<UserAction, Gate> | null {
  if (actor.id === target.id) return null

  const targetRole = primaryRole(target.role)
  const isSuper = primaryRole(actor.role) === "superadmin"
  const reach = isSuper || targetRole === "regular"
  const onTarget = (permissions: Permissions) =>
    !reach ? deny(`Only superadmins can act on ${targetRole}s`) : gate(actor, permissions)

  return {
    sessions: gate(actor, { session: ["list"] }),
    revoke: onTarget({ session: ["revoke"] }),
    ban: onTarget({ user: ["ban"] }),
    setRole: onTarget({ user: ["set-role"] }),
    impersonate: onTarget({ user: [targetRole === "regular" ? "impersonate" : "impersonate-admins"] }),
    remove: onTarget({ user: ["delete"] }),
  }
}

/** One line per role for the overview, so admins know what to ask a superadmin for. */
export const roleSummaries = {
  admin: "You can view everything, ban regular users and sign them out. Role changes, impersonation, deleting users or analyses and credit changes need a superadmin.",
  superadmin: "You can do everything here, including changing roles, impersonating, deleting users and analyses, and granting or revoking credits.",
} as const
