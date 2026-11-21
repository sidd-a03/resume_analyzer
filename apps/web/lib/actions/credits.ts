"use server"

import { redirect } from "next/navigation"

import type { PackId } from "@repo/validation"

import { getPricing } from "@/lib/pricing"
import { requireUser } from "@/lib/session"

export async function startCheckout(packId: PackId) {
  await requireUser()
  // Only packs currently on sale; the backend reads the price itself when creating the order
  const pricing = await getPricing()
  if (!pricing?.packs.some((p) => p.id === packId)) return { ok: false as const, message: "That pack isn't available." }

  // TODO: ask the backend to create a Razorpay order for packId (it reads the price, never the client),
  // open Razorpay Checkout, then land on /credits?payment=<id> to poll for confirmation
  redirect("/credits?payment=sample-pending")
}
