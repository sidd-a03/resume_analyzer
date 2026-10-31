import { ArrowRight } from "lucide-react"

import { AuthTrigger } from "@/components/auth/auth-trigger"
import { HeroVisual } from "@/components/home/hero-visual"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const enter = "animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-backwards duration-700"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      <div className="container-page grid items-center gap-16 pt-14 pb-20 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pt-24 lg:pb-28">
        <div className="flex flex-col items-start">
          <p className={cn(enter, "flex items-center gap-2 text-sm font-medium text-muted-foreground delay-50")}>
            <span className="size-1.5 rounded-full bg-pen" aria-hidden="true" />
            Your first analysis is free
          </p>

          <h1
            className={cn(
              enter,
              "mt-6 text-[clamp(2.5rem,5.4vw,4.25rem)] leading-[1.04] font-semibold tracking-[-0.02em] text-balance delay-100",
            )}
          >
            Know what recruiters <span className="marker italic">actually see</span> in your resume.
          </h1>

          <p className={cn(enter, "mt-6 max-w-xl text-lg text-pretty text-muted-foreground sm:text-xl delay-150")}>
            Upload your PDF and get a score, clear fixes, and better bullet points. Match it to any job description.
          </p>

          <div className={cn(enter, "mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row delay-200")}>
            <AuthTrigger size="lg" className="h-12 rounded-lg px-6 text-base hover:bg-primary/85">
              Get started free
              <ArrowRight data-icon="inline-end" className="transition-transform group-hover/button:translate-x-0.5" />
            </AuthTrigger>
            <a
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-lg bg-card px-6 text-base",
              )}
            >
              See how it works
            </a>
          </div>

          <p className={cn(enter, "mt-5 text-sm text-muted-foreground delay-250")}>
            No credit card needed · PDF resumes · Private by default
          </p>
        </div>

        <div className={cn(enter, "delay-150")}>
          <HeroVisual />
        </div>
      </div>
    </section>
  )
}
