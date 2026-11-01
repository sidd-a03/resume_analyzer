"use client"

import { Loader2 } from "lucide-react"
import { useState, type ReactNode } from "react"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { TypeToConfirm } from "@/components/shared/type-to-confirm"


export function ConfirmByTypingDialog({
  trigger,
  title,
  description,
  word,
  actionLabel,
  onConfirm,
}: {
  trigger: string
  title: string
  description: ReactNode
  word: string
  actionLabel: string
  onConfirm: () => Promise<boolean>
}) {
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [pending, setPending] = useState(false)

  async function confirm() {
    setPending(true)
    const done = await onConfirm()
    setPending(false)
    if (done) setOpen(false)
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setTyped("")
      }}
    >
      <AlertDialogTrigger render={<Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" />}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <TypeToConfirm id={`confirm-${word}`} phrase={word} value={typed} onChange={setTyped} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" disabled={typed !== word || pending} onClick={confirm}>
            {pending && <Loader2 className="animate-spin" />}
            {actionLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
