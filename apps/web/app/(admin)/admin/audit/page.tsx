import type { Metadata } from "next"
import { Suspense } from "react"

import { AuditTable } from "@/components/admin/audit-table"
import { PageHeader } from "@/components/shared/page-header"
import { auditLog } from "@/constants/data"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Audit log" }

async function AuditContent() {
  await requireAdmin()
  // TODO: serve actual data from the backend
  return <AuditTable entries={auditLog} />
}

export default function AdminAuditPage() {
  return (
    <div className="container-app">
      <PageHeader title="Audit log" description="Who did what in the admin panel. Sample data for now." />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <AuditContent />
        </Suspense>
      </div>
    </div>
  )
}
