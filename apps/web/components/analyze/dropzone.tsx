"use client"

import { useMutation } from "@tanstack/react-query"
import { CircleAlert, FileText, Loader2, Upload, X } from "lucide-react"
import { useRef, useState, type DragEvent } from "react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { resumeLimits } from "@/constants/analysis"
import { ApiError } from "@/lib/api-client"
import { formatBytes } from "@/lib/format"
import { uploadResume } from "@/lib/queries/analyses"
import { cn } from "@/lib/utils"


export interface AcceptedResume {
  id: string
  fileName: string
  sizeBytes: number | null
  pages: number | null
}

type Phase =
  | { kind: "idle" }
  | { kind: "uploading"; fileName: string; validating: boolean }
  | { kind: "rejected"; title: string; message: string }

const reject = (title: string, message: string): Phase => ({ kind: "rejected", title, message })

const tooLarge = `That file is over ${resumeLimits.maxMegabytes} MB. Export a smaller PDF.`

/** Checks that need no upload, so the common mistakes fail instantly. The API checks everything again. */
function quickCheck(file: File): Phase | null {
  const looksLikePdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  if (!looksLikePdf) return reject("Not a PDF", "Upload your resume as a PDF file.")
  if (file.size === 0) return reject("Empty file", "That file is empty. Try exporting it again.")
  if (file.size > resumeLimits.maxBytes) return reject("File too large", tooLarge)
  return null
}

/** The API's answer as something the user can act on. Its messages are written for people, so most are shown as-is */
function rejection(error: unknown): Phase {
  if (!(error instanceof ApiError)) return reject("Upload failed", "Something went wrong. Try again.")
  switch (error.status) {
    case 400:
      return reject("Not a PDF", error.message)
    case 401:
      return reject("Signed out", "Your session expired. Sign in again, then upload.")
    case 413:
      return reject("File too large", tooLarge)
    case 422: // scanned, password-protected, too many pages or damaged
      return reject("Can't use this PDF", error.message)
    case 429: // another upload still running, or too many in a minute
      return reject("One moment", error.message)
    default:
      return reject("Upload failed", error.message)
  }
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

  const upload = useMutation({
    mutationFn: (file: File) =>
      uploadResume(file, (fraction) => {
        setProgress(5 + fraction * 85)
        if (fraction >= 1) setPhase((p) => (p.kind === "uploading" ? { ...p, validating: true } : p))
      }),
  })

  async function handleFile(file: File | undefined) {
    if (!file || uploading) return
    const problem = quickCheck(file)
    if (problem) {
      setPhase(problem)
      return
    }

    setProgress(5)
    setPhase({ kind: "uploading", fileName: file.name, validating: false })
    try {
      const resume = await upload.mutateAsync(file)
      setPhase({ kind: "idle" })
      onAccepted({ id: resume.id, fileName: resume.fileName, sizeBytes: resume.sizeBytes, pages: resume.pages })
    } catch (error) {
      setPhase(rejection(error))
    } finally {
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  if (accepted) {
    const details = [
      accepted.sizeBytes !== null && formatBytes(accepted.sizeBytes),
      accepted.pages && `${accepted.pages} page${accepted.pages === 1 ? "" : "s"}`,
      "ready",
    ].filter(Boolean)

    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-paper">
        <span className="grid size-12 shrink-0 place-items-center rounded-lg border bg-success/10 text-success">
          <FileText className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{accepted.fileName}</p>
          <p className="font-mono text-xs text-muted-foreground">{details.join(" · ")}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${accepted.fileName}`}>
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
                Text-based PDF · up to {resumeLimits.maxMegabytes} MB · {resumeLimits.maxPages} pages max
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
