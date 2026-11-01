import { Lock, Target } from "lucide-react"
import type { ReactNode } from "react"

import { UnlockButton } from "@/components/analysis/unlock-button"
import { BeforeAfter } from "@/components/shared/before-after"
import { KeywordChip } from "@/components/shared/keyword-chip"
import { ScoreRing } from "@/components/shared/score-ring"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { FullReport, JobMatch, PreviewReport, ReportIssue } from "@/lib/types"
import { cn } from "@/lib/utils"

function Panel({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-6", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function ScoreCard({ score, label, issueCount }: { score: number; label: string; issueCount: number }) {
  return (
    <section aria-label="Resume score" className="flex flex-col items-center gap-5 rounded-xl border bg-card p-6 text-center shadow-paper sm:flex-row sm:text-left">
      <ScoreRing score={score} size={128} strokeWidth={11} />
      <div>
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">Your score</p>
        <p className="mt-1 font-heading text-3xl font-semibold">{label}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {issueCount} {issueCount === 1 ? "thing" : "things"} to fix, most important first.
        </p>
      </div>
    </section>
  )
}

function IssueList({ issues }: { issues: ReportIssue[] }) {
  return (
    <ol className="flex flex-col divide-y divide-dashed">
      {issues.map((issue, index) => (
        <li key={issue.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          <span className="pt-0.5 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium">{issue.title}</p>
              <SeverityBadge severity={issue.severity} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{issue.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

const sectionTone = { Strong: "text-success", Good: "text-foreground", "Needs work": "text-warning" } as const

function SectionFeedbackPanel({ sections }: { sections: FullReport["sections"] }) {
  return (
    <Panel title="Section feedback">
      <Accordion className="-my-2">
        {sections.map((section) => (
          <AccordionItem key={section.name} value={section.name}>
            <AccordionTrigger className="cursor-pointer py-4 hover:no-underline">
              <span className="flex flex-1 items-center justify-between gap-4 pr-2">
                <span className="font-medium">{section.name}</span>
                <span className={cn("font-mono text-xs", sectionTone[section.status])}>{section.status}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <p>{section.feedback}</p>
              {section.suggestions.length > 0 && (
                <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 marker:text-pen">
                  {section.suggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Panel>
  )
}

function JobMatchPanel({ jobMatch }: { jobMatch: JobMatch }) {
  return (
    <Panel title="Job match" description={jobMatch.jobTitle}>
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex shrink-0 flex-col items-center gap-2">
          <ScoreRing score={jobMatch.match} size={96} strokeWidth={8} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Target className="size-3.5" aria-hidden="true" />
            match
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <p className="text-sm font-medium">Skills the job asks for that you don&apos;t mention</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {jobMatch.missing.map((k) => (
                <KeywordChip key={k} keyword={k} found={false} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Tailored suggestions</p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground marker:text-pen">
              {jobMatch.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Panel>
  )
}

export function FullReportView({ report }: { report: FullReport }) {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <ScoreCard score={report.score} label={report.scoreLabel} issueCount={report.issues.length} />
        <Panel title="Top issues">
          <IssueList issues={report.issues} />
        </Panel>
        {report.jobMatch && <JobMatchPanel jobMatch={report.jobMatch} />}
      </div>

      <div className="flex flex-col gap-6">
        <SectionFeedbackPanel sections={report.sections} />
        <Panel title="Keyword gaps" description="Found in your resume vs. common for your target role.">
          <div className="flex flex-wrap gap-1.5">
            {report.keywords.found.map((k) => (
              <KeywordChip key={k} keyword={k} found />
            ))}
            {report.keywords.missing.map((k) => (
              <KeywordChip key={k} keyword={k} found={false} />
            ))}
          </div>
        </Panel>
        <Panel title="Bullet rewrites" description="Copy the ones you like and adjust the numbers to match reality.">
          <div className="flex flex-col gap-5">
            {report.rewrites.map((r) => (
              <BeforeAfter key={r.before} before={r.before} after={r.after} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

/** Blurred stand-ins. The real content was never sent, so these are decoration only. */
function LockedCard({ title, count, unit }: { title: string; count: number; unit: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-6">
      <div aria-hidden="true" className="flex flex-col gap-2.5 blur-[3px] select-none">
        <div className="h-3 w-1/3 rounded bg-foreground/20" />
        <div className="h-2.5 w-full rounded bg-foreground/10" />
        <div className="h-2.5 w-5/6 rounded bg-foreground/10" />
        <div className="h-2.5 w-2/3 rounded bg-highlight/70" />
      </div>
      <div className="absolute inset-0 flex items-center gap-3 bg-card/40 px-6">
        <span className="grid size-9 place-items-center rounded-lg border bg-background">
          <Lock className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {count} {unit} locked
          </p>
        </div>
      </div>
    </div>
  )
}

export function PreviewReportView({ report, analysisId }: { report: PreviewReport; analysisId: string }) {
  const { locked } = report
  const totalLocked = locked.issues + locked.sections + locked.rewrites

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-6">
        <ScoreCard score={report.score} label={report.scoreLabel} issueCount={report.issues.length + locked.issues} />
        <Panel title="Top 3 issues">
          <IssueList issues={report.issues} />
        </Panel>
      </div>

      <section aria-labelledby="locked-heading" className="flex flex-col gap-4">
        <div className="rounded-xl border-2 border-dashed border-foreground/20 p-6">
          <h2 id="locked-heading" className="text-lg font-semibold">
            {totalLocked} more suggestions
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Unlock the full analysis for every issue, section-by-section feedback, keyword gaps and rewritten bullets.
          </p>
          <div className="mt-5">
            <UnlockButton analysisId={analysisId} />
          </div>
        </div>
        <LockedCard title="More issues" count={locked.issues} unit="issues" />
        <LockedCard title="Section feedback" count={locked.sections} unit="sections" />
        <LockedCard title="Keyword gaps" count={locked.keywords} unit="keywords" />
        <LockedCard title="Bullet rewrites" count={locked.rewrites} unit="rewrites" />
      </section>
    </div>
  )
}
