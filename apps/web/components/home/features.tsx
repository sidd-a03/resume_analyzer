import { ClipboardList, FileSearch, Gauge, ListChecks, Tags, Wand2 } from "lucide-react"
import type { ComponentType, ReactNode } from "react"

import { BeforeAfter } from "@/components/shared/before-after"
import { KeywordChip } from "@/components/shared/keyword-chip"
import { ScoreRing } from "@/components/shared/score-ring"
import { SectionHeading } from "@/components/shared/section-heading"
import { SeverityBadge } from "@/components/shared/severity-badge"
import { BlurFade } from "@/components/ui/blur-fade"
import {
  sampleIssues,
  sampleJobMatch,
  sampleKeywords,
  sampleResume,
  sampleRewrite,
  sampleSections,
} from "@/constants/sample-data"
import { cn } from "@/lib/utils"

const statusClass: Record<string, string> = {
  Strong: "text-success",
  Good: "text-foreground",
  "Needs work": "text-warning",
}

function BentoCard({
  title,
  body,
  Icon,
  children,
  className,
}: {
  title: string
  body: string
  Icon: ComponentType<{ className?: string }>
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-6 transition-colors hover:border-foreground/25",
        className,
      )}
    >
      <div className="flex-1">{children}</div>
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <Icon className="size-4.5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}

export function Features() {
  return (
    <section id="features" className="section-y border-y bg-card/50">
      <div className="container-page">
        <BlurFade inView>
          <SectionHeading
            eyebrow="Features"
            title="Everything your resume review should tell you"
            description="Specific, prioritized feedback you can act on in an evening."
          />
        </BlurFade>

        <div className="mt-14 grid auto-rows-auto gap-4 md:grid-cols-6">
          <BlurFade inView className="md:col-span-2">
            <BentoCard Icon={Gauge} title="Resume score" body="A clear number and what is holding it back.">
              <div className="flex justify-center py-2">
                <ScoreRing score={sampleResume.score} size={132} label="out of 100" />
              </div>
            </BentoCard>
          </BlurFade>

          <BlurFade inView delay={0.05} className="md:col-span-4">
            <BentoCard
              Icon={ListChecks}
              title="Top issues"
              body="The three changes that will move your score the most."
            >
              <ul className="flex flex-col gap-2.5">
                {sampleIssues.map((issue) => (
                  <li
                    key={issue.title}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3 text-sm"
                  >
                    <span>{issue.title}</span>
                    <SeverityBadge severity={issue.severity} />
                  </li>
                ))}
              </ul>
            </BentoCard>
          </BlurFade>

          <BlurFade inView className="md:col-span-3 lg:col-span-2">
            <BentoCard
              Icon={ClipboardList}
              title="Section feedback"
              body="Notes for your summary, experience, projects, skills and education."
            >
              <ul className="divide-y rounded-lg border bg-background text-sm">
                {sampleSections.map((s) => (
                  <li key={s.name} className="flex items-center justify-between px-4 py-2.5">
                    <span>{s.name}</span>
                    <span className={cn("text-xs font-semibold", statusClass[s.status])}>{s.status}</span>
                  </li>
                ))}
              </ul>
            </BentoCard>
          </BlurFade>

          <BlurFade inView delay={0.05} className="md:col-span-3 lg:col-span-4">
            <BentoCard
              Icon={Tags}
              title="Keyword gaps"
              body="See which skills the job asks for that your resume does not mention."
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {sampleKeywords.found.map((k) => (
                    <KeywordChip key={k} keyword={k} found />
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {sampleKeywords.missing.map((k) => (
                    <KeywordChip key={k} keyword={k} found={false} />
                  ))}
                </div>
              </div>
            </BentoCard>
          </BlurFade>

          <BlurFade inView className="md:col-span-3">
            <BentoCard
              Icon={Wand2}
              title="Bullet rewrites"
              body="Stronger, more specific versions of your weakest bullets."
            >
              <BeforeAfter before={sampleRewrite.before} after={sampleRewrite.after} />
            </BentoCard>
          </BlurFade>

          <BlurFade inView delay={0.05} className="md:col-span-3">
            <BentoCard
              Icon={FileSearch}
              title="Job description match"
              body="Paste a job description and see how well your resume fits."
            >
              <div className="flex items-center gap-5 rounded-lg border bg-background p-4">
                <ScoreRing score={sampleJobMatch.match} size={88} strokeWidth={9} />
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-semibold">{sampleJobMatch.jobTitle}</span>
                  <span className="text-muted-foreground">
                    Missing: <span className="text-foreground">{sampleJobMatch.missing.join(", ")}</span>
                  </span>
                </div>
              </div>
            </BentoCard>
          </BlurFade>
        </div>
      </div>
    </section>
  )
}
