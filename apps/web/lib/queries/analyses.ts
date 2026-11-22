import { queryOptions } from "@tanstack/react-query"
import type { StartAnalysisInput } from "@repo/validation"

import { isFinished, toAnalysisDetail, type ApiAnalysis, type ApiStartedAnalysis, type UploadedResume } from "@/lib/analysis-api"
import { ApiError, apiClientFetch, apiClientUpload } from "@/lib/api-client"
import type { AnalysisDetail } from "@/lib/types"

export const analysisKeys = {
  all: ["analyses"] as const,
  detail: (id: string) => [...analysisKeys.all, id] as const,
}

/**
 * How often an unfinished analysis is checked, by its age: every 2s for the first 30s (most finish
 * quickly), then every 5s. After 15 minutes it is stuck, not slow, so polling stops and the page offers
 * a manual "Check again". The API's sweeper re-queues stuck jobs after 10 minutes.
 */
export const ANALYSIS_POLL = {
  fastMs: 2_000,
  slowMs: 5_000,
  fastForMs: 30_000,
  giveUpAfterMs: 15 * 60_000,
} as const

/** Age of the analysis when it was last fetched. Uses the fetch time, not "now", so it is safe during render */
const ageAt = (analysis: AnalysisDetail, fetchedAt: number) => fetchedAt - Date.parse(analysis.createdAt)

/** Still queued or running, but too old for that to be normal */
export const isStalled = (analysis: AnalysisDetail, fetchedAt: number) =>
  !isFinished(analysis.status) && ageAt(analysis, fetchedAt) > ANALYSIS_POLL.giveUpAfterMs

/** A 4xx (deleted, signed out): asking again gives the same answer, so stop */
const isFinalError = (error: unknown) => error instanceof ApiError && error.status >= 400 && error.status < 500

export function analysisQuery(initial: AnalysisDetail) {
  return queryOptions({
    queryKey: analysisKeys.detail(initial.id),
    queryFn: async () => toAnalysisDetail(await apiClientFetch<ApiAnalysis>(`/analyses/${initial.id}`)),
    // The server page already fetched it; the first poll happens one interval later, not on mount
    initialData: initial,
    staleTime: ANALYSIS_POLL.fastMs,
    retry: (failures, error) => !isFinalError(error) && failures < 3,
    refetchInterval: (query) => {
      const analysis = query.state.data
      if (!analysis || isFinished(analysis.status)) return false
      if (isFinalError(query.state.error)) return false
      if (isStalled(analysis, query.state.dataUpdatedAt)) return false
      return ageAt(analysis, query.state.dataUpdatedAt) < ANALYSIS_POLL.fastForMs ? ANALYSIS_POLL.fastMs : ANALYSIS_POLL.slowMs
    },
    // Background tabs don't poll (TanStack's default); coming back to the tab checks straight away
  })
}

export function startAnalysis(input: StartAnalysisInput) {
  return apiClientFetch<ApiStartedAnalysis>("/analyses", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
}

/** Sends the PDF straight to the API (not through a Server Action), with real upload progress */
export function uploadResume(file: File, onProgress?: (fraction: number) => void) {
  const body = new FormData()
  body.set("file", file)
  return apiClientUpload<UploadedResume>("/uploads/upload", body, onProgress)
}
