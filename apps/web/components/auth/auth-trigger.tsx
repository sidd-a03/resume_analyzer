"use client"

import type { ComponentProps } from "react"

import { useAuthDialog } from "@/components/auth/auth-dialog"
import { Button } from "@/components/ui/button"

/** Any "Sign in" / "Get started" button. Opens the shared auth dialog. */
export function AuthTrigger({ onClick, ...props }: ComponentProps<typeof Button>) {
  const { openAuth } = useAuthDialog()

  return (
    <Button
      type="button"
      onClick={(event) => {
        onClick?.(event)
        openAuth()
      }}
      {...props}
    />
  )
}
