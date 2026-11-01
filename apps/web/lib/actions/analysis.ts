"use server"

import { redirect } from "next/navigation"

import { jobDescriptionLimits, resumeLimits } from "@/constants/analysis"
import type { AnalysisType, Resume } from "@/lib/types"
import { requireUser } from "@/lib/session"

export type RejectReason = "not_pdf" | "too_large" | "empty" | "scanned" | "too_many_pages"

export type UploadResult =
  | { ok: true; resume: Resume; analyzedTypes: AnalysisType[] }
  | { ok: false; reason: RejectReason; message: string }

const reject = (reason: RejectReason, message: string): UploadResult => ({ ok: false, reason, message })

/** Rough page count from the PDF structure. The API should use a real parser for this and for text extraction. */
function countPages(pdf: string) {
  return pdf.match(/\/Type\s*\/Page(?![a-z])/g)?.length ?? 0
}

export async function uploadResume(formData: FormData): Promise<UploadResult> {
  await requireUser()
  const file = formData.get("file")

  if (!(file instanceof File) || file.size === 0) return reject("empty", "That file is empty. Try exporting it again.")
  if (file.size > resumeLimits.maxBytes) return reject("too_large", "That file is over 5 MB. Export a smaller PDF.")

  const pdf = new TextDecoder("latin1").decode(await file.arrayBuffer())
  if (!pdf.startsWith("%PDF-")) return reject("not_pdf", "That isn't a PDF. Upload your resume as a PDF file.")

  const pages = countPages(pdf)
  if (pages > resumeLimits.maxPages) {
    return reject("too_many_pages", `Your PDF has ${pages} pages. Resumes up to ${resumeLimits.maxPages} pages are supported.`)
  }

  // TODO: upload to the backend, which stores the file, rejects scanned PDFs and returns the resume
  // plus the analysis types already done for the same file
  return {
    ok: true,
    resume: { id: crypto.randomUUID(), fileName: file.name, sizeBytes: file.size, pages, createdAt: new Date().toISOString() },
    analyzedTypes: [],
  }
}

export type StartResult =
  | { ok: false; code: "insufficient_credits"; balance: number; cost: number }
  | { ok: false; code: "invalid"; message: string }

const sampleFor: Record<AnalysisType, string> = {
  preview: "sample-preview",
  full: "sample-full",
  job_match: "sample-job-match",
}

export async function startAnalysis(input: {
  resumeId: string
  type: AnalysisType
  jobDescription?: string
}): Promise<StartResult> {
  await requireUser()

  const jobDescription = (input.jobDescription ?? "").trim()
  if (
    input.type === "job_match" &&
    (jobDescription.length < jobDescriptionLimits.min || jobDescription.length > jobDescriptionLimits.max)
  ) {
    return {
      ok: false,
      code: "invalid",
      message: `Paste a job description between ${jobDescriptionLimits.min} and ${jobDescriptionLimits.max} characters.`,
    }
  }

  // TODO: ask the backend to start the analysis. It charges credits (or returns insufficient_credits),
  // and returns the existing analysis for free when the same resume was already analyzed.
  redirect(`/analyses/${sampleFor[input.type]}`)
}

export async function unlockAnalysis(id: string): Promise<StartResult | { ok: true }> {
  await requireUser()
  // TODO: ask the backend to unlock the full analysis for 1 credit, then refresh() instead of redirecting
  redirect(`/analyses/${id === sampleFor.preview ? sampleFor.full : id}`)
}

export async function deleteAnalysis(_id: string, from: "list" | "detail") {
  await requireUser()
  // TODO: delete the analysis in the backend, then refresh()
  if (from === "detail") redirect("/history")
}
