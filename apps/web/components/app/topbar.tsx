import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { CreditChip } from "@/components/app/credit-chip"
import { TopbarTitle } from "@/components/app/topbar-title"
import { UserMenu } from "@/components/app/user-menu"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { isAdmin, requireUser } from "@/lib/session"
import { primaryRole, roleLabels } from "@repo/permission"

async function AccountMenu({ area }: { area: "app" | "admin" }) {
  const user = await requireUser()
  return <UserMenu name={user.name} email={user.email} image={user.image} isAdmin={isAdmin(user)} area={area} />
}

/** Only admins get a way into the panel from the app. */
async function AdminLink() {
  const user = await requireUser()
  if (!isAdmin(user)) return null
  return (
    <Link href="/admin" aria-label="Admin panel" className={buttonVariants({ variant: "outline", size: "sm" })}>
      <ShieldCheck />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  )
}

/** Reminds admins which powers they have, since admin and superadmin see different actions. */
async function RoleBadge() {
  const user = await requireUser()
  const role = primaryRole(user.role)
  return (
    <Badge variant="outline" className={role === "superadmin" ? "border-pen/40 bg-pen/10 text-pen" : undefined}>
      {roleLabels[role]}
    </Badge>
  )
}

/** Sticky bar above every app and admin page. Only the chip, badge and menu wait for the session. */
export function Topbar({ area = "app" }: { area?: "app" | "admin" }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />
      <Suspense fallback={null}>
        <TopbarTitle />
      </Suspense>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {area === "app" ? (
          <>
            <Suspense fallback={null}>
              <AdminLink />
            </Suspense>
            <CreditChip />
          </>
        ) : (
          <Suspense fallback={null}>
            <RoleBadge />
          </Suspense>
        )}
        <ThemeToggle />
        <Suspense fallback={<div className="size-8 animate-pulse rounded-full bg-muted" aria-hidden="true" />}>
          <AccountMenu area={area} />
        </Suspense>
      </div>
    </header>
  )
}
