"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ConfirmByTypingDialog } from "@/components/settings/confirm-by-typing-dialog"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"
import { analysisKeys, deleteAllResumes } from "@/lib/queries/analyses"

export function DataPrivacy() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const removeResumes = useMutation({
    mutationFn: deleteAllResumes,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: analysisKeys.all })
      router.refresh()
    },
  })

  async function deleteResumes() {
    try {
      await removeResumes.mutateAsync()
      toast.success("All your resumes and analyses are deleted")
      return true
    } catch (error) {
      // The API explains the cases it refuses, e.g. while an analysis is still running
      toast.error(error instanceof Error ? error.message : "Couldn't delete them. Try again.")
      return false
    }
  }

  async function deleteAccount() {
    const { error } = await authClient.deleteUser()
    if (error) {
      toast.error(authErrorMessage(error, "Couldn't delete your account. Sign in again and retry."))
      return false
    }
    toast.success("Your account is deleted")
    router.replace("/")
    router.refresh()
    return true
  }

  return (
    <section aria-labelledby="privacy-heading" className="rounded-xl border border-destructive/25 bg-card p-6">
      <h2 id="privacy-heading" className="text-xl font-semibold">
        Data and privacy
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">These can&apos;t be undone.</p>

      <ul className="mt-6 divide-y rounded-lg border">
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Delete all my resumes and analyses</p>
            <p className="text-sm text-muted-foreground">Your account and credits stay.</p>
          </div>
          <ConfirmByTypingDialog
            trigger="Delete data"
            title="Delete all resumes and analyses?"
            description="Every uploaded resume, its text and every report will be removed right away. Credits you spent won't come back, and analyzing the same file again costs credits again."
            word="DELETE"
            actionLabel="Delete everything"
            onConfirm={deleteResumes}
          />
        </li>
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Delete my account</p>
            <p className="text-sm text-muted-foreground">Removes your account, data and unused credits.</p>
          </div>
          <ConfirmByTypingDialog
            trigger="Delete account"
            title="Delete your account?"
            description="Your account, resumes, analyses and any unused credits will be permanently deleted."
            word="DELETE MY ACCOUNT"
            actionLabel="Delete account"
            onConfirm={deleteAccount}
          />
        </li>
      </ul>
    </section>
  )
}
