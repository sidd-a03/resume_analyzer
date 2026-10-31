import { Suspense } from "react"

import { SignOutButton } from "@/components/layout/sign-out-button"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Logo } from "@/components/shared/logo"
import { UserAvatar } from "@/components/shared/user-avatar"
import { requireUser } from "@/lib/session"

async function UserMenu() {
  const user = await requireUser()

  return (
    <div className="flex items-center gap-2">
      <UserAvatar name={user.name} image={user.image} />
      <span className="hidden max-w-40 truncate text-sm font-medium sm:inline">{user.name}</span>
      <SignOutButton />
    </div>
  )
}

/** Top bar for signed-in pages. Only the user menu waits for the session. */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Suspense fallback={<div className="size-8 animate-pulse rounded-full bg-muted" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
