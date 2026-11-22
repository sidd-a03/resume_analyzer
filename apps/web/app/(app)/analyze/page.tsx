import type { Metadata } from "next"
import { Suspense } from "react"

import { AnalyzeFlow } from "@/components/analyze/analyze-flow"
import { PageHeader } from "@/components/shared/page-header"
import { getAnalysis } from "@/lib/analyses"
import { getCreditBalance } from "@/lib/credits"
import { getPricing } from "@/lib/pricing"
import type { AnalysisType } from "@/lib/types"
import { requireUser } from "@/lib/session"
import { first } from "@/lib/utils"

export const metadata: Metadata = { title: "New analysis" }

const types: AnalysisType[] = ["preview", "full", "job_match"]

const fallbackCosts = { preview: 0, fullAnalysis: 1, jobMatch: 2 } as const

async function resumeFrom(analysisId: string | undefined) {
  if (!analysisId) return null
  
  const source = await getAnalysis(analysisId).catch(() => null)
  return source ? { id: source.resumeId, fileName: source.fileName, sizeBytes: null, pages: null } : null
}

async function AnalyzeContent({ searchParams }: { searchParams: PageProps<"/analyze">["searchParams"] }) {
  const params = await searchParams
  const [, balance, pricing, initialResume] = await Promise.all([
    requireUser(),
    getCreditBalance(),
    getPricing(),
    resumeFrom(first(params.from)),
  ])
  const requestedType = first(params.type) as AnalysisType | undefined

  return (
    <AnalyzeFlow
      balance={balance}
      costs={pricing?.costs ?? fallbackCosts}
      initialResume={initialResume}
      initialType={requestedType && types.includes(requestedType) ? requestedType : "preview"}
    />
  )
}

export default function AnalyzePage({ searchParams }: PageProps<"/analyze">) {
  return (
    <div className="container-app">
      <PageHeader
        title="New analysis"
        description="Upload a PDF, pick how deep to go, and we'll do the rest. You'll see the cost before anything is charged."
      />
      <Suspense fallback={<div className="mt-10 h-64 max-w-3xl animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
        <AnalyzeContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
