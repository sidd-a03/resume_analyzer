import { apiBaseURL } from "@/constants/api"

export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}


export function apiErrorMessage(body: unknown): string | null {
  const raw = (body as { message?: unknown } | null)?.message
  const message = Array.isArray(raw) ? raw[0] : raw

  if (typeof message !== "string") return null

  if (message.startsWith("ThrottlerException")) return "You're going a bit fast. Wait a minute and try again."
  return message
}

const OFFLINE_MESSAGE = "Couldn't reach the server. Check your connection and try again."

export async function apiClientFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBaseURL}${path}`, { ...init, credentials: "include" })
  } catch {
    throw new ApiError(0, OFFLINE_MESSAGE)
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, apiErrorMessage(body) ?? `Request failed (${res.status})`)
  }

  return ((await res.json()) as ApiEnvelope<T>).data
}

/**
 * Sends a file straight from the browser to the API. Uses XMLHttpRequest because fetch can't report
 * upload progress. `onProgress` gets 0..1 while the bytes go up; at 1 the API is still checking the file.
 */

export function apiClientUpload<T>(path: string, body: FormData, onProgress?: (fraction: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open("POST", `${apiBaseURL}${path}`)
    xhr.withCredentials = true
    xhr.responseType = "json"
    xhr.timeout = 120_000

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }

    xhr.onload = () => {
      const response = xhr.response as ApiEnvelope<T> | null
      if (xhr.status >= 200 && xhr.status < 300 && response) resolve(response.data)
      else reject(new ApiError(xhr.status, apiErrorMessage(response) ?? `Upload failed (${xhr.status})`))
    }
    
    xhr.onerror = () => reject(new ApiError(0, OFFLINE_MESSAGE))
    xhr.ontimeout = () => reject(new ApiError(0, "The upload took too long. Check your connection and try again."))

    xhr.send(body)
  })
}
