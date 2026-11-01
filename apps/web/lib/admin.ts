import { ADMIN_PAGE_SIZE, ADMIN_STATS_LIMIT } from "@/constants/admin"
import { authFetch } from "@/lib/session"
import type { AdminUser } from "@/lib/types"
import type { Role } from "@repo/permission"

type UserList = { users: AdminUser[]; total: number }

/** One page of users from better-auth's admin plugin, already filtered and sorted by the API. */
export async function listUsers({ search, role, page }: { search?: string; role?: Role; page: number }) {
  const query = new URLSearchParams({
    limit: String(ADMIN_PAGE_SIZE),
    offset: String((page - 1) * ADMIN_PAGE_SIZE),
    sortBy: "createdAt",
    sortDirection: "desc",
  })
  if (search) {
    query.set("searchValue", search)
    query.set("searchField", search.includes("@") ? "email" : "name")
    query.set("searchOperator", "contains")
  }
  if (role) {
    query.set("filterField", "role")
    query.set("filterValue", role)
    query.set("filterOperator", "eq")
  }

  return (await authFetch<UserList>(`/admin/list-users?${query}`)) ?? { users: [], total: 0 }
}

/**
 * The newest users, for the overview stats and signup chart.
 * TODO: replace with a stats endpoint that counts in the database once there are more users than the limit.
 */
export async function listRecentUsers() {
  const query = new URLSearchParams({ limit: String(ADMIN_STATS_LIMIT), sortBy: "createdAt", sortDirection: "desc" })
  return (await authFetch<UserList>(`/admin/list-users?${query}`)) ?? { users: [], total: 0 }
}

export async function getUser(id: string) {
  return authFetch<AdminUser>(`/admin/get-user?${new URLSearchParams({ id })}`)
}
