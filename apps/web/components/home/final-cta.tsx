import { ArrowRight } from "lucide-react"

import { AuthTrigger } from "@/components/auth/auth-trigger"
import { BlurFade } from "@/components/ui/blur-fade"

export function FinalCta() {
  return (
    <section className="pb-20 lg:pb-28">
      <div className="container-page">
        <BlurFade inView>
          <div className="flex flex-col items-start gap-8 rounded-xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 md:flex-row md:items-end md:justify-between lg:py-16">
            <div className="flex max-w-xl flex-col gap-4">
              <h2 className="text-[clamp(2rem,4vw,3rem)] leading-[1.08] font-semibold tracking-[-0.015em] text-balance">
                Your next application deserves a <span className="italic">better</span> resume.
              </h2>
              <p className="text-lg text-primary-foreground/70">
                Get your score and top fixes in minutes. Your first analysis is free.
              </p>
            </div>
            <AuthTrigger
              size="lg"
              className="h-12 shrink-0 rounded-lg bg-highlight px-6 text-base text-neutral-900 hover:bg-highlight/85"
            >
              Get started free
              <ArrowRight data-icon="inline-end" />
            </AuthTrigger>
          </div>
        </BlurFade>
      </div>
    </section>
  )
}
