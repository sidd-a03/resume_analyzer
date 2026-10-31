"use client"

import Link from "next/link"

import { AuthTrigger } from "@/components/auth/auth-trigger"
import { buttonVariants } from "@/components/ui/button"
import type { CreditPack } from "@/constants/pricing"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"


export function PricingAction({ pack, featured }: { pack: CreditPack; featured: boolean }) {
  const { data: session } = authClient.useSession()
  const variant = featured ? "default" : "outline"
  const className = "h-11 w-full rounded-lg"

  if (session) {
    return (
      <Link href={`/credits?pack=${pack.id}`} className={cn(buttonVariants({ size: "lg", variant }), className)}>
        Buy {pack.name}
      </Link>
    )
  }

  return (
    <AuthTrigger size="lg" variant={variant} className={className}>
      Get {pack.name}
    </AuthTrigger>
  )
}
