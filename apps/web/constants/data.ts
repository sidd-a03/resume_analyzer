// Sample data for the signed-in pages until the API endpoints exist.
// TODO: serve actual data from the backend and delete this file.

import { sampleIssues, sampleJobMatch, sampleKeywords, sampleRewrite } from "@/constants/sample-data"
import type {
  AbuseSignal,
  AdminAnalysis,
  AdminLedgerEntry,
  AnalysisDetail,
  AnalysisSummary,
  AuditEntry,
  FullReport,
  LedgerEntry,
  Onboarding,
  Payment,
  PreviewReport,
  ReportIssue,
  Resume,
} from "@/lib/types"


export const onboarding: Omit<Onboarding, "welcomeClaimed"> = {
  uploaded: true,
  triedJobMatch: true,
}

const issues: ReportIssue[] = [
  {
    ...sampleIssues[0]!,
    detail: "Recruiters skim for outcomes. Lead each bullet with what changed because of your work, with a number if you have one.",
  },
  {
    ...sampleIssues[1]!,
    detail: "Your projects use Next.js and Jest, but your skills list doesn't mention them, so keyword filters miss them.",
  },
  {
    ...sampleIssues[2]!,
    detail: "A long summary pushes your projects below the fold. Two or three lines about your focus is enough.",
  },
  {
    title: "No links to your projects or GitHub",
    detail: "Add a short link next to each project so reviewers can check your work in one click.",
    severity: "medium",
  },
  {
    title: "Dates use three different formats",
    detail: 'Pick one format, for example "Jun 2025 - Present", and use it everywhere.',
    severity: "low",
  },
]

const fullReport: FullReport = {
  kind: "full",
  score: 82,
  scoreLabel: "Strong start",
  issues,
  sections: [
    {
      name: "Summary",
      status: "Needs work",
      feedback: "Five lines that mostly repeat your skills list.",
      suggestions: ["Cut it to two lines: your focus and what you're looking for.", 'Drop phrases like "hard-working team player".'],
    },
    {
      name: "Experience",
      status: "Good",
      feedback: "Relevant internship, but the bullets describe duties instead of results.",
      suggestions: ["Start each bullet with a strong verb.", "Add one number per bullet where you can: users, time saved, size."],
    },
    {
      name: "Projects",
      status: "Strong",
      feedback: "Your strongest section. The fest website and the expense tracker show real, shipped work.",
      suggestions: ["Move this section above Experience while you're a fresher."],
    },
    {
      name: "Skills",
      status: "Needs work",
      feedback: "Missing tools you clearly used in your projects.",
      suggestions: ["Add Next.js, Jest and GitHub Actions.", "Group skills: Languages, Frameworks, Tools."],
    },
    {
      name: "Education",
      status: "Good",
      feedback: "Clear and complete.",
      suggestions: ["Leave out your Class 10 marks once you have a degree listed."],
    },
    {
      name: "Formatting",
      status: "Strong",
      feedback: "Single column, readable fonts, no tables or images. Easy for ATS software to parse.",
      suggestions: [],
    },
  ],
  keywords: sampleKeywords,
  rewrites: [
    sampleRewrite,
    {
      before: "Responsible for making the expense tracker app.",
      after: "Built an expense tracker in React and Firebase used by 120+ classmates, with monthly charts and CSV export.",
    },
    {
      before: "Helped the team with testing during the internship.",
      after: "Wrote 40 Jest unit tests for the checkout flow during my internship, raising coverage from 52% to 81%.",
    },
  ],
  jobMatch: null,
}

const jobMatchReport: FullReport = {
  ...fullReport,
  jobMatch: {
    jobTitle: sampleJobMatch.jobTitle,
    match: sampleJobMatch.match,
    missing: sampleJobMatch.missing,
    suggestions: [
      sampleJobMatch.suggestion,
      "Mention accessibility work explicitly, for example the keyboard navigation you added to the fest site.",
    ],
  },
}

// The API must strip locked content like this, so it never reaches the browser
const previewReport: PreviewReport = {
  kind: "preview",
  score: 71,
  scoreLabel: "Good start",
  issues: issues.slice(0, 3),
  locked: { issues: 2, sections: 6, rewrites: 3, keywords: 11 },
}

export const resumes: Resume[] = [
  { id: "resume-1", fileName: "riya-kapoor-resume.pdf", sizeBytes: 182_000, pages: 1, createdAt: "2026-10-30T11:04:00.000Z" },
  { id: "resume-2", fileName: "resume-scan-final.pdf", sizeBytes: 2_400_000, pages: 2, createdAt: "2026-10-29T09:39:00.000Z" },
  { id: "resume-3", fileName: "resume-old.pdf", sizeBytes: 96_000, pages: 1, createdAt: "2026-10-27T18:11:00.000Z" },
]

