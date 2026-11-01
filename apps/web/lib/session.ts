import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { cache } from "react"

import type { SocialProvider } from "@/lib/auth-client"
import { primaryRole } from "@repo/permission"

const authBaseURL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/auth`

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  /** Comma-separated roles. Read it with `primaryRole`/`can` from lib/permissions. */
  role: string | null
  phoneNumber: string | null
  phoneNumberVerified: boolean | null
}

export type SessionInfo = {
  id: string
  expiresAt: string
  /** Set while an admin is impersonating this user */
  impersonatedBy: string | null
}

export const isAdmin = (user: SessionUser) => primaryRole(user.role) !== "regular"

export type LinkedAccount = {
  id: string
  providerId: SocialProvider
  accountId: string
  createdAt: string
}

export async function authFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${authBaseURL}${path}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  })
  if (!res.ok) return null
  return (await res.json()) as T | null
}

export const getSession = cache(async () => authFetch<{ user: SessionUser; session: SessionInfo }>("/get-session"))

export const getSessionUser = cache(async () => (await getSession())?.user ?? null)

export async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect("/?auth=1")
  return user
}

/** For admin pages. 404s instead of revealing the page to everyone else. */
export async function requireAdmin() {
  const user = await requireUser()
  if (!isAdmin(user)) notFound()
  return user
}

export async function listLinkedAccounts() {
  return (await authFetch<LinkedAccount[]>("/list-accounts")) ?? []
}
