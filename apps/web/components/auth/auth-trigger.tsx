"use client"

import Link from "next/link"
import type { ComponentProps } from "react"

import { useAuthDialog } from "@/components/auth/auth-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

/**
 * Any "Sign in" / "Get started" button. Visitors get the shared auth dialog; signed-in users get a
 * link to `signedInHref` instead (same look), so a CTA never asks someone to sign in twice.
 */
export function AuthTrigger({
  onClick,
  signedInHref = "/dashboard",
  variant,
  size,
  className,
  children,
  ...props
}: ComponentProps<typeof Button> & { signedInHref?: string }) {
  const { data: session } = authClient.useSession()
  const { openAuth } = useAuthDialog()

  if (session) {
    return (
      <Link href={signedInHref} className={cn(buttonVariants({ variant, size }), className)}>
        {children}
      </Link>
    )
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        openAuth()
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
