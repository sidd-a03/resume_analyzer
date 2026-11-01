import type { Metadata } from "next"
import { Suspense } from "react"

import { AdjustCreditsDialog } from "@/components/admin/adjust-credits-dialog"
import { LedgerTable } from "@/components/admin/ledger-table"
import { PageHeader } from "@/components/shared/page-header"
import { adminLedger } from "@/constants/data"
import { gate } from "@/lib/admin-access"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Credits" }

async function AdjustButton() {
  const actor = await requireAdmin()
  return <AdjustCreditsDialog gate={gate(actor, { credits: ["grant", "revoke"] })} />
}

async function LedgerContent() {
  await requireAdmin()
  // TODO: serve actual data from the backend
  return <LedgerTable entries={adminLedger} />
}

export default function AdminCreditsPage() {
  return (
    <div className="container-app">
      <PageHeader
        title="Credits"
        description="Every credit added or spent, across all users. Sample data for now."
        actions={
          <Suspense fallback={null}>
            <AdjustButton />
          </Suspense>
        }
      />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <LedgerContent />
        </Suspense>
      </div>
    </div>
  )
}
