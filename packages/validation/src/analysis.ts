import { z } from "zod";

export const ANALYSIS_TYPES = ["PREVIEW", "FULL", "JOB_MATCH"] as const;
export type AnalysisTypeName = (typeof ANALYSIS_TYPES)[number];

export const FREE_PREVIEWS_PER_DAY = 3;

export const JOB_DESCRIPTION = { 
    minChars: 100, 
    maxChars: 8000 
} as const;

export const JOB_TITLE = {
    minChars: 2,
    maxChars: 120,
} as const;

export const startAnalysisSchema = z
    .object({
        resumeId: z.uuid(),
        type: z.enum(ANALYSIS_TYPES),
        jobTitle: z.string().trim().min(JOB_TITLE.minChars).max(JOB_TITLE.maxChars).optional(),
        jobDescription: z.string().trim().min(JOB_DESCRIPTION.minChars).max(JOB_DESCRIPTION.maxChars).optional(),
    })
    .refine((v) => v.type !== "JOB_MATCH" || v.jobDescription, {
        message: "A job description is required for a job match",
        path: ["jobDescription"],
    })
    .refine((v) => v.type === "JOB_MATCH" || !v.jobDescription, {
        message: "Only job matches take a job description",
        path: ["jobDescription"],
    });

export type StartAnalysisInput = z.infer<typeof startAnalysisSchema>;

export const ANALYSIS_STATUSES = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED"] as const;
export type AnalysisStatusName = (typeof ANALYSIS_STATUSES)[number];

export const HISTORY_PAGE_SIZE = { 
    default: 10, 
    max: 50 
} as const;

export const HISTORY_SEARCH_MAX_CHARS = 100;
export const HISTORY_SORTS = ["createdAt", "score", "fileName"] as const;
export type HistorySort = (typeof HISTORY_SORTS)[number];

export const historyQuerySchema = z.object({
    page: z.coerce.number().int().min(1).max(10_000).default(1),
    pageSize: z.coerce.number().int().min(1).max(HISTORY_PAGE_SIZE.max).default(HISTORY_PAGE_SIZE.default),
    type: z.enum(ANALYSIS_TYPES).optional(),
    status: z.enum(ANALYSIS_STATUSES).optional(),
    search: z
        .string()
        .trim()
        .max(HISTORY_SEARCH_MAX_CHARS)
        .optional()
        .transform((v) => v || undefined),
    sort: z.enum(HISTORY_SORTS).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
});

export type HistoryQuery = z.infer<typeof historyQuerySchema>;

export const REPORT_LIMITS = {
    previewIssues: 3,
    issues: 12,
    sections: 10,
    suggestionsPerSection: 5,
    keywords: 30,
    rewrites: 8,
    jobMissing: 20,
    jobSuggestions: 6,
} as const;

const issue = z.object({
    title: z.string().describe("Short name of the problem, under 10 words, e.g. 'Bullets lack numbers'"),
    detail: z.string().describe("What is wrong and how to fix it, specific to this resume, 1-3 sentences"),
    severity: z.enum(["high", "medium", "low"]),
});

const score = z.number().describe("Overall resume quality, an integer from 0 to 100");
const count = (what: string) => z.number().describe(`${what}, an integer of 0 or more`);

export const previewResultSchema = z.object({
    score,
    issues: z.array(issue).describe(`The ${REPORT_LIMITS.previewIssues} most important problems, most severe first`),
    counts: z
        .object({
            issues: count("How many problems a full review would list in total"),
            sections: count("How many resume sections a full review would comment on"),
            rewrites: count("How many bullets would benefit from a rewrite"),
            missingKeywords: count("How many relevant keywords are missing"),
        })
        .describe("Sizes of what the paid full review would contain"),
});

export const fullResultSchema = z.object({
    score,
    issues: z.array(issue).describe(`Up to ${REPORT_LIMITS.issues} problems, most severe first`),
    sections: z
        .array(
            z.object({
                name: z.string().describe("Resume section as written, e.g. 'Experience'"),
                status: z.enum(["Strong", "Good", "Needs work"]),
                feedback: z.string().describe("1-3 sentences"),
                suggestions: z.array(z.string()).describe(`Up to ${REPORT_LIMITS.suggestionsPerSection} concrete changes`),
            }),
        )
        .describe(`One entry per section in the resume, up to ${REPORT_LIMITS.sections}`),
    keywords: z.object({
        found: z.array(z.string()).describe(`Relevant skills and terms already present, up to ${REPORT_LIMITS.keywords}`),
        missing: z
            .array(z.string())
            .describe(`Relevant terms the resume should mention if true for the candidate, up to ${REPORT_LIMITS.keywords}`),
    }),
    rewrites: z
        .array(
            z.object({
                before: z.string().describe("A bullet copied exactly from the resume"),
                after: z.string().describe("The improved bullet. Never invent facts, numbers or experience"),
            }),
        )
        .describe(`Up to ${REPORT_LIMITS.rewrites} of the weakest bullets`),
    jobMatch: z
        .object({
            match: z.number().describe("How well the resume fits the job description, an integer from 0 to 100"),
            missing: z.array(z.string()).describe(`Requirements from the job description the resume doesn't show, up to ${REPORT_LIMITS.jobMissing}`),
            suggestions: z.array(z.string()).describe(`Up to ${REPORT_LIMITS.jobSuggestions} ways to close the gap`),
        })
        .nullable()
        .describe("Only for job matches; null otherwise"),
});

export type PreviewResult = z.infer<typeof previewResultSchema>;
export type FullResult = z.infer<typeof fullResultSchema>;

/** Shown next to the score. Same thresholds as the web's score colours (75 / 50) */
export function scoreLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Strong start";
    if (score >= 50) return "Good start";
    return "Needs work";
}
