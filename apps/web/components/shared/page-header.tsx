import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** The one `h1` on each app page, with optional actions on the right. */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-[clamp(1.9rem,3.5vw,2.5rem)] leading-tight font-semibold tracking-[-0.015em] text-balance">
          {title}
        </h1>
        {description && <p className="mt-1.5 text-pretty text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
