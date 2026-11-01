import { Coins } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import { BuyPackButton } from "@/components/credits/buy-pack-button"
import { LedgerTable } from "@/components/credits/ledger-table"
import { PaymentBanner } from "@/components/credits/payment-banner"
import { PageHeader } from "@/components/shared/page-header"
import { PricingCards } from "@/components/shared/pricing-cards"
import { analysisTypes } from "@/constants/analysis"
import { pricingNote } from "@/constants/pricing"
import { creditBalance as balance, ledger, payments } from "@/constants/data"
import { requireUser } from "@/lib/session"
import { first } from "@/lib/utils"

export const metadata: Metadata = { title: "Credits" }

async function CreditsContent({ searchParams }: { searchParams: PageProps<"/credits">["searchParams"] }) {
  const [, params] = await Promise.all([requireUser(), searchParams])
  const paymentId = first(params.payment)
  // The landing page's pricing buttons link here with ?pack=
  const selectedPack = first(params.pack)

  // TODO: serve actual data from the backend
  const payment = payments.find((p) => p.id === paymentId) ?? null

  return (
    <div className="flex flex-col gap-10">
      {payment && <PaymentBanner payment={payment} />}

      <section aria-label="Balance" className="flex flex-col gap-1 rounded-xl border bg-card p-6 sm:flex-row sm:items-center sm:gap-6">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-highlight/40">
          <Coins className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Current balance</p>
          <p className="font-heading text-4xl leading-tight font-semibold">{balance}</p>
        </div>
        <p className="text-sm text-muted-foreground sm:ml-auto sm:max-w-xs sm:text-right">
          Full analysis: {analysisTypes.full.cost} credit. With a job match: {analysisTypes.job_match.cost} credits. Free
          preview: 0.
        </p>
      </section>

      <section aria-labelledby="buy-heading">
        <h2 id="buy-heading" className="text-lg font-semibold">
          Buy credits
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{pricingNote}</p>
        <PricingCards
          compact
          className="mt-8"
          renderAction={(pack, featured) => (
            <BuyPackButton
              packId={pack.id}
              label={`Buy ${pack.name}`}
              highlighted={selectedPack ? selectedPack === pack.id : featured}
            />
          )}
        />
      </section>

      <section aria-labelledby="ledger-heading">
        <h2 id="ledger-heading" className="mb-4 text-lg font-semibold">
          Credit history
        </h2>
        <LedgerTable entries={ledger} />
      </section>
    </div>
  )
}

export default function CreditsPage({ searchParams }: PageProps<"/credits">) {
  return (
    <div className="container-app">
      <PageHeader title="Credits" description="Buy credits once, use them whenever. They never expire." />
      <div className="mt-8">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <CreditsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
