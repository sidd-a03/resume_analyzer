import { toAnalysisDetail, type ApiAnalysis, type ApiHistoryPage } from "@/lib/analysis-api"
import { apiRequest } from "@/lib/api"
import { historyApiPath, toHistoryPage, type HistoryPage, type HistoryParams } from "@/lib/history"
import type { AnalysisDetail } from "@/lib/types"

export async function getAnalysis(id: string): Promise<AnalysisDetail | null> {
  const res = await apiRequest<ApiAnalysis>(`/analyses/${encodeURIComponent(id)}`)

  if (res.ok) return toAnalysisDetail(res.data)

  if (res.status === 400 || res.status === 404) return null

  throw new Error(`Loading analysis failed (${res.status}): ${res.message}`)
}

export async function listAnalyses(params: HistoryParams): Promise<HistoryPage> {
  const res = await apiRequest<ApiHistoryPage>(historyApiPath(params))

  if (res.ok) return toHistoryPage(res.data)

  throw new Error(`Loading history failed (${res.status}): ${res.message}`)
}
