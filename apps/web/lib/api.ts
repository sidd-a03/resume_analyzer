import { cookies } from "next/headers"
import { apiBaseURL, apiErrorMessage, type ApiEnvelope } from "@/lib/api-client"


export async function apiFetch<T>(path: string): Promise<T | null> {
  const res = await apiRequest<T>(path)
  if (res.ok) return res.data
  if (res.status === 0) throw new Error(res.message)
  return null
}

export type ApiResult<T> = 
  { ok: true; data: T } | 
  { ok: false; status: number; message: string }


export async function apiRequest<T>(
  path: string, 
  init?: { 
    method?: "GET" | "POST" | "PUT" | "DELETE"; 
    body?: unknown 
  }
): Promise<ApiResult<T>> {

  let res: Response
  try {
    res = await fetch(`${apiBaseURL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        cookie: (await cookies()).toString(),
        ...(init?.body !== undefined && { "content-type": "application/json" }),
      },
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    })
  } catch {
    return { ok: false, status: 0, message: "Couldn't reach the server. Try again in a moment." }
  }

  const body = await res.json().catch(() => null)
  
  if (!res.ok) {
    return { 
      ok: false, 
      status: res.status, 
      message: apiErrorMessage(body) ?? `Request failed (${res.status})` 
    }
  }
  return { ok: true, data: (body as ApiEnvelope<T>).data }
}
