import { CircleAlert, RotateCcw } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AnalysisProgress } from "@/components/analysis/analysis-progress"
import { FullReportView, PreviewReportView } from "@/components/analysis/analysis-report"
import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { PageHeader } from "@/components/shared/page-header"
import { buttonVariants } from "@/components/ui/button"
import { failureMessages } from "@/constants/analysis"
import { getAnalysis } from "@/lib/analyses"
import { getCreditBalance } from "@/lib/credits"
import { formatDateTime } from "@/lib/format"
import { getPricing } from "@/lib/pricing"
import { requireUser } from "@/lib/session"
import { cn } from "@/lib/utils"

export const metadata: Metadata = { title: "Analysis" }

async function AnalysisContent({ params }: { params: PageProps<"/analyses/[id]">["params"] }) {
  const [, analysis, pricing, balance] = await Promise.all([
    requireUser(),
    params.then(({ id }) => getAnalysis(id)),
    getPricing(),
    getCreditBalance(),
  ])
  if (!analysis) notFound()

  const reanalyzeHref = `/analyze?from=${analysis.id}&type=${analysis.type}`
  // The resume's text is gone, so offering the same resume again would only fail: start from an upload
  const retryHref = analysis.error === "TEXT_EXPIRED" ? "/analyze" : reanalyzeHref

  return (
    <>
      <PageHeader
        title={<span className="break-all">{analysis.fileName}</span>}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{formatDateTime(analysis.createdAt)}</span>
            <TypeBadge type={analysis.type} />
            {analysis.status !== "succeeded" && <StatusBadge status={analysis.status} />}
          </span>
        }
        actions={
          <Link href={reanalyzeHref} className={cn(buttonVariants({ variant: "outline" }))}>
            <RotateCcw data-icon="inline-start" />
            Re-analyze
          </Link>
        }
      />

      {(analysis.status === "queued" || analysis.status === "running") && <AnalysisProgress initial={analysis} />}

      {analysis.status === "failed" && (
        <div role="alert" className="mt-8 flex max-w-2xl flex-col items-start gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <CircleAlert className="size-6 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold">We couldn&apos;t finish this analysis</p>
            <p className="mt-1 text-muted-foreground">
              {(analysis.error && failureMessages[analysis.error]) ?? failureMessages.default}
              {analysis.refunded && " Credits used on this analysis have been refunded."}
            </p>
          </div>
          <Link href={retryHref} className={cn(buttonVariants())}>
            Try again
          </Link>
        </div>
      )}

      {analysis.report?.kind === "full" && <FullReportView report={analysis.report} />}
      {analysis.report?.kind === "preview" && (
        <PreviewReportView
          report={analysis.report}
          resumeId={analysis.resumeId}
          unlockCost={pricing?.costs.fullAnalysis ?? 1}
          balance={balance}
        />
      )}
    </>
  )
}

function AnalysisSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="h-10 w-72 animate-pulse rounded-lg bg-muted" />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="h-44 animate-pulse rounded-xl border bg-card" />
        <div className="h-44 animate-pulse rounded-xl border bg-card" />
      </div>
    </div>
  )
}

export default function AnalysisPage({ params }: PageProps<"/analyses/[id]">) {
  return (
    <div className="container-app">
      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisContent params={params} />
      </Suspense>
    </div>
  )
}
