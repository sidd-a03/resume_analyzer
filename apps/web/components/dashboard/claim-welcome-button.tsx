"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Gift, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { apiClientFetch } from "@/lib/api-client"
import { creditKeys } from "@/lib/queries/credits"

export function ClaimWelcomeButton({ className }: { className?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const claim = useMutation({
    mutationFn: () => apiClientFetch<{ credits: number }>("/credits/welcome", { method: "POST" }),
    onSuccess: () => {
      toast.success("Welcome credit added. Enjoy your first full analysis!")
      void queryClient.invalidateQueries({ queryKey: creditKeys.all })
      router.refresh()
    },
    onError: (error) => toast.error(error.message),
  })

  return (
    <Button size="sm" onClick={() => claim.mutate()} disabled={claim.isPending} className={className}>
      {claim.isPending ? <Loader2 className="animate-spin" /> : <Gift />}
      Claim 1 free credit
    </Button>
  )
}
