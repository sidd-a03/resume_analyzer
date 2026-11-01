import { Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { HistoryTable } from "@/components/history/history-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { RefreshWhile } from "@/components/shared/refresh-while"
import { buttonVariants } from "@/components/ui/button"
import { analyses } from "@/constants/data"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "History" }

async function HistoryContent() {
  await requireUser()
  // TODO: serve actual data from the backend

  if (analyses.length === 0) {
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

  return (
    <>
      <RefreshWhile active={analyses.some((a) => a.status === "queued" || a.status === "running")} />
      <HistoryTable analyses={analyses} />
    </>
  )
}

export default function HistoryPage() {
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
          <HistoryContent />
        </Suspense>
      </div>
    </div>
  )
}
