"use client"

import { Gift, Loader2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { claimWelcomeCredit } from "@/lib/actions/credits"

export function ClaimWelcomeButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition()

  function claim() {
    startTransition(async () => {
      const result = await claimWelcomeCredit()
      if (result.ok) toast.success("Welcome credit added. Enjoy your first full analysis!")
      else toast.error(result.message)
    })
  }

  return (
    <Button size="sm" onClick={claim} disabled={pending} className={className}>
      {pending ? <Loader2 className="animate-spin" /> : <Gift />}
      Claim 1 free credit
    </Button>
  )
}
