"use client"

import { createColumnHelper, useTable } from "@tanstack/react-table"
import { X } from "lucide-react"

import { DataTable, DataTablePagination, SortableHeader, TableFilter, TableSearch } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { auditActions } from "@/constants/audit"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDateTime } from "@/lib/format"
import type { AuditEntry } from "@/lib/types"
import { primaryRole, roleLabels } from "@repo/permission"

const helper = createColumnHelper<DataTableFeatures, AuditEntry>()

const columns = helper.columns([
  helper.accessor("createdAt", {
    header: ({ column }) => <SortableHeader column={column} title="When" />,
    sortFn: "alphanumeric",
    enableGlobalFilter: false,
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
  }),
  helper.accessor((row) => row.actor.email, {
    id: "actor",
    header: "Who",
    enableSorting: false,
    cell: ({ row }) => {
      const role = primaryRole(row.original.actor.role)
      return (
        <div className="flex min-w-0 items-center gap-2">
          <span className="max-w-52 truncate">{row.original.actor.email}</span>
          <Badge variant="outline" className={role === "superadmin" ? "border-pen/40 text-pen" : undefined}>
            {roleLabels[role]}
          </Badge>
        </div>
      )
    },
  }),
  helper.accessor("action", {
    header: "Action",
    filterFn: "equalsString",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => <span className="font-medium">{auditActions[row.original.action]}</span>,
  }),
  helper.accessor("target", {
    header: "Target",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="max-w-56 truncate">{row.original.target}</p>
        {row.original.detail && <p className="max-w-64 truncate text-xs text-muted-foreground">{row.original.detail}</p>}
      </div>
    ),
  }),
])

const ALL = "all"
const actionItems = [{ value: ALL, label: "All actions" }, ...Object.entries(auditActions).map(([value, label]) => ({ value, label }))]

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: entries,
    getRowId: (row) => row.id,
    globalFilterFn: "includesString",
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })

  const { columnFilters, globalFilter } = table.state
  const action = (columnFilters.find((f) => f.id === "action")?.value as string | undefined) ?? ALL
  const filtered = columnFilters.length > 0 || Boolean(globalFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch
          value={(globalFilter as string | undefined) ?? ""}
          onChange={(v) => table.setGlobalFilter(v || undefined)}
          label="Search admin or target"
        />
        <TableFilter
          items={actionItems}
          value={action}
          onChange={(v) => table.getColumn("action")?.setFilterValue(!v || v === ALL ? undefined : v)}
          label="Filter by action"
        />
        {filtered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters()
              table.resetGlobalFilter()
            }}
          >
            <X />
            Reset
          </Button>
        )}
      </div>

      <DataTable table={table} empty="Nothing logged yet." />
      <DataTablePagination table={table} />
    </div>
  )
}
