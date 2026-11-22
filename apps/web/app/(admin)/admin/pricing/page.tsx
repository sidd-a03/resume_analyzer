import type { Metadata } from "next"
import { Suspense } from "react"

import { PricingEditor } from "@/components/admin/pricing-editor"
import { PricingUnavailable } from "@/components/shared/pricing-unavailable"
import { PageHeader } from "@/components/shared/page-header"
import { getAdminPricing } from "@/lib/admin"
import { gate } from "@/lib/admin-access"
import { requireAdmin } from "@/lib/session"

export const metadata: Metadata = { title: "Pricing" }

async function PricingContent() {
  const actor = await requireAdmin()
  const pricing = await getAdminPricing()
  if (!pricing) return <PricingUnavailable />
  // Admins see the same page read-only; the API refuses their saves too
  return <PricingEditor pricing={pricing} gate={gate(actor, { pricing: ["update"] })} />
}

export default function AdminPricingPage() {
  return (
    <div className="container-app">
      <PageHeader
        title="Pricing"
        description="What credit packs cost and how many credits each analysis uses. Every change is recorded in the audit log."
      />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <PricingContent />
        </Suspense>
      </div>
    </div>
  )
}