export const analyses: AnalysisSummary[] = [
  {
    id: "sample-job-match",
    resumeId: "resume-1",
    fileName: "riya-kapoor-resume.pdf",
    type: "job_match",
    status: "succeeded",
    score: 82,
    createdAt: "2026-10-31T15:20:00.000Z",
  },
  {
    id: "sample-full",
    resumeId: "resume-1",
    fileName: "riya-kapoor-resume.pdf",
    type: "full",
    status: "succeeded",
    score: 82,
    createdAt: "2026-10-30T11:05:00.000Z",
  },
  {
    id: "sample-failed",
    resumeId: "resume-2",
    fileName: "resume-scan-final.pdf",
    type: "full",
    status: "failed",
    score: null,
    createdAt: "2026-10-29T09:40:00.000Z",
  },
  {
    id: "sample-preview",
    resumeId: "resume-3",
    fileName: "resume-old.pdf",
    type: "preview",
    status: "succeeded",
    score: 71,
    createdAt: "2026-10-27T18:12:00.000Z",
  },
]

const summary = (id: string) => analyses.find((a) => a.id === id)!

export const analysisDetails: Record<string, AnalysisDetail> = {
  "sample-job-match": { ...summary("sample-job-match"), progressStep: 2, refunded: false, report: jobMatchReport },
  "sample-full": { ...summary("sample-full"), progressStep: 2, refunded: false, report: fullReport },
  "sample-failed": { ...summary("sample-failed"), progressStep: 2, refunded: true, report: null },
  "sample-preview": { ...summary("sample-preview"), progressStep: 2, refunded: false, report: previewReport },
  // Not in the list above, so nothing polls it. Open /analyses/sample-running to see the progress state.
  "sample-running": {
    id: "sample-running",
    resumeId: "resume-1",
    fileName: "riya-kapoor-resume.pdf",
    type: "full",
    status: "running",
    score: null,
    createdAt: "2026-11-01T08:00:00.000Z",
    progressStep: 1,
    refunded: false,
    report: null,
  },
}

export const ledger: LedgerEntry[] = [
  { id: "l5", createdAt: "2026-10-31T15:20:00.000Z", reason: "analysis", delta: -2, analysisId: "sample-job-match" },
  { id: "l4", createdAt: "2026-10-30T11:05:00.000Z", reason: "analysis", delta: -1, analysisId: "sample-full" },
  { id: "l3", createdAt: "2026-10-29T09:41:00.000Z", reason: "refund", delta: 1, analysisId: "sample-failed" },
  { id: "l2", createdAt: "2026-10-29T09:40:00.000Z", reason: "analysis", delta: -1, analysisId: "sample-failed" },
  { id: "l1", createdAt: "2026-10-28T10:00:00.000Z", reason: "purchase", delta: 5, analysisId: null },
]

// Open /credits?payment=<id> to see each checkout state
export const payments: Payment[] = [
  { id: "sample-pending", packId: "standard", credits: 15, status: "pending" },
  { id: "sample-failed", packId: "standard", credits: 15, status: "failed" },
]

export const abuseSignals: AbuseSignal[] = [
  {
    id: "sig_1",
    kind: "phone",
    value: "+91 98•••••210",
    count: 4,
    users: [
      { id: "usr_a1", email: "test.one@example.com" },
      { id: "usr_a2", email: "test.two@example.com" },
    ],
    lastSeenAt: "2026-10-30T09:12:00.000Z",
  },
  {
    id: "sig_2",
    kind: "ip",
    value: "203.0.113.24",
    count: 9,
    users: [
      { id: "usr_b1", email: "fresher.demo@example.com" },
      { id: "usr_b2", email: "another.demo@example.com" },
      { id: "usr_b3", email: "third.demo@example.com" },
    ],
    lastSeenAt: "2026-10-31T17:40:00.000Z",
  },
  {
    id: "sig_3",
    kind: "resume_hash",
    value: "9f2c…a71e",
    count: 3,
    users: [{ id: "usr_c1", email: "same.resume@example.com" }],
    lastSeenAt: "2026-10-29T12:05:00.000Z",
  },
]

// Admin panel samples. Users themselves come from better-auth; these tables need backend endpoints.

const riya = { id: "usr_riya", email: "riya.kapoor@example.com" }
const arjun = { id: "usr_arjun", email: "arjun.mehta@example.com" }
const sneha = { id: "usr_sneha", email: "sneha.iyer@example.com" }
const demo = { id: "usr_b1", email: "fresher.demo@example.com" }

