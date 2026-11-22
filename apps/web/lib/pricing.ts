import { cacheLife, cacheTag } from "next/cache"
import type { PublicPricing } from "@repo/validation"

import { apiBaseURL } from "@/constants/api"
import type { ApiEnvelope } from "@/lib/api-client"

export const PRICING_TAG = "pricing"

export type CreditPack = PublicPricing["packs"][number]

export async function getPricing(): Promise<PublicPricing | null> {
  "use cache"
  cacheTag(PRICING_TAG)
  try {
    const res = await fetch(`${apiBaseURL}/pricing`)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
  
    const pricing = ((await res.json()) as ApiEnvelope<PublicPricing>).data
    cacheLife("hours")
    return pricing
  } catch {
    cacheLife("seconds")
    return null
  }
}
