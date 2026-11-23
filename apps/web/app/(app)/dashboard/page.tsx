import type { Metadata } from "next"
import { Suspense } from "react"

import { CreditsCard } from "@/components/dashboard/credits-card"
import { NewAnalysisCard } from "@/components/dashboard/new-analysis-card"
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { RecentAnalyses } from "@/components/dashboard/recent-analyses"
import { PageHeader } from "@/components/shared/page-header"
import { listAnalyses } from "@/lib/analyses"
import { getCredits } from "@/lib/credits"
import { defaultHistoryParams, recentAnalysesParams } from "@/lib/history"
import { getPricing } from "@/lib/pricing"
import { requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Dashboard" }

async function DashboardContent() {
  const [user, { balance, welcomeClaimed }, pricing, recent, jobMatches] = await Promise.all([
    requireUser(),
    getCredits(),
    getPricing(),
    listAnalyses(recentAnalysesParams),
    listAnalyses({ ...defaultHistoryParams, type: "job_match", pageSize: 1 }),
  ])

  const onboarding = { uploaded: recent.total > 0, welcomeClaimed, triedJobMatch: jobMatches.total > 0 }
  const firstName = user.name.split(" ")[0] || "there"

  return (
    <>
      <PageHeader title={`Hi, ${firstName}`} description="Pick up where you left off, or check a new resume." />

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <NewAnalysisCard />
        <CreditsCard balance={balance} fullCost={pricing?.costs.fullAnalysis ?? null} />
      </div>

      <div className="mt-6">
        <OnboardingChecklist onboarding={onboarding} />
      </div>

      <div className="mt-10">
        <RecentAnalyses initial={recent} />
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
        <div className="h-56 animate-pulse rounded-xl border bg-card" />
      </div>
      <div className="mt-6 h-48 animate-pulse rounded-xl border bg-card" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="container-app">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}
