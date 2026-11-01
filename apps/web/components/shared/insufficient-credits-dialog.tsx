"use client"

import { Coins } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { pluralCredits } from "@/constants/analysis"
import { cn } from "@/lib/utils"

export interface CreditShortfall {
  balance: number
  cost: number
}

/** Shown wherever a paid action is blocked by a low balance. Pass `null` to close it. */
export function InsufficientCreditsDialog({
  shortfall,
  onClose,
}: {
  shortfall: CreditShortfall | null
  onClose: () => void
}) {
  return (
    <Dialog open={shortfall !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-2 grid size-11 place-items-center rounded-xl border bg-highlight/40 text-foreground">
            <Coins className="size-5" aria-hidden="true" />
          </span>
          <DialogTitle>Not enough credits</DialogTitle>
          {shortfall && (
            <DialogDescription>
              This needs {pluralCredits(shortfall.cost)} and you have {pluralCredits(shortfall.balance)}. Top up to
              continue. Credits never expire.
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogFooter>
          <DialogClose className={buttonVariants({ variant: "outline" })}>Not now</DialogClose>
          <Link href="/credits" className={cn(buttonVariants())}>
            Buy credits
          </Link>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
