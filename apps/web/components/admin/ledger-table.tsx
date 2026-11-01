"use client"

import { createColumnHelper, useTable } from "@tanstack/react-table"
import { X } from "lucide-react"
import Link from "next/link"

import { DataTable, DataTablePagination, SortableHeader, TableFilter, TableSearch } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { ledgerReasons } from "@/constants/analysis"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDateTime } from "@/lib/format"
import type { AdminLedgerEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

const helper = createColumnHelper<DataTableFeatures, AdminLedgerEntry>()

const columns = helper.columns([
  helper.accessor("createdAt", {
    header: ({ column }) => <SortableHeader column={column} title="When" />,
    sortFn: "alphanumeric",
    enableGlobalFilter: false,
    cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
  }),
  helper.accessor((row) => row.user.email, {
    id: "user",
    header: ({ column }) => <SortableHeader column={column} title="User" />,
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <Link
        href={`/admin/users?q=${encodeURIComponent(row.original.user.email)}`}
        className="block max-w-56 truncate underline-offset-4 hover:underline"
      >
        {row.original.user.email}
      </Link>
    ),
  }),
  helper.accessor("reason", {
    header: "Reason",
    filterFn: "equalsString",
    enableSorting: false,
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const { reason, note, by } = row.original
      return (
        <div className="min-w-0">
          <p>{ledgerReasons[reason]}</p>
          {(note || by) && (
            <p className="max-w-72 truncate text-xs text-muted-foreground">
              {note}
              {by && ` · by ${by}`}
            </p>
          )}
        </div>
      )
    },
  }),
  helper.accessor("delta", {
    header: ({ column }) => (
      <div className="flex justify-center">
        <SortableHeader column={column} title="Credits" className="ml-0" />
      </div>
    ),
    sortFn: "basic",
    enableGlobalFilter: false,
    cell: ({ row }) => {
      const { delta } = row.original
      return (
        <p className={cn("text-center font-mono font-semibold", delta > 0 ? "text-success" : "text-muted-foreground")}>
          {delta > 0 ? `+${delta}` : `−${Math.abs(delta)}`}
        </p>
      )
    },
  }),
])

const ALL = "all"
const reasonItems = [{ value: ALL, label: "All reasons" }, ...Object.entries(ledgerReasons).map(([value, label]) => ({ value, label }))]

export function LedgerTable({ entries }: { entries: AdminLedgerEntry[] }) {
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
  const reason = (columnFilters.find((f) => f.id === "reason")?.value as string | undefined) ?? ALL
  const filtered = columnFilters.length > 0 || Boolean(globalFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch
          value={(globalFilter as string | undefined) ?? ""}
          onChange={(v) => table.setGlobalFilter(v || undefined)}
          label="Search by email"
        />
        <TableFilter
          items={reasonItems}
          value={reason}
          onChange={(v) => table.getColumn("reason")?.setFilterValue(!v || v === ALL ? undefined : v)}
          label="Filter by reason"
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

      <DataTable table={table} empty="No ledger entries match." />
      <DataTablePagination table={table} />
    </div>
  )
}
