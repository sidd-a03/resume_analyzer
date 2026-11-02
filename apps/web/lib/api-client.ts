export const apiBaseURL = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api`

export type ApiEnvelope<T> = { 
  statusCode: number; 
  success: boolean; 
  message: string; 
  data: T 
}


export async function apiClientFetch<T>(path: string): Promise<T> {

  const res = await fetch(`${apiBaseURL}${path}`, { credentials: "include" })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null
    
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message
    throw new Error(message ?? `Request failed (${res.status})`)
  }

  return ((await res.json()) as ApiEnvelope<T>).data
}
