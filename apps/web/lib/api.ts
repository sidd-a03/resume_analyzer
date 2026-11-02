import { cookies } from "next/headers"

import { apiBaseURL, type ApiEnvelope } from "@/lib/api-client"


export async function apiFetch<T>(path: string): Promise<T | null> {

  const res = await fetch(`${apiBaseURL}${path}`, {
    headers: { cookie: (await cookies()).toString() },
    cache: "no-store",
  })

  if (!res.ok) return null
  return ((await res.json()) as ApiEnvelope<T>).data
}
