import type { ReactNode } from "react"

import { LogoMark } from "@/components/shared/logo"
import { brand } from "@/constants/brand"

export const authTitle = `Welcome to ${brand.name}`
export const authSubtitle = "Sign in or create an account. Your first analysis is free."

/** Logo above a title/description pair. Pass Dialog/Drawer primitives so they stay accessible. */
export function AuthHeader({ title, description }: { title: ReactNode; description: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <LogoMark className="size-11" />
      <div className="flex flex-col gap-1.5">
        {title}
        {description}
      </div>
    </div>
  )
}
