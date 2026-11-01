"use client"

import { createColumnHelper, functionalUpdate, useTable, type PaginationState } from "@tanstack/react-table"
import { BadgeCheck, Search } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { UserActions } from "@/components/admin/user-actions"
import { DataTable, DataTablePagination } from "@/components/shared/data-table"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ADMIN_PAGE_SIZE } from "@/constants/admin"
import type { Actor } from "@/lib/admin-access"
import type { AdminUser } from "@/lib/types"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDate } from "@/lib/format"
import { primaryRole, roleLabels } from "@repo/permission"
import { cn } from "@/lib/utils"

const helper = createColumnHelper<DataTableFeatures, AdminUser>()

const roleTone = {
  superadmin: "border-pen/40 bg-pen/10 text-pen",
  admin: "border-foreground/30 text-foreground",
  regular: "text-muted-foreground",
} as const

function buildColumns(actor: Actor) {
  return helper.columns([
    helper.accessor("name", {
      header: "User",
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={user.name} image={user.image} />
            <div className="min-w-0">
              <p className="truncate font-medium">
                <Link href={`/admin/users/${user.id}`} className="underline-offset-4 hover:underline">
                  {user.name}
                </Link>
                {user.id === actor.id && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )
      },
    }),
    helper.accessor("role", {
      header: "Role",
      cell: ({ row }) => {
        const role = primaryRole(row.original.role)
        return (
          <Badge variant="outline" className={roleTone[role]}>
            {roleLabels[role]}
          </Badge>
        )
      },
    }),
    helper.accessor("banned", {
      header: "Status",
      cell: ({ row }) => {
        const { banned, banExpires, banReason } = row.original
        if (!banned) return <span className="text-sm text-success">Active</span>
        return (
          <span className="text-sm text-destructive" title={banReason ?? undefined}>
            Banned{banExpires && ` until ${formatDate(banExpires)}`}
          </span>
        )
      },
    }),
    helper.accessor("phoneNumberVerified", {
      header: "Phone",
      cell: ({ row }) =>
        row.original.phoneNumberVerified ? (
          <BadgeCheck className="size-4 text-success" aria-label="Verified" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    }),
    helper.accessor("createdAt", {
      header: "Joined",
      cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <UserActions user={row.original} actor={actor} />
        </div>
      ),
    }),
  ])
}

const ALL = "all"
const roleItems = [
  { value: ALL, label: "All roles" },
  { value: "superadmin", label: "Superadmins" },
  { value: "admin", label: "Admins" },
]

export function UsersTable({ users, total, page, actor }: { users: AdminUser[]; total: number; page: number; actor: Actor }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") ?? "")
  const [columns] = useState(() => buildColumns(actor))

  function navigate(changes: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const pagination: PaginationState = { pageIndex: page - 1, pageSize: ADMIN_PAGE_SIZE }
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: users,
    getRowId: (row) => row.id,
    // The API already filtered, sorted and paged these rows
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    rowCount: total,
    state: { pagination },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      navigate({ page: next.pageIndex > 0 ? String(next.pageIndex + 1) : null })
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="relative w-full sm:w-72"
          onSubmit={(event) => {
            event.preventDefault()
            navigate({ q: search.trim() || null, page: null })
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email, press Enter"
            aria-label="Search users"
            className="bg-card pl-8"
          />
        </form>

        <Select
          items={roleItems}
          value={searchParams.get("role") ?? ALL}
          onValueChange={(v) => navigate({ role: v && v !== ALL ? v : null, page: null })}
        >
          <SelectTrigger aria-label="Filter by role" className={cn("min-w-36 bg-card")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roleItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable table={table} empty="No users match." />
      <DataTablePagination table={table} />
    </div>
  )
}
