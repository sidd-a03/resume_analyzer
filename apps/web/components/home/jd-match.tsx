import { Check, PenLine } from "lucide-react"

import { KeywordChip } from "@/components/shared/keyword-chip"
import { ScoreRing } from "@/components/shared/score-ring"
import { SectionHeading } from "@/components/shared/section-heading"
import { BlurFade } from "@/components/ui/blur-fade"
import { sampleJobMatch } from "@/constants/sample-data"

const points = [
  "A match percentage for the exact role you're applying to",
  "The skills and keywords the job asks for that you haven't mentioned",
  "Bullet suggestions tailored to that job description",
]

export function JdMatch() {
  return (
    <section className="section-y border-y bg-card/50">
      <div className="container-page grid items-center gap-14 lg:grid-cols-2">
        <BlurFade inView className="flex flex-col gap-5">
          <SectionHeading
            eyebrow="Job match"
            title={
              <>
                Tailor your resume to <span className="marker italic">every application</span>
              </>
            }
            description="Paste a job description next to your resume and see how well they line up, before a recruiter does."
          />
          <ul className="mt-2 flex flex-col gap-3">
            {points.map((p) => (
              <li key={p} className="flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <div aria-label="Sample job match" className="relative">
            <div className="overflow-hidden rounded-xl border bg-card shadow-paper">
              <div className="border-b p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold">Job description</span>
                  <span className="font-mono text-xs text-muted-foreground">{sampleJobMatch.jobTitle}</span>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
                  {sampleJobMatch.jd}
                </div>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center gap-1">
                  <ScoreRing score={sampleJobMatch.match} size={96} strokeWidth={9} />
                  <span className="text-xs text-muted-foreground">match</span>
                </div>
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-sm font-semibold">Missing keywords</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {sampleJobMatch.missing.map((k) => (
                        <KeywordChip key={k} keyword={k} found={false} />
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-background p-3">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <PenLine className="size-3.5 text-pen" aria-hidden="true" />
                      Suggested bullet
                    </span>
                    <p className="mt-1 text-sm">{sampleJobMatch.suggestion}</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Sample data for illustration</p>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
