import { ArrowRight, Upload } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NewAnalysisCard() {
  return (
    <section
      aria-labelledby="analyze-heading"
      className="relative flex flex-col overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground sm:p-8"
    >
      {/* A corner of a resume sheet peeking in */}
      <div
        aria-hidden="true"
        className="absolute -right-6 -bottom-10 h-44 w-36 rotate-[8deg] rounded-sm bg-primary-foreground/10 p-4 max-sm:hidden"
      >
        <div className="h-2 w-14 rounded-full bg-primary-foreground/30" />
        <div className="mt-4 h-1.5 w-full rounded-full bg-primary-foreground/20" />
        <div className="mt-2 h-1.5 w-full rounded-full bg-highlight/80" />
        <div className="mt-2 h-1.5 w-3/4 rounded-full bg-primary-foreground/20" />
      </div>

      <h2 id="analyze-heading" className="max-w-sm text-2xl leading-tight font-semibold sm:text-3xl">
        Analyze a resume
      </h2>
      <p className="mt-2 max-w-sm text-primary-foreground/70">
        Upload a PDF and get your score, the fixes that matter most and better bullet points.
      </p>
      <Link
        href="/analyze"
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 h-12 self-start rounded-lg bg-highlight px-6 text-base text-neutral-900 hover:bg-highlight/85",
        )}
      >
        <Upload data-icon="inline-start" />
        New analysis
        <ArrowRight data-icon="inline-end" />
      </Link>
    </section>
  )
}
