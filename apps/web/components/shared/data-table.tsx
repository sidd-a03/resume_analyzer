"use client"

import { Subscribe, type Column, type ReactTable, type RowData } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DataTableFeatures } from "@/lib/data-table"
import { cn } from "@/lib/utils"

type AnyTable<TData extends RowData> = ReactTable<DataTableFeatures, TData>

export function DataTable<TData extends RowData>({ table, empty }: { table: AnyTable<TData>; empty: ReactNode }) {
  const rows = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id} className="hover:bg-transparent">
              {group.headers.map((header) => (
                <TableHead key={header.id} className="first:pl-5 last:pr-5">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell key={cell.id} className="first:pl-5 last:pr-5">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={table.getAllLeafColumns().length} className="h-32 text-center text-muted-foreground">
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}


export function SortableHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<DataTableFeatures, TData, TValue>
  title: string
  className?: string
}) {
  return (
    <Subscribe source={column.table.atoms.sorting} selector={(sorting) => sorting.find((s) => s.id === column.id)}>
      {(sort) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(sort ? !sort.desc : false)}
          aria-label={`Sort by ${title}`}
          className={cn("-ml-2.5 h-8 px-2.5 font-medium text-muted-foreground hover:text-foreground", className)}
        >
          {title}
          {!sort ? <ArrowUpDown className="opacity-50" /> : sort.desc ? <ArrowDown /> : <ArrowUp />}
        </Button>
      )}
    </Subscribe>
  )
}


export function DataTablePagination<TData extends RowData>({ table }: { table: AnyTable<TData> }) {
  const { pageIndex } = table.state.pagination
  const pageCount = Math.max(1, table.getPageCount())
  const total = table.getRowCount()

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
      <p>
        {total} {total === 1 ? "row" : "rows"}
      </p>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}


export function TableSearch({
  value,
  onChange,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}) {
  return (
    <div className={cn("relative w-full sm:w-64", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        aria-label={label}
        className="bg-card pl-8"
      />
    </div>
  )
}

/** Toolbar select. The first item is the "show everything" option. */
export function TableFilter({
  items,
  value,
  onChange,
  label,
}: {
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string | null) => void
  label: string
}) {
  return (
    <Select items={items} value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="min-w-36 bg-card">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
