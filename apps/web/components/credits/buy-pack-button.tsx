"use client"

import { Loader2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { CreditPack } from "@/constants/pricing"
import { startCheckout } from "@/lib/actions/credits"

export function BuyPackButton({
  packId,
  label,
  highlighted,
}: {
  packId: CreditPack["id"]
  label: string
  highlighted: boolean
}) {
  const [pending, startTransition] = useTransition()

  function buy() {
    startTransition(async () => {
      // Redirects to the confirming state on success
      const result = await startCheckout(packId)
      if (result && !result.ok) toast.error(result.message)
    })
  }

  return (
    <Button
      size="lg"
      variant={highlighted ? "default" : "outline"}
      onClick={buy}
      disabled={pending}
      className="h-11 w-full rounded-lg"
    >
      {pending && <Loader2 className="animate-spin" />}
      {label}
    </Button>
  )
}
