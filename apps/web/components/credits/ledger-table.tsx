import Link from "next/link"

import { EmptyState } from "@/components/shared/empty-state"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ledgerReasons } from "@/constants/analysis"
import type { LedgerEntry } from "@/lib/types"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

export function LedgerTable({ entries }: { entries: LedgerEntry[] }) {
  if (entries.length === 0) return <EmptyState title="No credit activity yet." />

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Date</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead className="pr-5 text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="pl-5 text-muted-foreground">{formatDateTime(entry.createdAt)}</TableCell>
              <TableCell>
                {ledgerReasons[entry.reason]}
                {entry.analysisId && (
                  <>
                    {" · "}
                    <Link href={`/analyses/${entry.analysisId}`} className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
                      view
                    </Link>
                  </>
                )}
              </TableCell>
              <TableCell
                className={cn("pr-5 text-right font-mono font-semibold", entry.delta > 0 ? "text-success" : "text-foreground")}
              >
                {entry.delta > 0 ? `+${entry.delta}` : `−${Math.abs(entry.delta)}`}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
