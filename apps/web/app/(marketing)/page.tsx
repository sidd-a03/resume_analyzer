import { BuiltFor } from "@/components/home/built-for"
import { Faq } from "@/components/home/faq"
import { Features } from "@/components/home/features"
import { FinalCta } from "@/components/home/final-cta"
import { Hero } from "@/components/home/hero"
import { HowItWorks } from "@/components/home/how-it-works"
import { JdMatch } from "@/components/home/jd-match"
import { Pricing } from "@/components/home/pricing"
import { Showcase } from "@/components/home/showcase"
import { Trust } from "@/components/home/trust"

export default function HomePage() {
  return (
    <>
      <Hero />
      <BuiltFor />
      <HowItWorks />
      <Features />
      <Showcase />
      <JdMatch />
      <Trust />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  )
}
