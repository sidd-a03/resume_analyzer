"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { providerMeta } from "@/components/auth/provider-meta"
import { socialProviders, type SocialProvider } from "@/lib/auth-client"

function providerLabel(provider?: string) {
  return socialProviders.includes(provider as SocialProvider) ? providerMeta[provider as SocialProvider].label : "That"
}

/** better-auth's error codes for the link flow, in plain words. */
function messageForError(code: string, provider?: string) {
  const label = providerLabel(provider)
  switch (code) {
    case "access_denied":
      return "Connection cancelled."
    case "account_already_linked_to_different_user":
      return `This ${label} account already signs in to a different ResumeLens account. Pick another ${label} account, or sign in with this one to manage it.`
    case "email_not_found":
      return `${label} didn't share an email address. Make one visible on ${label} and try again.`
    case "unable_to_get_user_info":
    case "unable_to_link_account":
      return `Couldn't connect your ${label} account. Please try again.`
    default:
      return "Something went wrong while connecting. Please try again."
  }
}

/** Shows the outcome of a link round trip once, then clears it from the URL. */
export function LinkResultToast({ linked, provider, error }: { linked?: string; provider?: string; error?: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!linked && !error) return
    // A fixed id: if the effect runs twice (dev Strict Mode), the second call updates the same toast
    const id = "link-result"
    if (error) {
      if (error === "access_denied") toast.info(messageForError(error), { id })
      else toast.error(messageForError(error, provider), { id })
    } else if (linked && socialProviders.includes(linked as SocialProvider)) {
      toast.success(`${providerLabel(linked)} connected`, { id })
    }
    router.replace("/settings", { scroll: false })
  }, [linked, provider, error, router])

  return null
}
