import { FileText } from "lucide-react"
import Link from "next/link"

import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { EmptyState } from "@/components/shared/empty-state"
import { ScoreRing } from "@/components/shared/score-ring"
import { buttonVariants } from "@/components/ui/button"
import type { AnalysisSummary } from "@/lib/types"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"

function AnalysisCard({ analysis }: { analysis: AnalysisSummary }) {
  return (
    <li>
      <Link
        href={`/analyses/${analysis.id}`}
        className="group flex h-full items-center gap-4 rounded-xl border bg-card p-4 transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {analysis.score !== null ? (
          <ScoreRing score={analysis.score} size={56} strokeWidth={5} />
        ) : (
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-dashed text-muted-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium group-hover:underline group-hover:underline-offset-4">{analysis.fileName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(analysis.createdAt)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <TypeBadge type={analysis.type} />
            {analysis.status !== "succeeded" && <StatusBadge status={analysis.status} />}
          </div>
        </div>
      </Link>
    </li>
  )
}

export function RecentAnalyses({ analyses }: { analyses: AnalysisSummary[] }) {
  return (
    <section aria-labelledby="recent-heading">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="recent-heading" className="text-lg font-semibold">
          Recent analyses
        </h2>
        {analyses.length > 0 && (
          <Link href="/history" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            View all
          </Link>
        )}
      </div>

      {analyses.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="No analyses yet"
          description="Upload a resume to get started. The free preview costs nothing."
          action={
            <Link href="/analyze" className={cn(buttonVariants())}>
              Upload a resume
            </Link>
          }
        />
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {analyses.map((analysis) => (
            <AnalysisCard key={analysis.id} analysis={analysis} />
          ))}
        </ul>
      )}
    </section>
  )
}
