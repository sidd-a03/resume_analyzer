import { createAccessControl } from "better-auth/plugins/access"
import { defaultStatements } from "better-auth/plugins/admin/access"

const statement = {
    ...defaultStatements,
    credits: ["grant", "revoke"],
    analysis: ["view-any", "delete-any"],
} as const

export const ac = createAccessControl(statement)

export const regularRole = ac.newRole({ user: [], session: [] })


export const adminRole = ac.newRole({
    user: ["list", "get", "ban"],
    session: ["list", "revoke"],
    analysis: ["view-any"],
})

export const superadminRole = ac.newRole({
    user: [...defaultStatements.user],
    session: [...defaultStatements.session],
    credits: ["grant", "revoke"],
    analysis: ["view-any", "delete-any"],
})
