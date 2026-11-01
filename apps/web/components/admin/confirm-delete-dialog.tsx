"use client"

import { Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"

import { TypeToConfirm } from "@/components/shared/type-to-confirm"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

/** Controlled delete confirmation. Mount it only while open so the typed text starts empty. */
export function ConfirmDeleteDialog({
  id,
  title,
  description,
  phrase,
  actionLabel,
  onConfirm,
  onOpenChange,
}: {
  id: string
  title: ReactNode
  description: ReactNode
  /** What has to be typed, e.g. the user's email */
  phrase: string
  actionLabel: string
  /** Resolve true to close the dialog */
  onConfirm: () => Promise<boolean>
  onOpenChange: (open: boolean) => void
}) {
  const [typed, setTyped] = useState("")
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    const done = await onConfirm()
    setPending(false)
    if (done) onOpenChange(false)
  }

  return (
    <AlertDialog open onOpenChange={(open) => !pending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <TypeToConfirm id={id} phrase={phrase} value={typed} onChange={setTyped} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={typed !== phrase || pending}>
            {pending && <Loader2 className="animate-spin" />}
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
