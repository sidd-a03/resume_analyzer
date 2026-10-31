"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { AuthTrigger } from "@/components/auth/auth-trigger"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

/** "Sign in" + "Get started" for visitors, "Go to dashboard" once signed in. */
export function NavActions({ stacked = false, onAction }: { stacked?: boolean; onAction?: () => void }) {
  const { data: session } = authClient.useSession()
  const size = stacked ? "lg" : "default"

  if (session) {
    return (
      <Link
        href="/dashboard"
        onClick={onAction}
        className={cn(buttonVariants({ size }), stacked ? "h-11 w-full" : "h-9 px-4")}
      >
        Go to dashboard
        <ArrowRight data-icon="inline-end" />
      </Link>
    )
  }

  return (
    <div className={cn("flex gap-2", stacked ? "flex-col" : "items-center")}>
      <AuthTrigger variant="ghost" size={size} onClick={onAction} className={stacked ? "h-11 w-full" : "h-9 px-3.5"}>
        Sign in
      </AuthTrigger>
      <AuthTrigger
        size={size}
        onClick={onAction}
        className={cn("hover:bg-primary/85", stacked ? "h-11 w-full" : "h-9 px-4")}
      >
        Get started
      </AuthTrigger>
    </div>
  )
}
