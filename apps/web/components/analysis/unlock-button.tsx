"use client"

import { Loader2, LockOpen } from "lucide-react"
import { useState } from "react"

import { InsufficientCreditsDialog, type CreditShortfall } from "@/components/shared/insufficient-credits-dialog"
import { Button } from "@/components/ui/button"
import { pluralCredits } from "@/constants/analysis"
import { useStartAnalysis } from "@/hooks/use-start-analysis"

export function UnlockButton({ resumeId, cost, balance }: { resumeId: string; cost: number; balance: number }) {
  const [shortfall, setShortfall] = useState<CreditShortfall | null>(null)
  const start = useStartAnalysis()
  const pending = start.isPending || start.isSuccess

  function unlock() {
    if (cost > balance) {
      setShortfall({ balance, cost })
      return
    }
    start.mutate({ resumeId, type: "FULL" })
  }

  return (
    <>
      <Button size="lg" onClick={unlock} disabled={pending} className="h-11 px-5">
        {pending ? <Loader2 className="animate-spin" /> : <LockOpen />}
        Unlock full analysis ({pluralCredits(cost)})
      </Button>
      <InsufficientCreditsDialog shortfall={shortfall} onClose={() => setShortfall(null)} />
    </>
  )
}
