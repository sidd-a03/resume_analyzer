import { FileUp, PenLine } from "lucide-react"

import { ScoreRing } from "@/components/shared/score-ring"
import { SectionHeading } from "@/components/shared/section-heading"
import { BlurFade } from "@/components/ui/blur-fade"
import { sampleResume } from "@/constants/sample-data"

function DropzoneMini() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-foreground/20 bg-background p-4">
      <FileUp className="size-6 text-muted-foreground" aria-hidden="true" />
      <span className="font-mono text-[11px] text-muted-foreground">{sampleResume.fileName}</span>
    </div>
  )
}

function ScoreMini() {
  return (
    <div className="flex h-full items-center justify-center gap-4 rounded-lg border bg-background p-4">
      <ScoreRing score={sampleResume.score} size={72} strokeWidth={7} />
      <div className="flex flex-col gap-1.5">
        <div className="h-1.5 w-20 rounded-full bg-destructive/50" />
        <div className="h-1.5 w-16 rounded-full bg-warning/50" />
        <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
      </div>
    </div>
  )
}

function DiffMini() {
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 rounded-lg border bg-background p-4">
      <div className="relative h-2 w-[80%] rounded-full bg-foreground/15">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-pen/70" />
      </div>
      <div className="flex items-center gap-1.5">
        <PenLine className="size-3.5 text-pen" aria-hidden="true" />
        <div className="relative h-2 flex-1">
          <div className="absolute -inset-1 rounded-sm bg-highlight/80" />
          <div className="relative h-2 rounded-full bg-foreground/25" />
        </div>
      </div>
      <div className="ml-5 h-2 w-[60%] rounded-full bg-foreground/15" />
    </div>
  )
}

const steps = [
  {
    title: "Upload your PDF",
    body: "Drag and drop a text-based PDF up to 5 MB.",
    Visual: DropzoneMini,
  },
  {
    title: "Get your analysis",
    body: "A score, your top issues, and feedback for every section.",
    Visual: ScoreMini,
  },
  {
    title: "Improve and match",
    body: "Rewrite weak bullets, close keyword gaps, and check against a job description.",
    Visual: DiffMini,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="section-y">
      <div className="container-page">
        <BlurFade inView>
          <SectionHeading
            eyebrow="How it works"
            title="From PDF to a better resume in three steps"
            description="No templates to fill in. Upload what you already have."
          />
        </BlurFade>

        <ol className="mt-14 grid border-t md:grid-cols-3">
          {steps.map(({ title, body, Visual }, i) => (
            <li key={title} className="border-b md:border-b-0 md:not-last:border-r">
              <BlurFade inView delay={i * 0.08} className="flex flex-col gap-5 py-8 md:px-8 md:first:pl-0">
                <span className="font-heading text-5xl leading-none font-medium text-muted-foreground/60 italic">
                  {i + 1}.
                </span>
                <div className="h-32 w-full">
                  <Visual />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-1.5 text-muted-foreground">{body}</p>
                </div>
              </BlurFade>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
