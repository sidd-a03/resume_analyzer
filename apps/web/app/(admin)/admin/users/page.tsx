import type { Metadata } from "next"
import { Suspense } from "react"

import { UsersTable } from "@/components/admin/users-table"
import { PageHeader } from "@/components/shared/page-header"
import { listUsers } from "@/lib/admin"
import type { Role } from "@repo/permission"
import { requireAdmin } from "@/lib/session"
import { first } from "@/lib/utils"

export const metadata: Metadata = { title: "Users" }

async function UsersContent({ searchParams }: { searchParams: PageProps<"/admin/users">["searchParams"] }) {
  const [actor, params] = await Promise.all([requireAdmin(), searchParams])
  const search = first(params.q)?.trim() || undefined
  const roleParam = first(params.role)
  const role: Role | undefined = roleParam === "admin" || roleParam === "superadmin" ? roleParam : undefined
  const page = Math.max(1, Number(first(params.page)) || 1)

  const { users, total } = await listUsers({ search, role, page })

  return <UsersTable users={users} total={total} page={page} actor={{ id: actor.id, role: actor.role }} />
}

export default function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  return (
    <div className="container-app">
      <PageHeader
        title="Users"
        description="Everyone with an account. Open a user for their sessions, analyses and credits."
      />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <UsersContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
