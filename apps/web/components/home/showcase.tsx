import { Lock } from "lucide-react"

import { BeforeAfter } from "@/components/shared/before-after"
import { KeywordChip } from "@/components/shared/keyword-chip"
import { ScoreRing } from "@/components/shared/score-ring"
import { SectionHeading } from "@/components/shared/section-heading"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { BlurFade } from "@/components/ui/blur-fade"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  lockedCount,
  sampleIssues,
  sampleKeywords,
  sampleResume,
  sampleRewrite,
  sampleSections,
} from "@/constants/sample-data"

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground">{title}</h3>
      {children}
    </div>
  )
}

function ScoreAndIssues() {
  return (
    <>
      <Panel title="Your score">
        <div className="flex items-center gap-5">
          <ScoreRing score={sampleResume.score} size={104} />
          <div>
            <p className="font-heading text-xl font-bold">{sampleResume.scoreLabel}</p>
            <p className="text-sm text-muted-foreground">{sampleResume.fileName}</p>
          </div>
        </div>
      </Panel>
      <Panel title="Top issues">
        <ul className="flex flex-col gap-2.5">
          {sampleIssues.map((issue) => (
            <li key={issue.title} className="flex items-start justify-between gap-3 text-sm">
              <span>{issue.title}</span>
              <SeverityBadge severity={issue.severity} />
            </li>
          ))}
        </ul>
      </Panel>
    </>
  )
}

/** Placeholder for paid content. The real content is never sent for free previews. */
function LockedPanel({ title }: { title: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border bg-card p-5">
      <div aria-hidden="true" className="flex flex-col gap-3 blur-[5px] select-none">
        <div className="h-3 w-1/3 rounded-full bg-muted-foreground/20" />
        <div className="h-3 w-full rounded-full bg-muted-foreground/15" />
        <div className="h-3 w-5/6 rounded-full bg-muted-foreground/15" />
        <div className="h-3 w-2/3 rounded-full bg-muted-foreground/15" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-card/40 text-center">
        <span className="grid size-9 place-items-center rounded-full border bg-background">
          <Lock className="size-4" aria-hidden="true" />
        </span>
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">Unlock with 1 credit</span>
      </div>
    </div>
  )
}

export function Showcase() {
  return (
    <section className="section-y">
      <div className="container-page">
        <BlurFade inView>
          <SectionHeading
            eyebrow="Preview"
            title="See what you get"
            description="Start with a free preview. Unlock the full analysis when you want the details."
          />
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <Tabs defaultValue="free" className="mt-12 items-start gap-6">
            <TabsList className="h-11! rounded-lg p-1">
              <TabsTrigger value="free" className="cursor-pointer rounded-lg px-5">
                Free preview
              </TabsTrigger>
              <TabsTrigger value="full" className="cursor-pointer rounded-lg px-5">
                Full analysis
              </TabsTrigger>
            </TabsList>

            <div className="w-full rounded-xl border bg-muted/60 p-3 sm:p-5">
              <TabsContent value="free" className="grid gap-4 md:grid-cols-2">
                <ScoreAndIssues />
                <LockedPanel title="Section feedback" />
                <LockedPanel title={`${lockedCount} more suggestions`} />
              </TabsContent>

              <TabsContent value="full" className="grid gap-4 md:grid-cols-2">
                <ScoreAndIssues />
                <Panel title="Section feedback">
                  <ul className="divide-y text-sm">
                    {sampleSections.map((s) => (
                      <li key={s.name} className="flex justify-between py-2">
                        <span>{s.name}</span>
                        <span className="text-muted-foreground">{s.status}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
                <Panel title="Keywords and rewrites">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {sampleKeywords.missing.slice(0, 4).map((k) => (
                      <KeywordChip key={k} keyword={k} found={false} />
                    ))}
                  </div>
                  <BeforeAfter before={sampleRewrite.before} after={sampleRewrite.after} />
                </Panel>
              </TabsContent>
            </div>
          </Tabs>
        </BlurFade>
        <p className="mt-4 text-center text-xs text-muted-foreground">Sample data for illustration</p>
      </div>
    </section>
  )
}
