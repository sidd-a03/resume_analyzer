import { Suspense } from "react"

import { PricingAction } from "@/components/home/pricing-action"
import { PricingCards } from "@/components/shared/pricing-cards"
import { PricingUnavailable } from "@/components/shared/pricing-unavailable"
import { SectionHeading } from "@/components/shared/section-heading"
import { BlurFade } from "@/components/ui/blur-fade"
import { pricingNote } from "@/constants/pricing"
import { getPricing } from "@/lib/pricing"

async function PricingContent() {
  const pricing = await getPricing()
  if (!pricing) return <PricingUnavailable className="mt-14 text-center" />
  return (
    <PricingCards
      pricing={pricing}
      className="mt-14"
      renderAction={(pack, featured) => <PricingAction pack={pack} featured={featured} />}
    />
  )
}

export function Pricing() {
  return (
    <section id="pricing" className="section-y bg-card/40">
      <div className="container-page">
        <BlurFade inView>
          <SectionHeading
            eyebrow="Pricing"
            title="Pay only for what you use"
            description="Your first analysis is free. Buy credits when you need more."
          />
        </BlurFade>

        <BlurFade inView delay={0.1}>
          <Suspense fallback={<div className="mt-14 h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
            <PricingContent />
          </Suspense>
        </BlurFade>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          The free preview (score and top 3 issues) always costs 0 credits. {pricingNote}
        </p>
      </div>
    </section>
  )
}
