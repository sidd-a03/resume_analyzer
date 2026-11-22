"use client"

import { Loader2, Sparkles } from "lucide-react"
import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { startAnalysisSchema, type AnalysisCosts } from "@repo/validation"

import { Dropzone, type AcceptedResume } from "@/components/analyze/dropzone"
import { InsufficientCreditsDialog, type CreditShortfall } from "@/components/shared/insufficient-credits-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { analysisTypes, costOf, jobDescriptionLimits, jobTitleLimits, pluralCredits } from "@/constants/analysis"
import { useStartAnalysis } from "@/hooks/use-start-analysis"
import { toApiAnalysisType } from "@/lib/analysis-api"
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
  costs,
  initialResume,
  initialType,
}: {
  balance: number
  costs: AnalysisCosts
  initialResume: AcceptedResume | null
  initialType: AnalysisType
}) {
  const [accepted, setAccepted] = useState(initialResume)
  const [type, setType] = useState<AnalysisType>(initialType)
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [shortfall, setShortfall] = useState<CreditShortfall | null>(null)
  // An expired or deleted resume can't be analyzed: clear it so the user uploads it again
  const start = useStartAnalysis({ onResumeGone: () => setAccepted(null) })
  // Stays busy after success too, while the analysis page opens
  const pending = start.isPending || start.isSuccess

  const isJobMatch = type === "job_match"
  const cost = costOf(type, costs)
  const jdLength = jobDescription.trim().length
  const jdValid = !isJobMatch || (jdLength >= jobDescriptionLimits.min && jdLength <= jobDescriptionLimits.max)
  const titleLength = jobTitle.trim().length
  const titleValid = !isJobMatch || titleLength === 0 || titleLength >= jobTitleLimits.min
  const canAnalyze = accepted !== null && jdValid && titleValid && !pending

  function analyze() {
    if (!accepted) return
    // Saves a round trip in the common case. The API checks the balance again and has the final say
    if (cost > balance) {
      setShortfall({ balance, cost })
      return
    }
    const input = startAnalysisSchema.safeParse({
      resumeId: accepted.id,
      type: toApiAnalysisType(type),
      ...(isJobMatch && { jobDescription, ...(titleLength > 0 && { jobTitle }) }),
    })
    
    if (!input.success) {
      toast.error(input.error.issues[0]?.message ?? "Check the form and try again.")
      return
    }

    start.mutate(input.data)
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
              const optionCost = costOf(option, costs)
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
                      {optionCost === 0 ? "Free" : pluralCredits(optionCost)}
                    </span>
                  </div>
                  <span className="font-semibold">{meta.label}</span>
                  <span className="text-sm leading-snug text-muted-foreground">{meta.description}</span>
                </Label>
              )
            })}
          </RadioGroup>

          {isJobMatch && accepted && (
            <div className="mt-5">
              <Label htmlFor="job-title" className="font-medium">
                Job title <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="job-title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                maxLength={jobTitleLimits.max}
                placeholder="For example, Frontend Developer"
                aria-invalid={!titleValid}
                className="mt-2 bg-card"
              />
              {!titleValid && (
                <p className="mt-1.5 text-xs text-destructive">At least {jobTitleLimits.min} characters, or leave it empty.</p>
              )}
            </div>
          )}

          {isJobMatch && accepted && (
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
