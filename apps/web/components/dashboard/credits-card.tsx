import { Coins } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { pluralCredits } from "@/constants/analysis"
import { cn } from "@/lib/utils"

export function CreditsCard({ balance, fullCost }: { balance: number; fullCost: number | null }) {
  return (
    <section aria-labelledby="credits-heading" className="flex flex-col rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Coins className="size-4 text-warning" aria-hidden="true" />
        <h2 id="credits-heading" className="text-sm font-medium">
          Credit balance
        </h2>
      </div>
      <p className="mt-3 font-heading text-5xl leading-none font-semibold tracking-tight">{balance}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {fullCost !== null && `A full analysis costs ${pluralCredits(fullCost)}. `}The free preview costs nothing.
      </p>
      <Link href="/credits" className={cn(buttonVariants({ variant: "outline" }), "mt-auto self-start")}>
        Buy credits
      </Link>
    </section>
  )
}
