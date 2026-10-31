import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import type { SocialProvider } from "@/lib/auth-client"

const authBaseURL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/auth`

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  createdAt: string
}

export type LinkedAccount = {
  id: string
  providerId: SocialProvider
  accountId: string
  createdAt: string
}

async function authFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${authBaseURL}${path}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  })
  if (!res.ok) return null
  return (await res.json()) as T | null
}


export const getSessionUser = cache(async () => {
  const data = await authFetch<{ user: SessionUser }>("/get-session")
  return data?.user ?? null
})


export async function requireUser() {
  const user = await getSessionUser()
  if (!user) redirect("/?auth=1")
  return user
}

export async function listLinkedAccounts() {
  return (await authFetch<LinkedAccount[]>("/list-accounts")) ?? []
}
