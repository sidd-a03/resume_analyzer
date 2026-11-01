"use client"

import { createColumnHelper, useTable } from "@tanstack/react-table"
import { ArrowUpRight, X } from "lucide-react"
import Link from "next/link"

import { DeleteAnalysisButton } from "@/components/analysis/delete-analysis-button"
import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { DataTable, DataTablePagination, SortableHeader, TableFilter, TableSearch } from "@/components/shared/data-table"
import { Button, buttonVariants } from "@/components/ui/button"
import { analysisStatuses, analysisTypes } from "@/constants/analysis"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDate } from "@/lib/format"
import { scoreTone } from "@/lib/score"
import type { AnalysisSummary } from "@/lib/types"
import { cn } from "@/lib/utils"

const helper = createColumnHelper<DataTableFeatures, AnalysisSummary>()

const columns = helper.columns([
  helper.accessor("fileName", {
    header: ({ column }) => <SortableHeader column={column} title="File" />,
    filterFn: "includesString",
    sortFn: "alphanumeric",
    cell: ({ row }) => (
      <Link
        href={`/analyses/${row.original.id}`}
        className="block max-w-64 truncate font-medium underline-offset-4 outline-none hover:underline focus-visible:underline"
      >
        {row.original.fileName}
      </Link>
    ),
  }),
  helper.accessor("type", {
    header: "Type",
    filterFn: "equalsString",
    enableSorting: false,
    cell: ({ row }) => <TypeBadge type={row.original.type} />,
  }),
  helper.accessor("score", {
    header: ({ column }) => <SortableHeader column={column} title="Score" />,
    sortFn: "basic",
    sortUndefined: "last",
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
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  helper.accessor("createdAt", {
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
    sortFn: "alphanumeric", // ISO strings sort chronologically
    cell: ({ row }) => <span className="text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
  }),
  helper.display({
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex justify-end gap-1">
        <Link
          href={`/analyses/${row.original.id}`}
          aria-label={`Open analysis of ${row.original.fileName}`}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ArrowUpRight />
        </Link>
        <DeleteAnalysisButton id={row.original.id} fileName={row.original.fileName} from="list" compact />
      </div>
    ),
  }),
])

const ALL = "all"
const typeItems = [
  { value: ALL, label: "All types" },
  ...Object.entries(analysisTypes).map(([value, { label }]) => ({ value, label })),
]
const statusItems = [
  { value: ALL, label: "All statuses" },
  ...Object.entries(analysisStatuses).map(([value, label]) => ({ value, label })),
]

export function HistoryTable({ analyses }: { analyses: AnalysisSummary[] }) {
  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: analyses,
    getRowId: (row) => row.id,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
  })

  const filters = table.state.columnFilters
  const valueOf = (id: string) => (filters.find((f) => f.id === id)?.value as string | undefined) ?? ""
  const setFilter = (id: string, value: string | null) =>
    table.getColumn(id)?.setFilterValue(!value || value === ALL ? undefined : value)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch value={valueOf("fileName")} onChange={(v) => setFilter("fileName", v)} label="Search by file name" />
        <TableFilter items={typeItems} value={valueOf("type") || ALL} onChange={(v) => setFilter("type", v)} label="Filter by type" />
        <TableFilter
          items={statusItems}
          value={valueOf("status") || ALL}
          onChange={(v) => setFilter("status", v)}
          label="Filter by status"
        />

        {filters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            <X />
            Reset
          </Button>
        )}
      </div>

      <DataTable table={table} empty="Nothing matches these filters." />
      <DataTablePagination table={table} />
    </div>
  )
}
