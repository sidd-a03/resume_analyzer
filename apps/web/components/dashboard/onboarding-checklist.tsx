import { Check } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { ClaimWelcomeButton } from "@/components/dashboard/claim-welcome-button"
import type { Onboarding } from "@/lib/types"
import { cn } from "@/lib/utils"

function Step({ done, index, title, children }: { done: boolean; index: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs",
          done ? "border-success/40 bg-success/10 text-success" : "bg-background",
        )}
      >
        {done ? <Check className="size-4" aria-label="Done" /> : index}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("font-medium", done && "text-muted-foreground line-through decoration-foreground/30")}>{title}</p>
        {!done && <div className="shrink-0">{children}</div>}
      </div>
    </li>
  )
}

const linkClass = "text-sm font-medium underline underline-offset-4 decoration-pen/60 hover:decoration-pen"

/** Shown until every step is done. */
export function OnboardingChecklist({ onboarding }: { onboarding: Onboarding }) {
  const { uploaded, phoneVerified, welcomeClaimed, triedJobMatch } = onboarding
  if (uploaded && welcomeClaimed && triedJobMatch) return null

  const doneCount = [uploaded, welcomeClaimed, triedJobMatch].filter(Boolean).length

  return (
    <section aria-labelledby="onboarding-heading" className="rounded-xl border bg-card p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="onboarding-heading" className="text-lg font-semibold">
          Get set up
        </h2>
        <span className="font-mono text-xs text-muted-foreground">{doneCount}/3 done</span>
      </div>

      <ol className="mt-5 divide-y divide-dashed">
        <Step done={uploaded} index={1} title="Upload your first resume">
          <Link href="/analyze" className={linkClass}>
            Upload now
          </Link>
        </Step>
        <Step done={welcomeClaimed} index={2} title="Verify your phone to claim your welcome credit">
          {phoneVerified ? (
            <ClaimWelcomeButton />
          ) : (
            <Link href="/settings#phone" className={linkClass}>
              Verify phone
            </Link>
          )}
        </Step>
        <Step done={triedJobMatch} index={3} title="Try a job description match">
          <Link href="/analyze?type=job_match" className={linkClass}>
            Match a job
          </Link>
        </Step>
      </ol>
    </section>
  )
}
