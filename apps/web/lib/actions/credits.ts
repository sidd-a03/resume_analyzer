"use server"

import { redirect } from "next/navigation"

import { creditPacks, type CreditPack } from "@/constants/pricing"
import { requireUser } from "@/lib/session"

export async function startCheckout(packId: CreditPack["id"]) {
  await requireUser()
  if (!creditPacks.some((p) => p.id === packId)) return { ok: false as const, message: "That pack doesn't exist." }

  // TODO: ask the backend to create a Razorpay order for packId (it reads the price, never the client),
  // open Razorpay Checkout, then land on /credits?payment=<id> to poll for confirmation
  redirect("/credits?payment=sample-pending")
}
