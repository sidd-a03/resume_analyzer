import type { AnalysisTypeName } from "@repo/validation"

import type { AnalysisDetail, AnalysisStatus, AnalysisSummary, AnalysisType, FullReport, PreviewReport } from "@/lib/types"

export type ApiAnalysis = Omit<AnalysisDetail, "type" | "status"> & {
  type: AnalysisTypeName
  status: Uppercase<AnalysisStatus>
  completedAt: string | null
  report: FullReport | PreviewReport | null
}


export type ApiStartedAnalysis = Pick<ApiAnalysis, "id" | "resumeId" | "type" | "status" | "creditsSpent" | "createdAt"> & {
  reused: boolean
}

export type ApiAnalysisListItem = Pick<ApiAnalysis, "id" | "resumeId" | "fileName" | "type" | "status" | "score" | "createdAt">

export type ApiHistoryPage = { items: ApiAnalysisListItem[]; total: number; page: number; pageSize: number }

export type UploadedResume = {
  id: string
  fileName: string
  sizeBytes: number
  pages: number
  expiresAt: string
  createdAt: string
}

export const toApiAnalysisType = (type: AnalysisType) => type.toUpperCase() as AnalysisTypeName

export function toAnalysisSummary(a: ApiAnalysisListItem): AnalysisSummary {
  return {
    id: a.id,
    resumeId: a.resumeId,
    fileName: a.fileName,
    type: a.type.toLowerCase() as AnalysisType,
    status: a.status.toLowerCase() as AnalysisStatus,
    score: a.score,
    createdAt: a.createdAt,
  }
}

export function toAnalysisDetail(a: ApiAnalysis): AnalysisDetail {
  return {
    id: a.id,
    resumeId: a.resumeId,
    fileName: a.fileName,
    type: a.type.toLowerCase() as AnalysisType,
    status: a.status.toLowerCase() as AnalysisStatus,
    score: a.score,
    createdAt: a.createdAt,
    progressStep: a.progressStep,
    refunded: a.refunded,
    error: a.error,
    jobTitle: a.jobTitle,
    creditsSpent: a.creditsSpent,
    report: a.report,
  }
}

export const isFinished = (status: AnalysisStatus) => status === "succeeded" || status === "failed"