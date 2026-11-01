import type { LucideIcon } from "lucide-react"
import Link from "next/link"

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string
  value: number
  hint?: string
  icon: LucideIcon
  href?: string
}) {
  const body = (
    <>
      <p className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon className="size-4" aria-hidden="true" />
      </p>
      <p className="mt-3 font-mono text-3xl font-semibold tracking-tight">{value.toLocaleString("en-IN")}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </>
  )

  const className = "rounded-xl border bg-card p-5"
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:border-foreground/25`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  )
}
