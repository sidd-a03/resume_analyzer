import { createAccessControl } from "better-auth/plugins/access"
import { roleStatements, statement } from "@repo/permission"

export const ac = createAccessControl(statement)

export const regularRole = ac.newRole(roleStatements.regular)
export const adminRole = ac.newRole(roleStatements.admin)
export const superadminRole = ac.newRole(roleStatements.superadmin)
