import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** A blank sheet with a pen note, drawn with CSS so it follows the theme. */
function BlankSheet() {
  return (
    <div aria-hidden="true" className="relative h-28 w-24">
      <div className="absolute inset-0 rotate-[5deg] rounded-sm border bg-muted" />
      <div className="absolute inset-0 -rotate-[3deg] rounded-sm border bg-card p-3 shadow-paper">
        <div className="h-1.5 w-10 rounded-full bg-foreground/15" />
        <div className="mt-3 flex flex-col gap-1.5">
          <div className="h-1 w-full rounded-full bg-foreground/10" />
          <div className="h-1 w-4/5 rounded-full bg-foreground/10" />
          <div className="h-1 w-full rounded-full bg-highlight/70" />
          <div className="h-1 w-3/5 rounded-full bg-foreground/10" />
        </div>
      </div>
      <span className="absolute -right-10 -bottom-2 -rotate-[8deg] font-hand text-xl text-pen">empty!</span>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 rounded-xl border border-dashed bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      <BlankSheet />
      <div className="max-w-sm">
        <p className="text-lg font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
