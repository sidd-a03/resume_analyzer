"use client"

import { createColumnHelper, useTable } from "@tanstack/react-table"
import { Trash2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog"
import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { DataTable, DataTablePagination, SortableHeader, TableFilter, TableSearch } from "@/components/shared/data-table"
import { Button } from "@/components/ui/button"
import { analysisStatuses, analysisTypes } from "@/constants/analysis"
import { deleteAnyAnalysis } from "@/lib/actions/admin"
import type { Gate } from "@/lib/admin-access"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDateTime } from "@/lib/format"
import { scoreTone } from "@/lib/score"
import type { AdminAnalysis } from "@/lib/types"
import { cn } from "@/lib/utils"

const helper = createColumnHelper<DataTableFeatures, AdminAnalysis>()

function DeleteButton({ analysis, gate }: { analysis: AdminAnalysis; gate: Gate }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function remove() {
    const result = await deleteAnyAnalysis(analysis.id)
    if (!result.ok) {
      toast.error(result.message)
      return false
    }
    toast.success(`Deleted ${analysis.fileName}`)
    router.refresh()
    return true
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={!gate.ok}
        title={gate.ok ? undefined : gate.reason}
        aria-label={gate.ok ? `Delete ${analysis.fileName}` : `Delete ${analysis.fileName} (${gate.reason})`}
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 />
      </Button>
      {open && (
        <ConfirmDeleteDialog
          id={`delete-analysis-${analysis.id}`}
          title="Delete this analysis?"
          description={
            <>
              {analysis.fileName} by {analysis.user.email}. The report is removed for good and credits aren&apos;t refunded.
            </>
          }
          phrase="DELETE"
          actionLabel="Delete analysis"
          onConfirm={remove}
          onOpenChange={setOpen}
        />
      )}
    </>
  )
}

function buildColumns(canDelete: Gate) {
  return helper.columns([
    helper.accessor("fileName", {
      header: ({ column }) => <SortableHeader column={column} title="File" />,
      sortFn: "alphanumeric",
      cell: ({ row }) => <span className="block max-w-56 truncate font-medium">{row.original.fileName}</span>,
    }),
    helper.accessor((row) => row.user.email, {
      id: "user",
      header: ({ column }) => <SortableHeader column={column} title="User" />,
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <Link
          href={`/admin/users?q=${encodeURIComponent(row.original.user.email)}`}
          className="block max-w-56 truncate text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {row.original.user.email}
        </Link>
      ),
    }),
    helper.accessor("type", {
      header: "Type",
      filterFn: "equalsString",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <TypeBadge type={row.original.type} />,
    }),
    helper.accessor("score", {
      header: ({ column }) => <SortableHeader column={column} title="Score" />,
      sortFn: "basic",
      sortUndefined: "last",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const { score } = row.original
        return score === null ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <span className={cn("font-mono font-semibold", scoreTone(score))}>{score}</span>
        )
      },
    }),
    helper.accessor("status", {
      header: "Status",
      filterFn: "equalsString",
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    }),
    helper.accessor("createdAt", {
      header: ({ column }) => <SortableHeader column={column} title="Created" />,
      sortFn: "alphanumeric", // ISO strings sort chronologically
      enableGlobalFilter: false,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatDateTime(row.original.createdAt)}</span>,
    }),
    helper.display({
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DeleteButton analysis={row.original} gate={canDelete} />
        </div>
      ),
    }),
  ])
}

const ALL = "all"
const typeItems = [
  { value: ALL, label: "All types" },
  ...Object.entries(analysisTypes).map(([value, { label }]) => ({ value, label })),
]
const statusItems = [
  { value: ALL, label: "All statuses" },
  ...Object.entries(analysisStatuses).map(([value, label]) => ({ value, label })),
]

export function AnalysesTable({ analyses, canDelete }: { analyses: AdminAnalysis[]; canDelete: Gate }) {
  const [columns] = useState(() => buildColumns(canDelete))
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: analyses,
    getRowId: (row) => row.id,
    globalFilterFn: "includesString",
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })

  const { columnFilters, globalFilter } = table.state
  const valueOf = (id: string) => (columnFilters.find((f) => f.id === id)?.value as string | undefined) ?? ""
  const setFilter = (id: string, value: string | null) =>
    table.getColumn(id)?.setFilterValue(!value || value === ALL ? undefined : value)
  const filtered = columnFilters.length > 0 || Boolean(globalFilter)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch
          value={(globalFilter as string | undefined) ?? ""}
          onChange={(v) => table.setGlobalFilter(v || undefined)}
          label="Search file or email"
        />
        <TableFilter items={typeItems} value={valueOf("type") || ALL} onChange={(v) => setFilter("type", v)} label="Filter by type" />
        <TableFilter
          items={statusItems}
          value={valueOf("status") || ALL}
          onChange={(v) => setFilter("status", v)}
          label="Filter by status"
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

      <DataTable table={table} empty="No analyses match." />
      <DataTablePagination table={table} />
    </div>
  )
}
