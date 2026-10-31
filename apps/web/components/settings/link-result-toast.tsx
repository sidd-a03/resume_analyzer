"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

import { providerMeta } from "@/components/auth/provider-meta"
import { socialProviders, type SocialProvider } from "@/lib/auth-client"

/** better-auth's error codes for the link flow, in plain words. */
function messageForError(code: string) {
  switch (code) {
    case "access_denied":
      return "Connection cancelled."
    case "account_already_linked_to_different_user":
      return "That account is already used by a different ResumeLens account."
    case "unable_to_link_account":
      return "Couldn't connect that account. Please try again."
    default:
      return `Something went wrong while connecting (${code}). Please try again.`
  }
}

/** Shows the outcome of a link round trip once, then clears it from the URL. */
export function LinkResultToast({ linked, error }: { linked?: string; error?: string }) {
  const router = useRouter()

  useEffect(() => {
    if (!linked && !error) return
    if (error) {
      if (error === "access_denied") toast.info(messageForError(error))
      else toast.error(messageForError(error))
    } else if (linked && socialProviders.includes(linked as SocialProvider)) {
      toast.success(`${providerMeta[linked as SocialProvider].label} connected`)
    }
    router.replace("/settings", { scroll: false })
  }, [linked, error, router])

  return null
}
