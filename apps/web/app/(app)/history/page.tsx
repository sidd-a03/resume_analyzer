import { Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { HistoryTable } from "@/components/history/history-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { listAnalyses } from "@/lib/analyses"
import { hasHistoryFilters, historyUrlQuery, parseHistoryParams } from "@/lib/history"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "History" }

async function HistoryContent({ searchParams }: { searchParams: PageProps<"/history">["searchParams"] }) {
  const [, raw] = await Promise.all([requireUser(), searchParams])

  const params = parseHistoryParams(raw)
  const page = await listAnalyses(params)

  if (page.total === 0 && !hasHistoryFilters(params)) {
    return (
      <EmptyState
        title="No analyses yet"
        description="Upload a resume to get started."
        action={
          <Link href="/analyze" className={cn(buttonVariants())}>
            Upload a resume
          </Link>
        }
      />
    )
  }

  const lastPage = Math.max(1, Math.ceil(page.total / params.pageSize))
  if (params.page > lastPage) redirect(`/history${historyUrlQuery({ ...params, page: lastPage })}`)

  return <HistoryTable initial={page} initialParams={params} />
}

export default function HistoryPage({ searchParams }: PageProps<"/history">) {
  return (
    <div className="container-app">
      <PageHeader
        title="History"
        description="Every resume you've analyzed."
        actions={
          <Link href="/analyze" className={cn(buttonVariants())}>
            <Plus data-icon="inline-start" />
            New analysis
          </Link>
        }
      />

      <div className="mt-8">
        <Suspense fallback={<div className="h-72 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <HistoryContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
