"use client"

import { AlertCircle, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { OAuthButton } from "@/components/auth/oauth-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { captchaHeaders, TurnstileWidget, useTurnstile } from "@/components/widget/turnstile-widget"
import { authClient, socialProviders, type SocialProvider } from "@/lib/auth-client"

type Notice = { title: string; description: string; tone: "info" | "error" }

/** Turns better-auth's OAuth callback `error` code into something a person can act on. */
function noticeForErrorCode(code: string): Notice {
  if (code === "access_denied") {
    return {
      title: "Sign-in cancelled",
      description: "No problem. Pick a provider whenever you're ready.",
      tone: "info",
    }
  }
  return {
    title: "Sign-in didn't finish",
    description: `Something went wrong on the way back from the provider (${code}). Please try again.`,
    tone: "error",
  }
}

/** Provider buttons, error state and small print. Shared by the dialog and the drawer. */
export function AuthOptions({ callbackPath = "/dashboard", errorCode }: { callbackPath?: string; errorCode?: string }) {
  const [pending, setPending] = useState<SocialProvider | null>(null)
  const [notice, setNotice] = useState<Notice | null>(errorCode ? noticeForErrorCode(errorCode) : null)
  const [lastUsed] = useState(() => authClient.getLastUsedLoginMethod())
  const { ref: captchaRef, token, setToken, needsInteraction, setNeedsInteraction, reset: resetCaptcha } = useTurnstile()

  async function signIn(provider: SocialProvider) {
    if (!token) return
    setPending(provider)
    setNotice(null)

    // The API verifies the Turnstile token before starting OAuth.
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: new URL(callbackPath, window.location.origin).toString(),
      fetchOptions: { headers: captchaHeaders(token) },
    })

    // On success the browser is redirected to the provider, so we only land here on failure.
    if (error) {
      resetCaptcha()
      setNotice({
        title: "Couldn't start sign-in",
        description: `${error.message ?? "Something went wrong."} Please try again, or pick another provider.`,
        tone: "error",
      })
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {socialProviders.map((provider) => (
        <OAuthButton
          key={provider}
          provider={provider}
          loading={pending === provider}
          disabled={pending !== null || !token}
          lastUsed={lastUsed === provider}
          onClick={signIn}
        />
      ))}

      <TurnstileWidget
        ref={captchaRef}
        onToken={setToken}
        onInteractionChange={setNeedsInteraction}
      />
      {!token && (
        <p role="status" className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          {needsInteraction ? (
            "Please complete the quick check above to continue."
          ) : (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Running a quick security check…
            </>
          )}
        </p>
      )}

      {notice && (
        <Alert variant={notice.tone === "error" ? "destructive" : "default"} className="mt-1">
          {notice.tone === "error" ? <AlertCircle /> : <Info />}
          <AlertTitle>{notice.title}</AlertTitle>
          <AlertDescription>{notice.description}</AlertDescription>
        </Alert>
      )}

      <p className="mt-2 text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms" className="font-medium text-foreground underline-offset-4 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-foreground underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
