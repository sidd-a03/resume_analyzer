import { VenetianMask } from "lucide-react"

import { StopImpersonatingButton } from "@/components/app/stop-impersonating-button"
import { getSession } from "@/lib/session"

/** Shown on every app page while an admin is signed in as someone else. */
export async function ImpersonationBanner() {
  const data = await getSession()
  if (!data?.session.impersonatedBy) return null

  return (
    <div role="status" className="flex items-center justify-center gap-3 bg-foreground px-4 py-2 text-sm text-background">
      <VenetianMask className="size-4 shrink-0" aria-hidden="true" />
      <p className="truncate">
        Viewing as <strong>{data.user.name}</strong> ({data.user.email})
      </p>
      <StopImpersonatingButton />
    </div>
  )
}
