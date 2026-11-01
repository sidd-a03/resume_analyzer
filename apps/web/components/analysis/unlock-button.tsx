"use client"

import { Loader2, LockOpen } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { InsufficientCreditsDialog, type CreditShortfall } from "@/components/shared/insufficient-credits-dialog"
import { Button } from "@/components/ui/button"
import { analysisTypes } from "@/constants/analysis"
import { unlockAnalysis } from "@/lib/actions/analysis"

export function UnlockButton({ analysisId }: { analysisId: string }) {
  const [pending, startTransition] = useTransition()
  const [shortfall, setShortfall] = useState<CreditShortfall | null>(null)

  function unlock() {
    startTransition(async () => {
      const result = await unlockAnalysis(analysisId)
      if (result.ok) toast.success("Full analysis unlocked")
      else if (result.code === "insufficient_credits") setShortfall({ balance: result.balance, cost: result.cost })
      else toast.error(result.message)
    })
  }

  return (
    <>
      <Button size="lg" onClick={unlock} disabled={pending} className="h-11 px-5">
        {pending ? <Loader2 className="animate-spin" /> : <LockOpen />}
        Unlock full analysis ({analysisTypes.full.cost} credit)
      </Button>
      <InsufficientCreditsDialog shortfall={shortfall} onClose={() => setShortfall(null)} />
    </>
  )
}
