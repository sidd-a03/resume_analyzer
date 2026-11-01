"use client"

import { LayoutDashboard, LogOut, Settings, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { UserAvatar } from "@/components/shared/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"

export function UserMenu({
  name,
  email,
  image,
  isAdmin,
  area,
}: {
  name: string
  email: string
  image: string | null
  isAdmin: boolean
  /** Which part of the site the menu sits in, so it links to the other one */
  area: "app" | "admin"
}) {
  const router = useRouter()

  async function signOut() {
    const { error } = await authClient.signOut()
    if (error) {
      toast.error("Couldn't sign you out. Please try again.")
      return
    }
    router.replace("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="flex cursor-pointer items-center gap-2 rounded-full p-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-lg sm:py-1 sm:pr-2.5 sm:pl-1 sm:hover:bg-muted"
      >
        <UserAvatar name={name} image={image} />
        <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">{name}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="truncate text-sm font-medium text-foreground">{name}</span>
            <span className="truncate font-normal">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {isAdmin &&
          (area === "app" ? (
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <ShieldCheck />
              Admin panel
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              <LayoutDashboard />
              Back to app
            </DropdownMenuItem>
          ))}
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={signOut}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
