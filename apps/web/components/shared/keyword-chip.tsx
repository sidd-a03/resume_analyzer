import { Check, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

export function KeywordChip({ keyword, found, className }: { keyword: string; found: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs font-medium",
        found ? "border-success/30 bg-success/10 text-success" : "border-warning/30 bg-warning/10 text-warning",
        className,
      )}
    >
      {found ? <Check className="size-3" aria-hidden="true" /> : <Plus className="size-3" aria-hidden="true" />}
      {keyword}
      <span className="sr-only">{found ? "(found)" : "(missing)"}</span>
    </span>
  )
}
