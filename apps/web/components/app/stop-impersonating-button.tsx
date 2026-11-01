"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"

export function StopImpersonatingButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function stop() {
    setPending(true)
    const { error } = await authClient.admin.stopImpersonating()
    if (error) {
      setPending(false)
      toast.error(authErrorMessage(error, "Couldn't switch back. Sign out and in again."))
      return
    }
    router.push("/admin/users")
    router.refresh()
  }

  return (
    <Button size="sm" variant="outline" onClick={stop} disabled={pending} className="h-7 border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background">
      {pending && <Loader2 className="animate-spin" />}
      Switch back
    </Button>
  )
}
