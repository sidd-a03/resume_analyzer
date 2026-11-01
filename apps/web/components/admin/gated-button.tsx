import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import type { Gate } from "@/lib/admin-access"

/** A button that stays visible when the role can't use it, disabled and labelled with why. */
export function GatedButton({ gate, disabled, children, ...props }: ComponentProps<typeof Button> & { gate: Gate }) {
  if (gate.ok) {
    return (
      <Button disabled={disabled} {...props}>
        {children}
      </Button>
    )
  }
  return (
    <span className="inline-flex items-center gap-2">
      <Button disabled {...props} aria-describedby={undefined}>
        {children}
      </Button>
      <span className="text-xs text-muted-foreground">{gate.reason}</span>
    </span>
  )
}
