"use server"

import { redirect } from "next/navigation"

import { creditPacks, type CreditPack } from "@/constants/pricing"
import { getCreditTransactions } from "@/lib/credits"
import { ledgerQuerySchema } from "@repo/validation"
import { getSessionUser, requireUser } from "@/lib/session"

/** The next page of the credit history, for "Load more". Server actions are public endpoints, so the cursor is checked like any input. */
export async function loadMoreTransactions(cursor: string) {
  const query = ledgerQuerySchema.safeParse({ cursor })
  if (!query.success) return { items: [], nextCursor: null }
  return getCreditTransactions(query.data.cursor)
}

export async function startCheckout(packId: CreditPack["id"]) {
  await requireUser()
  if (!creditPacks.some((p) => p.id === packId)) return { ok: false as const, message: "That pack doesn't exist." }

  // TODO: ask the backend to create a Razorpay order for packId (it reads the price, never the client),
  // open Razorpay Checkout, then land on /credits?payment=<id> to poll for confirmation
  redirect("/credits?payment=sample-pending")
}

export async function claimWelcomeCredit() {
  const user = await getSessionUser()
  if (!user) return { ok: false as const, message: "Your session expired. Sign in again." }
  if (!user.phoneNumberVerified) return { ok: false as const, message: "Verify your phone number first." }

  // TODO: ask the backend to grant the welcome credit once per verified phone, then refresh()
  return { ok: false as const, message: "Welcome credits aren't connected to the backend yet." }
}
