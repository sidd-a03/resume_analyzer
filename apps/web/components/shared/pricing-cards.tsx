import { Check } from "lucide-react"
import type { ReactNode } from "react"

import { creditCosts, creditPacks, type CreditPack } from "@/constants/pricing"
import { cn } from "@/lib/utils"

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
const inrPrecise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

const perCredit = (pack: CreditPack) => pack.priceInr / pack.credits
const baseRate = perCredit(creditPacks[0]!)
const bestValueId = creditPacks.reduce((best, pack) => (perCredit(pack) < perCredit(best) ? pack : best)).id

interface PricingCardsProps {
  /** Button for each pack: opens sign-in on the landing page, starts checkout on /credits. */
  renderAction: (pack: CreditPack, featured: boolean) => ReactNode
  /** Tighter cards without the feature list, for the in-app credits page. */
  compact?: boolean
  className?: string
}

export function PricingCards({ renderAction, compact = false, className }: PricingCardsProps) {
  return (
    <ul className={cn("grid gap-6 md:grid-cols-3 md:items-stretch", className)}>
      {creditPacks.map((pack) => {
        const featured = pack.id === bestValueId
        const savings = Math.round((1 - perCredit(pack) / baseRate) * 100)

        return (
          <li
            key={pack.id}
            className={cn(
              "relative flex flex-col rounded-xl border bg-card",
              compact ? "p-5" : "p-6 lg:p-7",
              featured && "border-foreground/40 shadow-paper md:-translate-y-2",
            )}
          >
            {featured && (
              <span className="absolute -top-3.5 right-5 -rotate-[3deg] rounded-sm bg-highlight px-2 py-0.5 font-hand text-lg leading-6 text-neutral-900">
                best price per credit
              </span>
            )}

            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold">{pack.name}</h3>
              {savings > 0 && (
                <span className="font-mono text-xs text-success">save {savings}%</span>
              )}
            </div>
            {!compact && <p className="mt-1 text-sm text-muted-foreground">{pack.blurb}</p>}

            <div className={cn("flex items-end gap-2", compact ? "mt-4" : "mt-6")}>
              <span className="font-heading text-5xl leading-none font-semibold tracking-tight">
                {inr.format(pack.priceInr)}
              </span>
              <span className="pb-1 text-sm text-muted-foreground">one-time</span>
            </div>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {pack.credits} credits · {inrPrecise.format(perCredit(pack))} each
            </p>

            {!compact && (
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-dashed pt-6 text-sm">
                <Feature>
                  Up to <strong className="font-semibold">{pack.credits / creditCosts.fullAnalysis}</strong> full analyses
                </Feature>
                <Feature>
                  or <strong className="font-semibold">{Math.floor(pack.credits / creditCosts.jobMatch)}</strong> with a
                  job description match
                </Feature>
                <Feature>Rewrites, keyword gaps and section scores</Feature>
              </ul>
            )}

            <div className={cn("mt-auto", compact ? "pt-5" : "pt-8")}>{renderAction(pack, featured)}</div>
          </li>
        )
      })}
    </ul>
  )
}

function Feature({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      <span className="text-muted-foreground [&_strong]:text-foreground">{children}</span>
    </li>
  )
}
