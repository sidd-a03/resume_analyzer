import type { Metadata } from "next"
import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { AppearanceCard } from "@/components/settings/appearance-card"
import { ConnectedAccounts } from "@/components/settings/connected-accounts"
import { DataPrivacy } from "@/components/settings/data-privacy"
import { LinkResultToast } from "@/components/settings/link-result-toast"
import { PhoneVerification } from "@/components/settings/phone-verification"
import { ProfileCard } from "@/components/settings/profile-card"
import { onboarding } from "@/constants/data"
import { listLinkedAccounts, requireUser } from "@/lib/session"
import { first } from "@/lib/utils"

export const metadata: Metadata = { title: "Settings" }

async function SettingsContent({ searchParams }: { searchParams: PageProps<"/settings">["searchParams"] }) {
  const [user, accounts, params] = await Promise.all([requireUser(), listLinkedAccounts(), searchParams])

  return (
    <div className="flex flex-col gap-6">
      <LinkResultToast linked={first(params.linked)} provider={first(params.provider)} error={first(params.error)} />
      <ProfileCard user={user} />
      <ConnectedAccounts accounts={accounts} />
      <PhoneVerification
        verifiedNumber={user.phoneNumberVerified ? user.phoneNumber : null}
        welcomeClaimed={onboarding.welcomeClaimed} // TODO: serve actual data from the backend
      />
      <AppearanceCard />
      <DataPrivacy />
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
    <div className="container-app max-w-3xl">
      <PageHeader title="Settings" description="Manage your profile, how you sign in, and your data." />

      <div className="mt-8 flex flex-col gap-6">
        {/* Everything that reads the session streams in here; the heading above is prerendered. */}
        <Suspense fallback={<SettingsSkeleton />}>
          <SettingsContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
