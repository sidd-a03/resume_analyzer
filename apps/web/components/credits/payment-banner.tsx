"use client"

import { CircleAlert, Loader2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { BuyPackButton } from "@/components/credits/buy-pack-button"
import { RefreshWhile } from "@/components/shared/refresh-while"
import { pluralCredits } from "@/constants/analysis"
import type { Payment } from "@/lib/types"

/** After checkout: polls while pending, toasts once when paid, offers a retry when it failed. */
export function PaymentBanner({ payment }: { payment: Payment }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (payment.status !== "paid") return
    toast.success(`Payment received. ${pluralCredits(payment.credits)} added.`, { id: payment.id })
    router.replace(pathname, { scroll: false })
  }, [payment.id, payment.status, payment.credits, pathname, router])

  if (payment.status === "pending") {
    return (
      <div role="status" className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
        <RefreshWhile active intervalMs={1500} />
        <Loader2 className="size-5 shrink-0 animate-spin text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium">Confirming your payment…</p>
          <p className="text-sm text-muted-foreground">
            Your {pluralCredits(payment.credits)} will appear as soon as the payment is confirmed. Keep this page open.
          </p>
        </div>
      </div>
    )
  }

  if (payment.status === "failed") {
    return (
      <div role="alert" className="flex flex-col gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center">
        <CircleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-medium">The payment didn&apos;t go through</p>
          <p className="text-sm text-muted-foreground">You weren&apos;t charged. Try again or use another payment method.</p>
        </div>
        <div className="sm:w-40">
          <BuyPackButton packId={payment.packId} label="Try again" highlighted />
        </div>
      </div>
    )
  }

  return null
}
