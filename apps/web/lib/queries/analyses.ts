import { queryOptions } from "@tanstack/react-query"
import type { StartAnalysisInput } from "@repo/validation"

import { isFinished, toAnalysisDetail, type ApiAnalysis, type ApiStartedAnalysis, type UploadedResume } from "@/lib/analysis-api"
import { ApiError, apiClientFetch, apiClientUpload } from "@/lib/api-client"
import type { AnalysisDetail } from "@/lib/types"

export const analysisKeys = {
  all: ["analyses"] as const,
  detail: (id: string) => [...analysisKeys.all, id] as const,
}

export const ANALYSIS_POLL = {
  fastMs: 2_000,
  slowMs: 5_000,
  fastForMs: 30_000,
  giveUpAfterMs: 15 * 60_000,
} as const


const ageAt = (analysis: AnalysisDetail, fetchedAt: number) => fetchedAt - Date.parse(analysis.createdAt)

export const isStalled = (analysis: AnalysisDetail, fetchedAt: number) =>
  !isFinished(analysis.status) && ageAt(analysis, fetchedAt) > ANALYSIS_POLL.giveUpAfterMs

const isFinalError = (error: unknown) => error instanceof ApiError && error.status >= 400 && error.status < 500

export function analysisQuery(initial: AnalysisDetail) {
  return queryOptions({
    queryKey: analysisKeys.detail(initial.id),

    queryFn: async () => toAnalysisDetail(await apiClientFetch<ApiAnalysis>(`/analyses/${initial.id}`)),

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
  })
}

export function startAnalysis(input: StartAnalysisInput) {
  return apiClientFetch<ApiStartedAnalysis>("/analyses", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  })
}

export function uploadResume(file: File, onProgress?: (fraction: number) => void) {
  const body = new FormData()
  body.set("file", file)
  return apiClientUpload<UploadedResume>("/uploads/upload", body, onProgress)
}
