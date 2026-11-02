import type { Metadata } from "next"
import { Suspense } from "react"

import { AnalyzeFlow } from "@/components/analyze/analyze-flow"
import { PageHeader } from "@/components/shared/page-header"
import { analyses, resumes } from "@/constants/data"
import { getCreditBalance } from "@/lib/credits"
import type { AnalysisType } from "@/lib/types"
import { requireUser } from "@/lib/session"
import { first } from "@/lib/utils"

export const metadata: Metadata = { title: "New analysis" }

const types: AnalysisType[] = ["preview", "full", "job_match"]

async function AnalyzeContent({ searchParams }: { searchParams: PageProps<"/analyze">["searchParams"] }) {
  const [, params, balance] = await Promise.all([requireUser(), searchParams, getCreditBalance()])
  const resumeId = first(params.resume)
  const requestedType = first(params.type) as AnalysisType | undefined

  // TODO: serve actual data from the backend
  const resume = resumes.find((r) => r.id === resumeId)

  // "Re-analyze" links here with ?resume=, so start with that file already accepted
  const initialResume = resume
    ? {
        resume,
        analyzedTypes: [
          ...new Set(analyses.filter((a) => a.resumeId === resume.id && a.status === "succeeded").map((a) => a.type)),
        ],
      }
    : null

  return (
    <AnalyzeFlow
      balance={balance}
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
