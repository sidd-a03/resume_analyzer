"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ConfirmByTypingDialog } from "@/components/settings/confirm-by-typing-dialog"
import { deleteAllResumes } from "@/lib/actions/account"
import { authClient } from "@/lib/auth-client"
import { authErrorMessage } from "@/lib/auth-errors"

export function DataPrivacy() {
  const router = useRouter()

  async function deleteResumes() {
    try {
      await deleteAllResumes()
      toast.success("All your resumes and analyses are deleted")
      return true
    } catch {
      toast.error("Couldn't delete them. Try again.")
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
            description="Every uploaded file and every report will be removed. Credits you spent won't come back."
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
