"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { AdminUser } from "@/lib/types"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"
import { primaryRole, roleLabels, type Role } from "@repo/permission"

const descriptions: Record<Role, string> = {
  regular: "Uses the app. No admin access.",
  admin: "Can list users, ban them and revoke their sessions.",
  superadmin: "Everything, including roles, impersonation and deleting users.",
}

export function SetRoleDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const current = primaryRole(user.role)
  const [role, setRole] = useState<Role>(current)
  const [pending, setPending] = useState(false)

  async function save() {
    setPending(true)
    const { error } = await authClient.admin.setRole({ userId: user.id, role })
    setPending(false)
    if (error) {
      toast.error(authErrorMessage(error, "Couldn't change the role."))
      return
    }
    toast.success(`${user.name}'s role is now ${roleLabels[role]}`)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>
        <RadioGroup value={role} onValueChange={(v) => setRole(v as Role)} aria-label="Role" className="gap-2">
          {(Object.keys(roleLabels) as Role[]).map((r) => (
            <Label
              key={r}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 font-normal has-data-checked:border-foreground"
            >
              <RadioGroupItem value={r} className="mt-0.5" />
              <span>
                <span className="font-medium">{roleLabels[r]}</span>
                <span className="block text-sm text-muted-foreground">{descriptions[r]}</span>
              </span>
            </Label>
          ))}
        </RadioGroup>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} disabled={pending || role === current}>
            {pending && <Loader2 className="animate-spin" />}
            Save role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
