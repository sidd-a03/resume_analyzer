import { Coins } from "lucide-react"
import Link from "next/link"

import { creditBalance as balance } from "@/constants/data"

// TODO: serve the actual balance from the backend
export function CreditChip() {
  return (
    <Link
      href="/credits"
      aria-label={`${balance} credits. Go to credits`}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-card px-3 font-mono text-sm font-medium transition-colors outline-none hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Coins className="size-4 text-warning" aria-hidden="true" />
      {balance}
    </Link>
  )
}
