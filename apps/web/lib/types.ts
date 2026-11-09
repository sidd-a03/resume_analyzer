import type { CreditPack } from "@/constants/pricing"
import type { Severity } from "@/constants/sample-data"

export type AnalysisType = "preview" | "full" | "job_match"
export type AnalysisStatus = "queued" | "running" | "succeeded" | "failed"

export interface Resume {
  id: string
  fileName: string
  sizeBytes: number
  pages: number
  createdAt: string
}

export interface AnalysisSummary {
  id: string
  resumeId: string
  fileName: string
  type: AnalysisType
  status: AnalysisStatus
  score: number | null
  createdAt: string
}

export interface ReportIssue {
  title: string
  detail: string
  severity: Severity
}

export interface SectionFeedback {
  name: string
  status: "Strong" | "Good" | "Needs work"
  feedback: string
  suggestions: string[]
}

export interface JobMatch {
  jobTitle: string
  match: number
  missing: string[]
  suggestions: string[]
}

export interface FullReport {
  kind: "full"
  score: number
  scoreLabel: string
  issues: ReportIssue[]
  sections: SectionFeedback[]
  keywords: { found: string[]; missing: string[] }
  rewrites: { before: string; after: string }[]
  jobMatch: JobMatch | null
}

/** What a free preview returns. The locked parts are only counts, never the content. */
export interface PreviewReport {
  kind: "preview"
  score: number
  scoreLabel: string
  issues: ReportIssue[]
  locked: { issues: number; sections: number; rewrites: number; keywords: number }
}

export type AnalysisDetail = AnalysisSummary & {
  /** 0-2 while running: reading, checking sections, writing suggestions */
  progressStep: number
  refunded: boolean
  report: FullReport | PreviewReport | null
}

export type LedgerReason = "welcome" | "purchase" | "analysis" | "unlock" | "refund" | "grant" | "revoke"

export interface LedgerEntry {
  id: string
  createdAt: string
  reason: LedgerReason
  delta: number
  analysisId: string | null
}

export interface Payment {
  id: string
  packId: CreditPack["id"]
  credits: number
  status: "pending" | "paid" | "failed"
}

export interface Onboarding {
  uploaded: boolean
  welcomeClaimed: boolean
  triedJobMatch: boolean
}

export type AbuseKind = "phone" | "ip" | "resume_hash" | "payment_card"

export interface AbuseSignal {
  id: string
  kind: AbuseKind
  value: string
  count: number
  users: { id: string; email: string }[]
  lastSeenAt: string
}

/** A user as better-auth's admin plugin returns it */
export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: string | null
  banned: boolean | null
  banReason: string | null
  banExpires: string | null
  phoneNumber: string | null
  phoneNumberVerified: boolean | null
  createdAt: string
}

/** An analysis as the admin panel lists it, across every user */
export type AdminAnalysis = AnalysisSummary & { user: { id: string; email: string } }

export type AdminLedgerEntry = LedgerEntry & {
  user: { id: string; email: string }
  /** Set for manual grants and revokes */
  by: string | null
  note: string | null
}

export type AuditAction =
  | "user.ban"
  | "user.unban"
  | "user.set_role"
  | "user.impersonate"
  | "user.delete"
  | "session.revoke"
  | "credits.grant"
  | "credits.revoke"
  | "analysis.delete"

export interface AuditEntry {
  id: string
  createdAt: string
  actor: { id: string; email: string; role: string }
  action: AuditAction
  target: string
  detail: string | null
}
