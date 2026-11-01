"use client"

import { CircleAlert, FileText, Loader2, Upload, X } from "lucide-react"
import { useEffect, useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { resumeLimits } from "@/constants/analysis"
import { uploadResume } from "@/lib/actions/analysis"
import type { AnalysisType, Resume } from "@/lib/types"
import { formatBytes } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface AcceptedResume {
  resume: Resume
  analyzedTypes: AnalysisType[]
}

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string; validating: boolean }
  | { kind: "rejected"; title: string; message: string }

const rejectTitles = {
  not_pdf: "Not a PDF",
  too_large: "File too large",
  empty: "Empty file",
  scanned: "No readable text",
  too_many_pages: "Too many pages",
} as const

/** Checks that need no upload, so the common mistakes fail instantly. */
function quickCheck(file: File): Phase | null {
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!looksLikePdf) return { kind: "rejected", title: rejectTitles.not_pdf, message: "Upload your resume as a PDF file." }
  if (file.size > resumeLimits.maxBytes) {
    return { kind: "rejected", title: rejectTitles.too_large, message: "That file is over 5 MB. Export a smaller PDF." }
  }
  return null
}

export function Dropzone({
  accepted,
  onAccepted,
  onRemove,
}: {
  accepted: AcceptedResume | null
  onAccepted: (value: AcceptedResume) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [phase, setPhase] = useState<Phase>({ kind: "idle" })
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState(0)
  const uploading = phase.kind === "uploading"

  // Server Actions don't report upload progress, so ease towards 90% until the response lands
  useEffect(() => {
    if (!uploading) return
    const timer = setInterval(() => setProgress((p) => (p < 90 ? p + (90 - p) * 0.15 : p)), 120)
    return () => clearInterval(timer)
  }, [uploading])

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return
    const problem = quickCheck(file)
    if (problem) {
      setPhase(problem)
      return
    }

    setProgress(5)
    setPhase({ kind: "uploading", fileName: file.name, validating: false })
    const validatingTimer = setTimeout(
      () => setPhase((p) => (p.kind === "uploading" ? { ...p, validating: true } : p)),
      700,
    )

    const formData = new FormData()
    formData.set("file", file)
    try {
      const result = await uploadResume(formData)
      if (result.ok) {
        setPhase({ kind: "idle" })
        onAccepted({ resume: result.resume, analyzedTypes: result.analyzedTypes })
      } else {
        setPhase({ kind: "rejected", title: rejectTitles[result.reason], message: result.message })
      }
    } catch {
      setPhase({ kind: "rejected", title: "Upload failed", message: "Check your connection and try again." })
    } finally {
      clearTimeout(validatingTimer)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  if (accepted) {
    const { resume } = accepted
    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-paper">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg border bg-success/10 text-success">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{resume.fileName}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatBytes(resume.sizeBytes)}
            {resume.pages > 0 && ` · ${resume.pages} page${resume.pages === 1 ? "" : "s"}`} · ready
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${resume.fileName}`}>
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        if (!uploading) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
        dragging ? "border-foreground/60 bg-highlight/20" : "bg-card/60",
        phase.kind === "rejected" && !dragging && "border-destructive/40",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />

      {phase.kind === "uploading" ? (
        <div className="flex w-full max-w-xs flex-col items-center gap-3" role="status">
          <Loader2 className="size-7 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="truncate font-medium">{phase.validating ? "Checking your PDF…" : "Uploading…"}</p>
          <p className="max-w-full truncate text-xs text-muted-foreground">{phase.fileName}</p>
          <Progress value={Math.round(progress)} className="w-full" aria-label="Upload progress" />
        </div>
      ) : (
        <>
          <span
            className={cn(
              "grid size-14 place-items-center rounded-xl border bg-background",
              phase.kind === "rejected" && "border-destructive/30 text-destructive",
            )}
          >
            {phase.kind === "rejected" ? <CircleAlert className="size-6" /> : <Upload className="size-6" />}
          </span>

          {phase.kind === "rejected" ? (
            <div role="alert">
              <p className="font-semibold text-destructive">{phase.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{phase.message}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold">{dragging ? "Drop it here" : "Drop your resume here"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Text-based PDF · up to 5 MB · {resumeLimits.maxPages} pages max
              </p>
            </div>
          )}

          <Button variant={phase.kind === "rejected" ? "outline" : "default"} onClick={() => inputRef.current?.click()}>
            {phase.kind === "rejected" ? "Choose another file" : "Choose a PDF"}
          </Button>
        </>
      )}
    </div>
  )
}
