import { cn } from "@/lib/utils"

export function PricingUnavailable({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      Prices couldn&apos;t be loaded right now. Refresh the page in a moment.
    </p>
  )
}
