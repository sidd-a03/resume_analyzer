"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdminUser } from "@/lib/types"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"

const DAY = 60 * 60 * 24
// The API sets defaultBanExpiresIn, so a ban without a duration still expires. No "forever" option.
const durations = [
  { value: String(DAY), label: "1 day" },
  { value: String(7 * DAY), label: "7 days" },
  { value: String(30 * DAY), label: "30 days" },
  { value: String(365 * DAY), label: "1 year" },
]

export function BanUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState(durations[1]!.value)
  const [pending, setPending] = useState(false)

  async function ban() {
    setPending(true)
    const { error } = await authClient.admin.banUser({
      userId: user.id,
      banReason: reason.trim() || undefined,
      banExpiresIn: Number(duration),
    })
    setPending(false)
    if (error) {
      toast.error(authErrorMessage(error, "Couldn't ban this user."))
      return
    }
    toast.success(`${user.name} is banned and signed out everywhere`)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban {user.name}?</DialogTitle>
          <DialogDescription>
            They&apos;ll be signed out of every device and can&apos;t sign in until the ban ends.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ban-reason">Reason (shown to them)</Label>
            <Input
              id="ban-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Spamming"
              maxLength={200}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Duration</Label>
            <Select items={durations} value={duration} onValueChange={(v) => v && setDuration(v)}>
              <SelectTrigger aria-label="Ban duration" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durations.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={ban} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Ban user
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
