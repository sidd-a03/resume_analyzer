"use server"

import { updateTag } from "next/cache"
import { can } from "@repo/permission"

import { PRICING_TAG } from "@/lib/pricing"
import { requireAdmin } from "@/lib/session"

/**
 * Called after a superadmin saves a price (the save itself goes straight to the API). Clears the cached
 * pricing so the landing page, /credits and checkout show the new values on their next request.
 */
export async function refreshPricing() {
  const user = await requireAdmin()
  if (!can(user.role, { pricing: ["update"] })) return
  updateTag(PRICING_TAG)
}
