import type { Metadata } from "next"
import { Suspense } from "react"

import { AnalysesTable } from "@/components/admin/analyses-table"
import { PageHeader } from "@/components/shared/page-header"
import { adminAnalyses } from "@/constants/data"
import { gate } from "@/lib/admin-access"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Analyses" }

async function AnalysesContent() {
  const actor = await requireAdmin()
  // TODO: serve actual data from the backend
  return <AnalysesTable analyses={adminAnalyses} canDelete={gate(actor, { analysis: ["delete-any"] })} />
}

export default function AdminAnalysesPage() {
  return (
    <div className="container-app">
      <PageHeader title="Analyses" description="Every analysis across all users. Sample data for now." />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <AnalysesContent />
        </Suspense>
      </div>
    </div>
  )
}
