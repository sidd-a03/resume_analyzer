import { keepPreviousData, queryOptions } from "@tanstack/react-query"
import type { StartAnalysisInput } from "@repo/validation"

import {
  isFinished,
  toAnalysisDetail,
  type ApiAnalysis,
  type ApiHistoryPage,
  type ApiStartedAnalysis,
  type UploadedResume,
} from "@/lib/analysis-api"
import { ApiError, apiClientFetch, apiClientUpload } from "@/lib/api-client"
import { historyApiPath, toHistoryPage, type HistoryPage, type HistoryParams } from "@/lib/history"
import type { AnalysisDetail, AnalysisSummary } from "@/lib/types"

export const analysisKeys = {
  all: ["analyses"] as const,
  detail: (id: string) => [...analysisKeys.all, id] as const,
  list: (params: HistoryParams) => [...analysisKeys.all, "list", params] as const,
}

export const ANALYSIS_POLL = {
  fastMs: 2_000,
  slowMs: 5_000,
  fastForMs: 30_000,
  giveUpAfterMs: 15 * 60_000,
} as const


type Timed = Pick<AnalysisSummary, "status" | "createdAt">

const ageAt = (analysis: Timed, fetchedAt: number) => fetchedAt - Date.parse(analysis.createdAt)

export const isStalled = (analysis: Timed, fetchedAt: number) =>
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

export function historyQuery(params: HistoryParams, initial?: HistoryPage) {
  return queryOptions({
    queryKey: analysisKeys.list(params),
    queryFn: async () => toHistoryPage(await apiClientFetch<ApiHistoryPage>(historyApiPath(params))),
    initialData: initial,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    retry: (failures, error) => !isFinalError(error) && failures < 3,

    refetchInterval: (query) => {
      const { data, dataUpdatedAt, error } = query.state
      if (!data || isFinalError(error)) return false
      const active = data.items.some((a) => !isFinished(a.status) && !isStalled(a, dataUpdatedAt))
      return active ? ANALYSIS_POLL.slowMs : false
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

export function deleteAllResumes() {
  return apiClientFetch<{ deleted: number }>("/resumes", { method: "DELETE" })
}
