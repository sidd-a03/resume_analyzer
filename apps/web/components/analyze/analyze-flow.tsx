"use client"

import { Info, Loader2, Sparkles } from "lucide-react"
import { useState, useTransition, type ReactNode } from "react"
import { toast } from "sonner"

import { Dropzone, type AcceptedResume } from "@/components/analyze/dropzone"
import { InsufficientCreditsDialog, type CreditShortfall } from "@/components/shared/insufficient-credits-dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { analysisTypes, jobDescriptionLimits, pluralCredits } from "@/constants/analysis"
import { startAnalysis } from "@/lib/actions/analysis"
import type { AnalysisType } from "@/lib/types"
import { cn } from "@/lib/utils"

function Step({
  index,
  title,
  disabled = false,
  children,
}: {
  index: number
  title: string
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <li className={cn("relative flex gap-4 pb-10 last:pb-0", disabled && "opacity-50")}>
      {/* the line joining the step numbers */}
      <span aria-hidden="true" className="absolute top-9 bottom-1 left-4 w-px bg-border in-[li:last-child]:hidden" />
      <span className="relative grid size-8 shrink-0 place-items-center rounded-full border bg-background font-mono text-sm">
        {index}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </li>
  )
}

const typeOrder: AnalysisType[] = ["preview", "full", "job_match"]

export function AnalyzeFlow({
  balance,
  initialResume,
  initialType,
}: {
  balance: number
  initialResume: AcceptedResume | null
  initialType: AnalysisType
}) {
  const [accepted, setAccepted] = useState(initialResume)
  const [type, setType] = useState<AnalysisType>(initialType)
  const [jobDescription, setJobDescription] = useState("")
  const [shortfall, setShortfall] = useState<CreditShortfall | null>(null)
  const [pending, startTransition] = useTransition()

  const alreadyAnalyzed = type !== "job_match" && accepted?.analyzedTypes.includes(type)
  const cost = alreadyAnalyzed ? 0 : analysisTypes[type].cost
  const jdLength = jobDescription.trim().length
  const jdValid = type !== "job_match" || (jdLength >= jobDescriptionLimits.min && jdLength <= jobDescriptionLimits.max)
  const canAnalyze = accepted !== null && jdValid && !pending

  function analyze() {
    if (!accepted) return
    if (cost > balance) {
      setShortfall({ balance, cost })
      return
    }
    startTransition(async () => {
      // Redirects to the analysis page on success, so a result means it didn't start
      const result = await startAnalysis({ resumeId: accepted.resume.id, type, jobDescription })
      if (result.code === "insufficient_credits") setShortfall({ balance: result.balance, cost: result.cost })
      else toast.error(result.message)
    })
  }

  return (
    <>
      <ol className="mt-10 max-w-3xl">
        <Step index={1} title="Upload your resume">
          <Dropzone accepted={accepted} onAccepted={setAccepted} onRemove={() => setAccepted(null)} />
        </Step>

        <Step index={2} title="Choose an analysis" disabled={!accepted}>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as AnalysisType)}
            disabled={!accepted}
            aria-label="Analysis type"
            className="gap-3 md:grid-cols-3"
          >
            {typeOrder.map((option) => {
              const meta = analysisTypes[option]
              return (
                <Label
                  key={option}
                  className={cn(
                    "flex cursor-pointer flex-col items-start gap-3 rounded-xl border bg-card p-4 font-normal transition-colors hover:border-foreground/25",
                    "has-data-checked:border-foreground has-data-checked:shadow-paper",
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <RadioGroupItem value={option} />
                    <span className="font-mono text-xs text-muted-foreground">
                      {meta.cost === 0 ? "Free" : pluralCredits(meta.cost)}
                    </span>
                  </div>
                  <span className="font-semibold">{meta.label}</span>
                  <span className="text-sm leading-snug text-muted-foreground">{meta.description}</span>
                </Label>
              )
            })}
          </RadioGroup>

          {type === "job_match" && accepted && (
            <div className="mt-5">
              <Label htmlFor="jd" className="font-medium">
                Job description
              </Label>
              <Textarea
                id="jd"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                maxLength={jobDescriptionLimits.max}
                placeholder="Paste the full job description, including requirements and responsibilities."
                aria-describedby="jd-count"
                className="mt-2 min-h-40 bg-card"
              />
              <p id="jd-count" className="mt-1.5 flex justify-between font-mono text-xs text-muted-foreground">
                <span>{jdLength < jobDescriptionLimits.min ? `At least ${jobDescriptionLimits.min} characters` : "Looks good"}</span>
                <span>
                  {jobDescription.length}/{jobDescriptionLimits.max}
                </span>
              </p>
            </div>
          )}
        </Step>

        <Step index={3} title="Confirm" disabled={!accepted}>
          {alreadyAnalyzed && (
            <p className="mb-4 flex items-start gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm">
              <Info className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
              We already have this analysis, so it&apos;s free.
            </p>
          )}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              This will use <strong className="font-mono">{pluralCredits(cost)}</strong>.{" "}
              <span className="text-muted-foreground">
                Balance after: <span className="font-mono">{Math.max(0, balance - cost)}</span>
              </span>
            </p>
            <Button size="lg" onClick={analyze} disabled={!canAnalyze} className="h-11 px-6">
              {pending ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Analyze
            </Button>
          </div>
        </Step>
      </ol>

      <InsufficientCreditsDialog shortfall={shortfall} onClose={() => setShortfall(null)} />
    </>
  )
}
