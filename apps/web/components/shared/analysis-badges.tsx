import { CircleAlert, CircleCheck, Clock, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { analysisStatuses, analysisTypes } from "@/constants/analysis"
import type { AnalysisStatus, AnalysisType } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusStyle: Record<AnalysisStatus, { className: string; Icon: typeof Clock }> = {
  queued: { className: "border-border bg-muted text-muted-foreground", Icon: Clock },
  running: { className: "border-warning/30 bg-warning/10 text-warning", Icon: Loader2 },
  succeeded: { className: "border-success/30 bg-success/10 text-success", Icon: CircleCheck },
  failed: { className: "border-destructive/30 bg-destructive/10 text-destructive", Icon: CircleAlert },
}

export function StatusBadge({ status, className }: { status: AnalysisStatus; className?: string }) {
  const { className: tone, Icon } = statusStyle[status]
  return (
    <Badge variant="outline" className={cn("shrink-0 gap-1", tone, className)}>
      <Icon className={cn("size-3", status === "running" && "animate-spin")} aria-hidden="true" />
      {analysisStatuses[status]}
    </Badge>
  )
}

export function TypeBadge({ type, className }: { type: AnalysisType; className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 font-mono text-[11px]",
        type === "preview" ? "text-muted-foreground" : "border-foreground/25 text-foreground",
        className,
      )}
    >
      {analysisTypes[type].label}
    </Badge>
  )
}
