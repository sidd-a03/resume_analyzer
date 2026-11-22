"use client"

import { useQuery } from "@tanstack/react-query"
import { Check, Loader2, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { progressMessages } from "@/constants/analysis"
import { analysisQuery, isStalled } from "@/lib/queries/analyses"
import type { AnalysisDetail } from "@/lib/types"
import { cn } from "@/lib/utils"

/**
 * Queued and running states: the report's outline as a skeleton, with live progress. Polls the API (see
 * analysisQuery for the schedule) and refreshes the page when the status changes, so the server renders
 * the finished report or the failure.
 */
export function AnalysisProgress({ initial }: { initial: AnalysisDetail }) {
  const router = useRouter()
  const { data: analysis, dataUpdatedAt, refetch, isFetching } = useQuery(analysisQuery(initial))

  useEffect(() => {
    if (analysis.status !== initial.status) router.refresh()
  }, [analysis.status, initial.status, router])

  const stalled = isStalled(analysis, dataUpdatedAt)
  const current = analysis.status === "queued" ? -1 : analysis.progressStep

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="rounded-xl border bg-card p-6">
        <p className="font-semibold" role="status" aria-live="polite">
          {stalled
            ? "This is taking longer than usual"
            : analysis.status === "queued"
              ? "Waiting for a free worker…"
              : progressMessages[analysis.progressStep]}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {stalled
            ? "It's still in the queue and will finish on its own. If it fails, any credits spent are refunded."
            : "This usually takes under a minute. You can leave this page."}
        </p>
        {stalled && (
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Loader2 className="animate-spin" /> : <RotateCcw />}
            Check again
          </Button>
        )}
        <ol className="mt-6 flex flex-col gap-3">
          {progressMessages.map((message, index) => (
            <li
              key={message}
              className={cn("flex items-center gap-3 text-sm", index > current && "text-muted-foreground")}
            >
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-full border",
                  index < current && "border-success/40 bg-success/10 text-success",
                )}
              >
                {index < current ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : index === current && !stalled ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                ) : null}
              </span>
              {message.replace("…", "")}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-col gap-4" aria-hidden="true">
        <div className="flex items-center gap-6 rounded-xl border bg-card p-6">
          <div className="size-28 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl border bg-card" />
        ))}
      </div>
    </div>
  )
}
