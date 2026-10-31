"use client"

import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { providerMeta } from "@/components/auth/provider-meta"
import { Button } from "@/components/ui/button"
import { authClient, socialProviders, type SocialProvider } from "@/lib/auth-client"
import type { LinkedAccount } from "@/lib/session"

const addedOn = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" })

/** Lists Google/GitHub with Connect or Disconnect. The API refuses to unlink the last account. */
export function ConnectedAccounts({ accounts }: { accounts: LinkedAccount[] }) {
  const router = useRouter()
  const [pending, setPending] = useState<SocialProvider | null>(null)
  const isLastAccount = accounts.length <= 1

  async function connect(provider: SocialProvider) {
    setPending(provider)
    const settingsURL = new URL("/settings", window.location.origin)

    const { error } = await authClient.linkSocial({
      provider,
      callbackURL: `${settingsURL}?linked=${provider}`,
      errorCallbackURL: settingsURL.toString(),
    })
    if (error) {
      toast.error(error.message ?? "Couldn't start connecting. Please try again.")
      setPending(null)
    }
  }

  async function disconnect(provider: SocialProvider, account: LinkedAccount) {
    setPending(provider)
    const { error } = await authClient.unlinkAccount({ accountId: account.id })
    setPending(null)
    if (error) {
      toast.error(error.message ?? "Couldn't disconnect. Please try again.")
      return
    }
    toast.success(`${providerMeta[provider].label} disconnected`)
    router.refresh()
  }

  return (
    <section aria-labelledby="accounts-heading" className="rounded-xl border bg-card p-6">
      <h2 id="accounts-heading" className="text-xl font-semibold">
        Connected accounts
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Connect both so you can sign in with either one, even if they use different emails.
      </p>

      <ul className="mt-6 divide-y rounded-lg border">
        {socialProviders.map((provider) => {
          const { label, Icon } = providerMeta[provider]
          const account = accounts.find((a) => a.providerId === provider)
          const busy = pending === provider

          return (
            <li key={provider} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border bg-background">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium">{label}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {account ? `Connected on ${addedOn.format(new Date(account.createdAt))}` : "Not connected"}
                  </p>
                </div>
              </div>

              {account ? (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending !== null || isLastAccount}
                  title={isLastAccount ? "You need at least one way to sign in" : undefined}
                  onClick={() => disconnect(provider, account)}
                >
                  {busy && <Loader2 className="animate-spin" />}
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" disabled={pending !== null} onClick={() => connect(provider)}>
                  {busy && <Loader2 className="animate-spin" />}
                  Connect
                </Button>
              )}
            </li>
          )
        })}
      </ul>

      {isLastAccount && (
        <p className="mt-3 text-xs text-muted-foreground">
          You can&apos;t disconnect your only sign-in method. Connect another one first.
        </p>
      )}
    </section>
  )
}
