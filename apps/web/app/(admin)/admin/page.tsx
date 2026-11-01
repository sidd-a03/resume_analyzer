import { Ban, Files, ShieldAlert, UserPlus, Users } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { SignupsChart } from "@/components/admin/signups-chart"
import { StatTile } from "@/components/admin/stat-tile"
import { PageHeader } from "@/components/shared/page-header"
import { UserAvatar } from "@/components/shared/user-avatar"
import { ADMIN_STATS_LIMIT } from "@/constants/admin"
import { abuseSignals, adminAnalyses } from "@/constants/data"
import { listRecentUsers } from "@/lib/admin"
import { roleSummaries } from "@/lib/admin-access"
import { formatDate } from "@/lib/format"
import { requireAdmin } from "@/lib/session"
import { primaryRole, roleLabels } from "@repo/permission"

export const metadata: Metadata = { title: "Admin" }

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" })

async function OverviewContent() {
  const actor = await requireAdmin()
  const { users, total } = await listRecentUsers()

  const today = dayKey.format(new Date())
  const month = today.slice(0, 7)
  const newThisMonth = users.filter((u) => dayKey.format(new Date(u.createdAt)).startsWith(month)).length
  const banned = users.filter((u) => u.banned).length
  // TODO: serve actual data from the backend
  const analysesThisMonth = adminAnalyses.filter((a) => a.createdAt.startsWith(month)).length
  const role = primaryRole(actor.role)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total users" value={total} icon={Users} href="/admin/users" />
        <StatTile label="New this month" value={newThisMonth} icon={UserPlus} />
        <StatTile
          label="Banned"
          value={banned}
          icon={Ban}
          hint={total > ADMIN_STATS_LIMIT ? `Among the newest ${ADMIN_STATS_LIMIT}` : undefined}
        />
        <StatTile label="Analyses this month" value={analysesThisMonth} icon={Files} hint="Sample data" href="/admin/analyses" />
      </div>

      <SignupsChart createdAt={users.map((u) => u.createdAt)} today={today} />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <section aria-labelledby="recent-heading" className="rounded-xl border bg-card">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 id="recent-heading" className="font-semibold">
              Newest users
            </h2>
            <Link href="/admin/users" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              See all
            </Link>
          </div>
          {users.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <ul className="divide-y">
              {users.slice(0, 5).map((u) => (
                <li key={u.id}>
                  <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50">
                    <UserAvatar name={u.name} image={u.image} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="access-heading" className="rounded-xl border bg-card p-5">
            <h2 id="access-heading" className="font-semibold">
              Your access: {roleLabels[role]}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {role === "regular" ? null : roleSummaries[role]}
            </p>
          </section>

          <Link
            href="/admin/abuse"
            className="flex items-start gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-foreground/25"
          >
            <ShieldAlert className="mt-0.5 size-5 text-pen" aria-hidden="true" />
            <div>
              <p className="font-semibold">{abuseSignals.length} abuse signals to review</p>
              <p className="mt-1 text-sm text-muted-foreground">Shared phones, IPs and files across accounts.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <div className="container-app">
      <PageHeader title="Overview" description="How ResumeLens is growing, and what needs a look." />
      <div className="mt-8">
        <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
          <OverviewContent />
        </Suspense>
      </div>
    </div>
  )
}
