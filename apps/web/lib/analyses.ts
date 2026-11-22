import { toAnalysisDetail, type ApiAnalysis } from "@/lib/analysis-api"
import { apiRequest } from "@/lib/api"
import type { AnalysisDetail } from "@/lib/types"

export async function getAnalysis(id: string): Promise<AnalysisDetail | null> {
  const res = await apiRequest<ApiAnalysis>(`/analyses/${encodeURIComponent(id)}`)

  if (res.ok) return toAnalysisDetail(res.data)

  if (res.status === 400 || res.status === 404) return null

  throw new Error(`Loading analysis failed (${res.status}): ${res.message}`)
}
