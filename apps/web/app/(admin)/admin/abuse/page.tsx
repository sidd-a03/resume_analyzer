import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { abuseSignals } from "@/constants/data"
import type { AbuseKind } from "@/lib/types"
import { formatDateTime } from "@/lib/format"
import { requireAdmin } from "@/lib/session"
import { cn, first } from "@/lib/utils"

export const metadata: Metadata = { title: "Abuse review" }

const kinds: Record<AbuseKind, string> = {
  phone: "Phone",
  ip: "IP address",
  resume_hash: "Same resume",
  payment_card: "Payment card",
}

async function AbuseContent({ searchParams }: { searchParams: PageProps<"/admin/abuse">["searchParams"] }) {
  // 404s for non-admins. The API must check the role too, this is only the UI.
  const [, params] = await Promise.all([requireAdmin(), searchParams])

  const kindParam = first(params.kind)
  const kind = kindParam && kindParam in kinds ? (kindParam as AbuseKind) : undefined
  // TODO: serve actual data from the backend
  const signals = abuseSignals.filter((s) => !kind || s.kind === kind)

  return (
    <>
      <nav aria-label="Filter by kind" className="flex flex-wrap gap-2">
        {[undefined, ...(Object.keys(kinds) as AbuseKind[])].map((k) => (
          <Link
            key={k ?? "all"}
            href={k ? `/admin/abuse?kind=${k}` : "/admin/abuse"}
            aria-current={k === kind ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors hover:border-foreground/30",
              k === kind ? "border-foreground bg-foreground text-background" : "bg-card text-muted-foreground",
            )}
          >
            {k ? kinds[k] : "All"}
          </Link>
        ))}
      </nav>

      {signals.length === 0 ? (
        <EmptyState className="mt-4" title="No signals of this kind" />
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-5">Kind</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="pr-5">Last seen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signals.map((signal) => (
                <TableRow key={signal.id}>
                  <TableCell className="pl-5">{kinds[signal.kind]}</TableCell>
                  <TableCell className="font-mono text-xs">{signal.value}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{signal.count}</TableCell>
                  <TableCell>
                    <ul className="flex flex-col gap-0.5 text-sm">
                      {signal.users.map((u) => (
                        <li key={u.id}>
                          <Link
                            href={`/admin/users?q=${encodeURIComponent(u.email)}`}
                            className="text-foreground underline-offset-4 hover:underline"
                          >
                            {u.email}
                          </Link>{" "}
                          <span className="font-mono text-xs text-muted-foreground">{u.id}</span>
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="pr-5 text-muted-foreground">{formatDateTime(signal.lastSeenAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

export default function AbusePage({ searchParams }: PageProps<"/admin/abuse">) {
  return (
    <div className="container-app">
      <PageHeader title="Abuse review" description="Shared phones, IPs and files across accounts. Sample data for now." />
      <div className="mt-8">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <AbuseContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
