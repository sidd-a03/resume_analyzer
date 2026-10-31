import { ResumePaperMock } from "@/components/shared/resume-paper-mock"
import { ScoreRing } from "@/components/shared/score-ring"
import { sampleResume, sampleRewrite } from "@/constants/sample-data"

/** A printed resume with a reviewer's red-pen notes, a score card and one rewrite. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[500px] pt-4 pb-10 lg:mr-0 lg:ml-auto">
      <div className="relative mr-2 ml-auto w-[66%] rotate-[1.5deg] sm:w-[62%]">
        {/* second sheet underneath */}
        <div aria-hidden="true" className="absolute inset-0 -rotate-[4deg] rounded-sm border bg-card shadow-paper" />
        <ResumePaperMock name={sampleResume.name} role={sampleResume.role} className="relative" />

        {/* margin notes in red pen, in the left margin */}
        <p
          aria-hidden="true"
          className="absolute top-[31%] -left-[50%] w-32 -rotate-[4deg] text-right font-hand text-xl leading-tight text-pen max-sm:hidden"
        >
          what changed? add a number →
        </p>
        <p
          aria-hidden="true"
          className="absolute top-[55%] -left-[40%] w-28 -rotate-[3deg] text-right font-hand text-xl text-success max-sm:hidden"
        >
          good one ✓
        </p>
      </div>

      <div className="absolute top-[6%] left-0 w-[40%] min-w-[170px] -rotate-[2deg] rounded-lg border bg-card p-4 shadow-paper max-sm:top-[38%]">
        <div className="flex items-center gap-3">
          <ScoreRing score={sampleResume.score} size={60} strokeWidth={6} />
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Resume score</span>
            <span className="font-heading text-base font-semibold">{sampleResume.scoreLabel}</span>
          </div>
        </div>
      </div>

      <div className="absolute right-0 bottom-0 w-[64%] min-w-[230px] rotate-[1deg] rounded-lg border bg-card p-4 shadow-paper">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Suggested rewrite
        </span>
        <p className="mt-2 text-xs text-muted-foreground line-through decoration-pen/70">{sampleRewrite.before}</p>
        <p className="mt-1.5 text-[13px] leading-snug">{sampleRewrite.after}</p>
      </div>

      <p className="absolute -bottom-8 left-0 text-[11px] text-muted-foreground">Sample data, for illustration</p>
    </div>
  )
}
