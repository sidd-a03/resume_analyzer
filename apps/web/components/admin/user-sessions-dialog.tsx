"use client"

import { Loader2, Monitor } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { AdminUser } from "@/lib/types"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"
import { formatDateTime } from "@/lib/format"

type UserSession = {
  id: string
  token: string
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: Date | string
  expiresAt: Date | string
  impersonatedBy?: string | null
}

const iso = (value: Date | string) => new Date(value).toISOString()

/** A readable "Chrome on Linux" from a user agent, falling back to the raw string. */
function describeAgent(ua: string | null | undefined) {
  if (!ua) return "Unknown device"
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : null
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : null
  return browser && os ? `${browser} on ${os}` : ua.slice(0, 60)
}

/** Loads a user's sessions on mount, with revoke buttons when allowed. */
export function UserSessionsList({ user, canRevoke }: { user: Pick<AdminUser, "id" | "name">; canRevoke: boolean }) {
  const [sessions, setSessions] = useState<UserSession[] | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    authClient.admin.listUserSessions({ userId: user.id }).then(({ data, error }) => {
      if (cancelled) return
      if (error) toast.error(authErrorMessage(error, "Couldn't load sessions."))
      setSessions((data?.sessions as UserSession[] | undefined) ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [user.id])

  async function revoke(session: UserSession) {
    setBusy(session.id)
    const { error } = await authClient.admin.revokeUserSession({ sessionToken: session.token })
    setBusy(null)
    if (error) return toast.error(authErrorMessage(error, "Couldn't revoke that session."))
    setSessions((list) => list?.filter((s) => s.id !== session.id) ?? null)
    toast.success("Session revoked")
  }

  async function revokeAll() {
    setBusy("all")
    const { error } = await authClient.admin.revokeUserSessions({ userId: user.id })
    setBusy(null)
    if (error) return toast.error(authErrorMessage(error, "Couldn't revoke sessions."))
    setSessions([])
    toast.success(`${user.name} is signed out everywhere`)
  }

  if (sessions === null) {
    return (
      <div className="grid h-24 place-items-center" role="status">
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-label="Loading sessions" />
      </div>
    )
  }

  if (sessions.length === 0) return <p className="py-6 text-center text-sm text-muted-foreground">No active sessions.</p>

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex max-h-80 flex-col divide-y overflow-y-auto rounded-lg border">
        {sessions.map((s) => (
          <li key={s.id} className="flex items-center gap-3 p-3">
            <Monitor className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="flex items-center gap-2 font-medium">
                {describeAgent(s.userAgent)}
                {s.impersonatedBy && <Badge variant="outline">Impersonation</Badge>}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {s.ipAddress ?? "no IP"} · since {formatDateTime(iso(s.createdAt))} · ends {formatDateTime(iso(s.expiresAt))}
              </p>
            </div>
            {canRevoke && (
              <Button variant="outline" size="sm" onClick={() => revoke(s)} disabled={busy !== null}>
                {busy === s.id && <Loader2 className="animate-spin" />}
                Revoke
              </Button>
            )}
          </li>
        ))}
      </ul>
      {canRevoke && (
        <Button variant="destructive" className="self-end" onClick={revokeAll} disabled={busy !== null}>
          {busy === "all" && <Loader2 className="animate-spin" />}
          Sign out everywhere
        </Button>
      )}
    </div>
  )
}

export function UserSessionsDialog({
  user,
  canRevoke,
  open,
  onOpenChange,
}: {
  user: AdminUser
  canRevoke: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sessions</DialogTitle>
          <DialogDescription>Devices where {user.name} is signed in.</DialogDescription>
        </DialogHeader>
        <UserSessionsList user={user} canRevoke={canRevoke} />
      </DialogContent>
    </Dialog>
  )
}
