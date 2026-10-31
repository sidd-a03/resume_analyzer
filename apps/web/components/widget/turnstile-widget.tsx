"use client"

import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import { useTheme } from "next-themes"
import { useRef, useState, type Ref } from "react"

import { cn } from "@/lib/utils"

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY


export function captchaHeaders(token: string) {
  return { "x-captcha-response": token }
}

export function useTurnstile() {
  const ref = useRef<TurnstileInstance>(undefined)
  const [token, setToken] = useState<string>()
  const [needsInteraction, setNeedsInteraction] = useState(false)

  function reset() {
    setToken(undefined)
    ref.current?.reset()
  }

  return { ref, token, setToken, needsInteraction, setNeedsInteraction, reset }
}

interface TurnstileWidgetProps {
  ref: Ref<TurnstileInstance | undefined>
  onToken: (token: string | undefined) => void
  onInteractionChange?: (needsInteraction: boolean) => void
  className?: string
}

export function TurnstileWidget({ ref, onToken, onInteractionChange, className }: TurnstileWidgetProps) {
  const { resolvedTheme } = useTheme()

  if (!siteKey) {
    return <p className="text-xs text-destructive">NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.</p>
  }

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      className={cn("empty:hidden", className)}
      options={{
        appearance: "interaction-only",
        size: "flexible",
        theme: resolvedTheme === "dark" ? "dark" : "light",
      }}
      onSuccess={(token) => {
        onInteractionChange?.(false)
        onToken(token)
      }}
      onExpire={() => onToken(undefined)}
      onError={() => onToken(undefined)}
      onBeforeInteractive={() => onInteractionChange?.(true)}
    />
  )
}
