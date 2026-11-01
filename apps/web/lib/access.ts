import { roleStatements, statement } from "@repo/permission"
import { createAccessControl } from "better-auth/plugins/access"

/** better-auth roles built from the shared definitions in @repo/permission */
export const ac = createAccessControl(statement)

export const roles = {
  regular: ac.newRole(roleStatements.regular),
  admin: ac.newRole(roleStatements.admin),
  superadmin: ac.newRole(roleStatements.superadmin),
}
