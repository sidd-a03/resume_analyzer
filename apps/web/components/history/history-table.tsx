"use client"

import { useQuery } from "@tanstack/react-query"
import { createColumnHelper, functionalUpdate, useTable, type PaginationState, type SortingState } from "@tanstack/react-table"
import { HISTORY_SORTS, type HistorySort } from "@repo/validation"
import { ArrowUpRight, RotateCw, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { DataTable, DataTablePagination, SortableHeader, TableFilter, TableSearch } from "@/components/shared/data-table"
import { Button, buttonVariants } from "@/components/ui/button"
import { analysisStatuses, analysisTypes } from "@/constants/analysis"
import { dataTableFeatures, type DataTableFeatures } from "@/lib/data-table"
import { formatDate } from "@/lib/format"
import { hasHistoryFilters, historyUrlQuery, parseHistoryParams, type HistoryPage, type HistoryParams } from "@/lib/history"
import { historyQuery } from "@/lib/queries/analyses"
import { scoreTone } from "@/lib/score"
import type { AnalysisStatus, AnalysisSummary, AnalysisType } from "@/lib/types"
import { cn } from "@/lib/utils"

const helper = createColumnHelper<DataTableFeatures, AnalysisSummary>()

const columns = helper.columns([
  helper.accessor("fileName", {
    header: ({ column }) => <SortableHeader column={column} title="File" />,
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
    enableSorting: false,
    cell: ({ row }) => <TypeBadge type={row.original.type} />,
  }),
  helper.accessor("score", {
    header: ({ column }) => <SortableHeader column={column} title="Score" />,
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
    enableSorting: false,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  }),
  helper.accessor("createdAt", {
    header: ({ column }) => <SortableHeader column={column} title="Date" />,
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

const EMPTY_PAGE: HistoryPage = { items: [], total: 0 }
const SEARCH_DELAY_MS = 300

/** Changes the URL without a server render; Next updates useSearchParams, which changes the query key */
function writeUrl(pathname: string, next: HistoryParams, how: "push" | "replace" = "push") {
  const url = `${pathname}${historyUrlQuery(next)}`
  if (how === "push") window.history.pushState(null, "", url)
  else window.history.replaceState(null, "", url)
}

const toSort = (id: string | undefined): HistorySort => (HISTORY_SORTS.includes(id as HistorySort) ? (id as HistorySort) : "createdAt")

/**
 * The server renders the first page; after that the browser takes over. Changing a page, sort or filter
 * writes the URL with history.pushState (Next keeps useSearchParams in sync, and no server render runs),
 * and the new URL becomes a new query key, so TanStack Query fetches that page from the API.
 */
export function HistoryTable({ initial, initialParams }: { initial: HistoryPage; initialParams: HistoryParams }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useMemo(() => parseHistoryParams(searchParams), [searchParams])

  const isInitialView = historyUrlQuery(params) === historyUrlQuery(initialParams)
  const query = useQuery(historyQuery(params, isInitialView ? initial : undefined))
  const page = query.data ?? EMPTY_PAGE

  const navigate = (next: HistoryParams) => writeUrl(pathname, next)

  // Any filter or sort change starts again from page 1
  const refine = (change: Partial<HistoryParams>) => navigate({ ...params, ...change, page: 1 })

  // The search box updates on every key; the URL (and so the API call) waits until typing pauses
  const [text, setText] = useState(params.search)
  const [urlSearch, setUrlSearch] = useState(params.search)
  if (params.search !== urlSearch) {
    // The URL changed from outside the box (back button, Reset): show what the URL says
    setUrlSearch(params.search)
    setText(params.search)
  }
  useEffect(() => {
    const value = text.trim()
    if (value === params.search) return
    const timer = setTimeout(() => writeUrl(pathname, { ...params, search: value, page: 1 }, "replace"), SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text, params, pathname])

  const pagination: PaginationState = { pageIndex: params.page - 1, pageSize: params.pageSize }
  const sorting: SortingState = [{ id: params.sort, desc: params.order === "desc" }]

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data: page.items,
    getRowId: (row) => row.id,
    // The API already paged, sorted and filtered these rows; the table only draws them
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: page.total,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination)
      navigate({ ...params, page: next.pageIndex + 1, pageSize: next.pageSize })
    },
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      refine({ sort: toSort(next?.id), order: next && !next.desc ? "asc" : "desc" })
    },
  })

  const filtered = hasHistoryFilters(params)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <TableSearch value={text} onChange={setText} label="Search by file name" />
        <TableFilter
          items={typeItems}
          value={params.type ?? ALL}
          onChange={(v) => refine({ type: !v || v === ALL ? null : (v as AnalysisType) })}
          label="Filter by type"
        />
        <TableFilter
          items={statusItems}
          value={params.status ?? ALL}
          onChange={(v) => refine({ status: !v || v === ALL ? null : (v as AnalysisStatus) })}
          label="Filter by status"
        />

        {filtered && (
          <Button variant="ghost" size="sm" onClick={() => refine({ type: null, status: null, search: "" })}>
            <X />
            Reset
          </Button>
        )}
      </div>

      {query.isError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2.5 text-sm">
          <span>{query.error.message}</span>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RotateCw />
            Try again
          </Button>
        </div>
      )}

      {/* Old rows stay visible, dimmed, while the next page loads */}
      <div aria-busy={query.isPlaceholderData} className={cn("transition-opacity", query.isPlaceholderData && "opacity-60")}>
        <DataTable
          table={table}
          empty={params.search ? `No files match "${params.search}".` : filtered ? "Nothing matches these filters." : "No analyses yet."}
        />
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