export const adminAnalyses: AdminAnalysis[] = [
  ...analyses.map((a) => ({ ...a, user: riya })),
  { id: "adm-1", resumeId: "r-a1", fileName: "arjun_mehta_cv.pdf", type: "job_match", status: "succeeded", score: 76, createdAt: "2026-10-31T10:02:00.000Z", user: arjun },
  { id: "adm-2", resumeId: "r-a1", fileName: "arjun_mehta_cv.pdf", type: "preview", status: "succeeded", score: 64, createdAt: "2026-10-30T19:45:00.000Z", user: arjun },
  { id: "adm-3", resumeId: "r-s1", fileName: "Sneha Iyer Resume 2026.pdf", type: "full", status: "running", score: null, createdAt: "2026-11-01T07:58:00.000Z", user: sneha },
  { id: "adm-4", resumeId: "r-s1", fileName: "Sneha Iyer Resume 2026.pdf", type: "preview", status: "succeeded", score: 58, createdAt: "2026-10-28T13:20:00.000Z", user: sneha },
  { id: "adm-5", resumeId: "r-d1", fileName: "resume.pdf", type: "preview", status: "succeeded", score: 41, createdAt: "2026-10-31T17:41:00.000Z", user: demo },
  { id: "adm-6", resumeId: "r-d1", fileName: "resume.pdf", type: "preview", status: "failed", score: null, createdAt: "2026-10-31T17:39:00.000Z", user: demo },
  { id: "adm-7", resumeId: "r-a2", fileName: "arjun_mehta_cv_v2.pdf", type: "full", status: "queued", score: null, createdAt: "2026-11-01T08:04:00.000Z", user: arjun },
]

export const adminLedger: AdminLedgerEntry[] = [
  { id: "al-9", createdAt: "2026-11-01T07:58:00.000Z", reason: "analysis", delta: -1, analysisId: "adm-3", user: sneha, by: null, note: null },
  { id: "al-8", createdAt: "2026-10-31T18:02:00.000Z", reason: "revoke", delta: -3, analysisId: null, user: demo, by: "you@resumelens.app", note: "Duplicate accounts on one IP" },
  { id: "al-7", createdAt: "2026-10-31T10:02:00.000Z", reason: "analysis", delta: -2, analysisId: "adm-1", user: arjun, by: null, note: null },
  { id: "al-6", createdAt: "2026-10-30T14:30:00.000Z", reason: "grant", delta: 5, analysisId: null, user: sneha, by: "you@resumelens.app", note: "Refund for a stuck analysis" },
  { id: "al-5", createdAt: "2026-10-30T09:15:00.000Z", reason: "purchase", delta: 15, analysisId: null, user: arjun, by: null, note: null },
  ...ledger.map((entry) => ({ ...entry, user: riya, by: null, note: null })),
  { id: "al-1", createdAt: "2026-10-27T12:00:00.000Z", reason: "welcome", delta: 1, analysisId: null, user: demo, by: null, note: null },
]

export const auditLog: AuditEntry[] = [
  { id: "au-6", createdAt: "2026-11-01T06:40:00.000Z", actor: { id: "usr_root", email: "you@resumelens.app", role: "superadmin" }, action: "user.set_role", target: "arjun.mehta@example.com", detail: "User → Admin" },
  { id: "au-5", createdAt: "2026-10-31T18:05:00.000Z", actor: { id: "usr_mod", email: "moderator@resumelens.app", role: "admin" }, action: "user.ban", target: "fresher.demo@example.com", detail: "7 days · Duplicate accounts" },
  { id: "au-4", createdAt: "2026-10-31T18:02:00.000Z", actor: { id: "usr_root", email: "you@resumelens.app", role: "superadmin" }, action: "credits.revoke", target: "fresher.demo@example.com", detail: "−3 credits" },
  { id: "au-3", createdAt: "2026-10-30T14:30:00.000Z", actor: { id: "usr_root", email: "you@resumelens.app", role: "superadmin" }, action: "credits.grant", target: "sneha.iyer@example.com", detail: "+5 credits · Refund for a stuck analysis" },
  { id: "au-2", createdAt: "2026-10-30T11:12:00.000Z", actor: { id: "usr_mod", email: "moderator@resumelens.app", role: "admin" }, action: "session.revoke", target: "another.demo@example.com", detail: "All sessions" },
  { id: "au-1", createdAt: "2026-10-29T16:00:00.000Z", actor: { id: "usr_root", email: "you@resumelens.app", role: "superadmin" }, action: "user.impersonate", target: "riya.kapoor@example.com", detail: "Checked a broken report" },
]

/** Per-user credit balances for the user page */
export const userCreditBalances: Record<string, number> = { [riya.id]: 3, [arjun.id]: 13, [sneha.id]: 4, [demo.id]: 0 }
