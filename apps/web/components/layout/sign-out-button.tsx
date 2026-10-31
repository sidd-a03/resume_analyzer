"use client"

import { Loader2, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    const { error } = await authClient.signOut()
    if (error) {
      toast.error("Couldn't sign you out. Please try again.")
      setPending(false)
      return
    }
    router.replace("/")
    router.refresh()
  }

  return (
    <Button variant="ghost" size="sm" onClick={signOut} disabled={pending} className="text-muted-foreground">
      {pending ? <Loader2 className="animate-spin" /> : <LogOut />}
      Sign out
    </Button>
  )
}
