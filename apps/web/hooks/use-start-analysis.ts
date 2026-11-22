"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ApiError } from "@/lib/api-client"
import { analysisKeys, startAnalysis } from "@/lib/queries/analyses"
import { creditKeys } from "@/lib/queries/credits"

/**
 * Starts an analysis and opens it. The API decides the price and checks the balance; this only turns its
 * answers into the right UI:
 *  - 402 not enough credits: the page's balance or price was out of date, so refresh it and offer to buy
 *  - 404 / 410 the resume is gone (expired or deleted): `onResumeGone` clears it so the user uploads again
 *  - anything else: the API's message (daily preview limit, rate limit, …)
 */
export function useStartAnalysis({ onResumeGone }: { onResumeGone?: () => void } = {}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: startAnalysis,
    
    onSuccess: (analysis) => {
      void queryClient.invalidateQueries({ queryKey: creditKeys.all })
      void queryClient.invalidateQueries({ queryKey: analysisKeys.all })
      if (analysis.reused) toast.info("You already had this analysis, so it was free.")
      router.push(`/analyses/${analysis.id}`)
    },

    onError: (error) => {
      if (!(error instanceof ApiError)) {
        toast.error("Something went wrong. Try again.")
        return
      }
      if (error.status === 402) {
        router.refresh()
        toast.error(error.message, { action: { label: "Buy credits", onClick: () => router.push("/credits") } })
        return
      }
      if (error.status === 404 || error.status === 410) onResumeGone?.()
      if (error.status === 401) {
        toast.error("Your session expired. Sign in again to continue.")
        return
      }
      toast.error(error.message)
    },
  })
}
