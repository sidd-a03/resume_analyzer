import { JOB_DESCRIPTION, JOB_TITLE, RESUME_UPLOAD, type AnalysisCosts } from "@repo/validation"
import type { AnalysisStatus, AnalysisType, LedgerReason } from "@/lib/types"

export const resumeLimits = {
  maxBytes: RESUME_UPLOAD.maxBytes,
  maxMegabytes: RESUME_UPLOAD.maxBytes / (1024 * 1024),
  maxPages: RESUME_UPLOAD.maxPages,
} as const

export const jobDescriptionLimits = { 
  min: JOB_DESCRIPTION.minChars, 
  max: JOB_DESCRIPTION.maxChars 
} as const

export const jobTitleLimits = { 
  min: JOB_TITLE.minChars, 
  max: JOB_TITLE.maxChars 
} as const


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

export const failureMessages: Record<string, string> = {
  TEXT_EXPIRED: "We no longer keep the text of this resume. Upload it again to analyze it.",
  AI_NOT_CONFIGURED: "Analyses are switched off right now. Try again later.",
  AI_UNAVAILABLE: "Our AI provider didn't respond. It's usually back within minutes, so try again shortly.",
  default: "Something went wrong while reading your resume.",
}

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


export function costOf(type: AnalysisType, costs: AnalysisCosts) {
  if (type === "full") return costs.fullAnalysis
  if (type === "job_match") return costs.jobMatch
  return 0
}
