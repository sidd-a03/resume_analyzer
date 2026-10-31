import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: "left" | "center"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start",
        className,
      )}
    >
      {eyebrow && (
        <span className="flex items-center gap-2.5 font-mono text-xs font-medium tracking-widest text-muted-foreground uppercase">
          <span className="h-px w-6 bg-pen" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2 className="text-[clamp(2rem,4vw,3.1rem)] leading-[1.08] font-semibold tracking-[-0.015em] text-balance">
        {title}
      </h2>
      {description && <p className="text-lg text-pretty text-muted-foreground">{description}</p>}
    </div>
  )
}
