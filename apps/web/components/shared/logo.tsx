import Link from "next/link"

import { cn } from "@/lib/utils"

/** Ink tile, paper sheet, one highlighted line and a red-pen tick. Inverts in dark mode. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      <rect width="32" height="32" rx="7" fill="var(--foreground)" />
      <rect x="7.5" y="5.5" width="17" height="21" rx="1.8" fill="var(--background)" />
      <rect x="10.5" y="9" width="7" height="1.6" rx=".8" fill="var(--foreground)" fillOpacity=".35" />
      <rect x="9.6" y="12.6" width="12.8" height="3.4" rx=".7" fill="var(--highlight)" />
      <rect x="10.5" y="13.5" width="10" height="1.6" rx=".8" fill="var(--foreground)" fillOpacity=".8" />
      <rect x="10.5" y="18.6" width="6.5" height="1.6" rx=".8" fill="var(--foreground)" fillOpacity=".35" />
      <rect x="10.5" y="21.8" width="4.5" height="1.6" rx=".8" fill="var(--foreground)" fillOpacity=".35" />
      <path
        d="m18.4 20.6 1.9 2 3.9-4.6"
        stroke="var(--pen)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <LogoMark />
      <span className="font-heading text-xl font-semibold tracking-tight">
        Resume<span className="italic">Lens</span>
      </span>
    </Link>
  )
}
