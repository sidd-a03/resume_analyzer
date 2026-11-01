"use client"

import { Loader2, Trash2 } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

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
import { deleteAnalysis } from "@/lib/actions/analysis"

/** Delete with a confirm step. On the detail page the action redirects to /history. */
export function DeleteAnalysisButton({
  id,
  fileName,
  from,
  compact = false,
}: {
  id: string
  fileName: string
  from: "list" | "detail"
  compact?: boolean
}) {
  const [pending, startTransition] = useTransition()

  function confirm() {
    startTransition(async () => {
      try {
        await deleteAnalysis(id, from)
        toast.success("Analysis deleted")
      } catch {
        toast.error("Couldn't delete it. Try again.")
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          compact ? (
            <Button variant="ghost" size="icon-sm" aria-label={`Delete analysis of ${fileName}`} />
          ) : (
            <Button variant="outline" />
          )
        }
      >
        <Trash2 />
        {!compact && "Delete"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this analysis?</AlertDialogTitle>
          <AlertDialogDescription>
            The report for <strong className="text-foreground">{fileName}</strong> will be gone for good. Credits spent
            on it aren&apos;t refunded.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={confirm} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
