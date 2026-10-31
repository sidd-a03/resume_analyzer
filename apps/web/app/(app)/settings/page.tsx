import type { Metadata } from "next"
import { Suspense } from "react"

import { ConnectedAccounts } from "@/components/settings/connected-accounts"
import { LinkResultToast } from "@/components/settings/link-result-toast"
import { ProfileCard } from "@/components/settings/profile-card"
import { listLinkedAccounts, requireUser } from "@/lib/session"

export const metadata: Metadata = { title: "Settings" }

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

async function SettingsContent({ searchParams }: { searchParams: PageProps<"/settings">["searchParams"] }) {
  const [user, accounts, params] = await Promise.all([requireUser(), listLinkedAccounts(), searchParams])

  return (
    <div className="flex flex-col gap-6">
      <LinkResultToast linked={first(params.linked)} error={first(params.error)} />
      <ProfileCard user={user} />
      <ConnectedAccounts accounts={accounts} />
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="h-40 animate-pulse rounded-xl border bg-card" />
      <div className="h-64 animate-pulse rounded-xl border bg-card" />
    </div>
  )
}

export default function SettingsPage({ searchParams }: PageProps<"/settings">) {
  return (
    <div className="container-page max-w-3xl py-10 lg:py-14">
      <h1 className="text-[clamp(2rem,4vw,2.6rem)] leading-tight font-semibold tracking-[-0.015em]">Settings</h1>
      <p className="mt-2 text-muted-foreground">Manage your profile and how you sign in.</p>

      <div className="mt-8">
        {/* Everything that reads the session streams in here; the heading above is prerendered. */}
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
