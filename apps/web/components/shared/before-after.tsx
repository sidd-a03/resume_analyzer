"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** A weak bullet and its rewrite, with a copy button for the rewrite. */
export function BeforeAfter({ before, after, className }: { before: string; after: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(after)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn("flex flex-col gap-2 text-sm", className)}>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2">
        <span className="text-[11px] font-semibold tracking-wide text-destructive uppercase">Before</span>
        <p className="text-muted-foreground line-through decoration-destructive/40">{before}</p>
      </div>
      <div className="relative rounded-lg border border-success/25 bg-success/5 px-3 py-2 pr-10">
        <span className="text-[11px] font-semibold tracking-wide text-success uppercase">After</span>
        <p className="text-foreground">{after}</p>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy rewrite"}
          className="absolute top-2 right-2"
        >
          {copied ? <Check className="text-success" /> : <Copy />}
        </Button>
      </div>
    </div>
  )
}
