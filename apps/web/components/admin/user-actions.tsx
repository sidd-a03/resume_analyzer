"use client"

import {
  Ban,
  ChevronDown,
  Loader2,
  MonitorSmartphone,
  MoreHorizontal,
  ShieldCheck,
  Trash2,
  UserCheck,
  VenetianMask,
  type LucideIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { BanUserDialog } from "@/components/admin/ban-user-dialog"
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog"
import { SetRoleDialog } from "@/components/admin/set-role-dialog"
import { UserSessionsDialog } from "@/components/admin/user-sessions-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { userGates, type Actor, type Gate } from "@/lib/admin-access"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"
import type { AdminUser } from "@/lib/types"

type Dialog = "ban" | "role" | "sessions" | "delete" | null

/** A menu item that stays visible when blocked, greyed out with the reason. */
function GatedItem({
  gate,
  icon: Icon,
  label,
  destructive,
  onClick,
}: {
  gate: Gate
  icon: LucideIcon
  label: string
  destructive?: boolean
  onClick: () => void
}) {
  return (
    <DropdownMenuItem variant={destructive && gate.ok ? "destructive" : "default"} disabled={!gate.ok} onClick={onClick}>
      <Icon />
      {label}
      {!gate.ok && <span className="ml-auto pl-3 text-[11px] text-muted-foreground">{gate.reason}</span>}
    </DropdownMenuItem>
  )
}

export function UserActions({
  user,
  actor,
  variant = "icon",
  afterDelete,
}: {
  user: AdminUser
  actor: Actor
  /** `button` shows a labelled "Actions" button, for the user page */
  variant?: "icon" | "button"
  /** Where to go once the user is deleted. Refreshes the current page when unset. */
  afterDelete?: string
}) {
  const router = useRouter()
  const [dialog, setDialog] = useState<Dialog>(null)
  const [pending, setPending] = useState(false)
  const gates = userGates(actor, user)

  if (!gates) return null

  const close = (open: boolean) => !open && setDialog(null)

  async function run(action: () => Promise<{ error: { message?: string } | null }>, success: string) {
    setPending(true)
    const { error } = await action()
    setPending(false)
    if (error) {
      toast.error(authErrorMessage(error, "That didn't work. Try again."))
      return false
    }
    toast.success(success)
    return true
  }

  async function impersonate() {
    const ok = await run(() => authClient.admin.impersonateUser({ userId: user.id }), `You're now viewing as ${user.name}`)
    if (ok) {
      router.push("/dashboard")
      router.refresh()
    }
  }

  async function unban() {
    if (await run(() => authClient.admin.unbanUser({ userId: user.id }), `${user.name} is unbanned`)) router.refresh()
  }

  async function remove() {
    const ok = await run(() => authClient.admin.removeUser({ userId: user.id }), `${user.name}'s account is deleted`)
    if (ok) {
      if (afterDelete) router.push(afterDelete)
      router.refresh()
    }
    return ok
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            variant === "icon" ? (
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${user.name}`} disabled={pending} />
            ) : (
              <Button variant="outline" disabled={pending} />
            )
          }
        >
          {pending ? <Loader2 className="animate-spin" /> : variant === "icon" && <MoreHorizontal />}
          {variant === "button" && (
            <>
              Actions
              <ChevronDown />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {variant === "icon" && (
            <GatedItem gate={gates.sessions} icon={MonitorSmartphone} label="Sessions" onClick={() => setDialog("sessions")} />
          )}
          <GatedItem gate={gates.setRole} icon={ShieldCheck} label="Change role" onClick={() => setDialog("role")} />
          {!user.banned && <GatedItem gate={gates.impersonate} icon={VenetianMask} label="Impersonate" onClick={impersonate} />}
          {user.banned ? (
            <GatedItem gate={gates.ban} icon={UserCheck} label="Unban" onClick={unban} />
          ) : (
            <GatedItem gate={gates.ban} icon={Ban} label="Ban" destructive onClick={() => setDialog("ban")} />
          )}
          <DropdownMenuSeparator />
          <GatedItem gate={gates.remove} icon={Trash2} label="Delete user" destructive onClick={() => setDialog("delete")} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mounted only while open, so each one starts with fresh state */}
      {dialog === "ban" && <BanUserDialog user={user} open onOpenChange={close} />}
      {dialog === "role" && <SetRoleDialog user={user} open onOpenChange={close} />}
      {dialog === "sessions" && <UserSessionsDialog user={user} canRevoke={gates.revoke.ok} open onOpenChange={close} />}
      {dialog === "delete" && (
        <ConfirmDeleteDialog
          id={`delete-${user.id}`}
          title={<>Delete {user.name}&apos;s account?</>}
          description="Their account, sessions and linked sign-ins are removed for good. This can't be undone."
          phrase={user.email}
          actionLabel="Delete user"
          onConfirm={remove}
          onOpenChange={close}
        />
      )}
    </>
  )
}
