import { Badge } from "@/components/ui/badge"
import type { Severity } from "@/constants/sample-data"
import { cn } from "@/lib/utils"

const severityClass: Record<Severity, string> = {
  high: "border-destructive/30 bg-destructive/10 text-destructive",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-border bg-muted text-muted-foreground",
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <Badge variant="outline" className={cn("shrink-0 capitalize", severityClass[severity], className)}>
      {severity}
    </Badge>
  )
}
