import { ArrowLeft, BadgeCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { AdjustCreditsDialog } from "@/components/admin/adjust-credits-dialog"
import { UserActions } from "@/components/admin/user-actions"
import { UserSessionsList } from "@/components/admin/user-sessions-dialog"
import { StatusBadge, TypeBadge } from "@/components/shared/analysis-badges"
import { UserAvatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { ledgerReasons, pluralCredits } from "@/constants/analysis"
import { adminAnalyses, adminLedger, userCreditBalances } from "@/constants/data"
import { getUser } from "@/lib/admin"
import { gate, userGates } from "@/lib/admin-access"
import { formatDate, formatDateTime } from "@/lib/format"
import { requireAdmin } from "@/lib/session"
import { primaryRole, roleLabels } from "@repo/permission"

export const metadata: Metadata = { title: "User" }

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

async function UserContent({ params }: { params: PageProps<"/admin/users/[id]">["params"] }) {
  const [actor, { id }] = await Promise.all([requireAdmin(), params])
  const user = await getUser(id)
  if (!user) notFound()

  const role = primaryRole(user.role)
  const gates = userGates(actor, user)
  // TODO: serve actual data from the backend
  const analyses = adminAnalyses.filter((a) => a.user.id === user.id)
  const ledger = adminLedger.filter((e) => e.user.id === user.id)
  const balance = userCreditBalances[user.id] ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size={56} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {user.name}
              {user.id === actor.id && <span className="ml-2 text-base font-normal text-muted-foreground">(you)</span>}
            </h1>
            <p className="truncate text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={role === "superadmin" ? "border-pen/40 bg-pen/10 text-pen" : undefined}>
                {roleLabels[role]}
              </Badge>
              {user.banned ? (
                <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
                  Banned{user.banExpires && ` until ${formatDate(user.banExpires)}`}
                </Badge>
              ) : (
                <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                  Active
                </Badge>
              )}
            </div>
          </div>
        </div>
        <UserActions user={user} actor={actor} variant="button" afterDelete="/admin/users" />
      </div>

      <dl className="grid gap-4 rounded-xl border bg-card p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Joined</dt>
          <dd className="mt-1 font-medium">{formatDate(user.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="mt-1 flex items-center gap-1.5 font-medium">
            {user.phoneNumber ?? "Not added"}
            {user.phoneNumberVerified && <BadgeCheck className="size-4 text-success" aria-label="Verified" />}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Credits</dt>
          <dd className="mt-1 font-mono font-medium">{pluralCredits(balance)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">User ID</dt>
          <dd className="mt-1 truncate font-mono text-xs">{user.id}</dd>
        </div>
        {user.banned && user.banReason && (
          <div className="sm:col-span-2 lg:col-span-4">
            <dt className="text-muted-foreground">Ban reason</dt>
            <dd className="mt-1">{user.banReason}</dd>
          </div>
        )}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Sessions">
          <UserSessionsList user={user} canRevoke={gates?.revoke.ok ?? false} />
        </Section>

        <Section title="Credits" action={<AdjustCreditsDialog gate={gate(actor, { credits: ["grant", "revoke"] })} email={user.email} />}>
          {ledger.length === 0 ? (
            <p className="text-sm text-muted-foreground">No credit activity. Sample data only covers a few users.</p>
          ) : (
            <ul className="flex flex-col divide-y text-sm">
              {ledger.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-muted-foreground">{formatDateTime(e.createdAt)}</span>
                  <span className="truncate">{e.note ?? ledgerReasons[e.reason]}</span>
                  <span className="font-mono font-semibold">{e.delta > 0 ? `+${e.delta}` : `−${Math.abs(e.delta)}`}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Analyses">
        {analyses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No analyses. Sample data only covers a few users.</p>
        ) : (
          <ul className="flex flex-col divide-y text-sm">
            {analyses.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <span className="min-w-0 flex-1 truncate font-medium">{a.fileName}</span>
                <TypeBadge type={a.type} />
                <StatusBadge status={a.status} />
                <span className="w-10 text-right font-mono">{a.score ?? "-"}</span>
                <span className="text-muted-foreground">{formatDate(a.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

export default function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  return (
    <div className="container-app">
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <ArrowLeft className="size-4" />
        All users
      </Link>
      <Suspense fallback={<div className="h-[32rem] animate-pulse rounded-xl border bg-card" aria-hidden="true" />}>
        <UserContent params={params} />
      </Suspense>
    </div>
  )
}
