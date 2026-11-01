/**
 * Shared roles for the API and the web app. Plain data only: each app turns
 * these into better-auth roles with its own `createAccessControl`, so the
 * types always come from the app's copy of better-auth.
 */

// Mirrors better-auth's `defaultStatements` from "better-auth/plugins/admin/access"
const defaultStatements = {
  user: ["create", "list", "set-role", "ban", "impersonate", "impersonate-admins", "delete", "set-password", "set-email", "get", "update"],
  session: ["list", "revoke", "delete"],
} as const

export const statement = {
  ...defaultStatements,
  credits: ["grant", "revoke"],
  analysis: ["view-any", "delete-any"],
} as const

export type Statement = typeof statement
export type Permissions = { [K in keyof Statement]?: Statement[K][number][] }

export const roleStatements = {
  regular: { user: [], session: [] },
  admin: {
    user: ["list", "get", "ban"],
    session: ["list", "revoke"],
    analysis: ["view-any"],
  },
  superadmin: {
    user: [...defaultStatements.user],
    session: [...defaultStatements.session],
    credits: ["grant", "revoke"],
    analysis: ["view-any", "delete-any"],
  },
} as const satisfies Record<string, Permissions>

export type Role = keyof typeof roleStatements

export const roleLabels: Record<Role, string> = { regular: "User", admin: "Admin", superadmin: "Superadmin" }

/** better-auth stores multiple roles as a comma-separated string */
export function parseRoles(role: string | null | undefined): Role[] {
  return (role ?? "").split(",").map((r) => r.trim()).filter((r): r is Role => r in roleStatements)
}

/** True when any of the user's roles grants every requested action */
export function can(role: string | null | undefined, permissions: Permissions) {
  return parseRoles(role).some((r) => {
    const granted: Permissions = roleStatements[r]
    return Object.entries(permissions).every(([resource, actions]) => {
      const allowed = (granted[resource as keyof Statement] ?? []) as readonly string[]
      return (actions ?? []).every((action) => allowed.includes(action))
    })
  })
}

export function primaryRole(role: string | null | undefined): Role {
  const parsed = parseRoles(role)
  return parsed.includes("superadmin") ? "superadmin" : parsed.includes("admin") ? "admin" : "regular"
}
