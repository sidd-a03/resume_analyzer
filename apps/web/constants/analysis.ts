import type { AnalysisCosts } from "@repo/validation"
import type { AnalysisStatus, AnalysisType, LedgerReason } from "@/lib/types"

export const resumeLimits = {
  maxBytes: 5 * 1024 * 1024,
  maxPages: 3,
} as const

export const jobDescriptionLimits = { min: 80, max: 6000 } as const


export const analysisTypes: Record<AnalysisType, { label: string; description: string }> = {
  preview: { label: "Free preview", description: "Score and top 3 issues." },
  full: {
    label: "Full analysis",
    description: "Every issue, section feedback, keyword gaps and bullet rewrites.",
  },
  job_match: {
    label: "Full + job match",
    description: "Everything in full, plus how well you fit a job description you paste.",
  },
}

export const analysisStatuses: Record<AnalysisStatus, string> = {
  queued: "Queued",
  running: "Analyzing",
  succeeded: "Ready",
  failed: "Failed",
}

export const progressMessages = ["Reading your resume…", "Checking sections…", "Writing suggestions…"] as const

export const ledgerReasons: Record<LedgerReason, string> = {
  welcome: "Welcome credit",
  purchase: "Purchase",
  analysis: "Analysis",
  unlock: "Unlocked full analysis",
  refund: "Refund",
  grant: "Granted by admin",
  revoke: "Revoked by admin",
}

export const pluralCredits = (n: number) => `${n} credit${Math.abs(n) === 1 ? "" : "s"}`

/** What an analysis type costs, in credits, from the current pricing */
export function costOf(type: AnalysisType, costs: AnalysisCosts) {
  if (type === "full") return costs.fullAnalysis
  if (type === "job_match") return costs.jobMatch
  return 0
}
