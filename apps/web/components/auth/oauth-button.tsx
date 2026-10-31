"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { providerMeta } from "@/components/auth/provider-meta"
import type { SocialProvider } from "@/lib/auth-client"

interface OAuthButtonProps {
  provider: SocialProvider
  loading: boolean
  disabled: boolean
  lastUsed?: boolean
  onClick: (provider: SocialProvider) => void
}

export function OAuthButton({ provider, loading, disabled, lastUsed = false, onClick }: OAuthButtonProps) {
  const { label, Icon } = providerMeta[provider]

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={disabled}
        aria-busy={loading}
        aria-describedby={lastUsed ? `${provider}-last-used` : undefined}
        onClick={() => onClick(provider)}
        className="h-11 w-full justify-center gap-3 rounded-xl bg-card text-[0.95rem] hover:border-foreground/30"
      >
        {loading ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
        Continue with {label}
      </Button>

      {/* Always-visible tooltip bubble, so it also works on touch screens */}
      {lastUsed && (
        <span
          id={`${provider}-last-used`}
          className="pointer-events-none absolute -top-2.5 right-3 rounded-md bg-foreground px-2 py-0.5 text-[11px] leading-4 font-medium text-background shadow-sm after:absolute after:top-full after:right-3 after:border-4 after:border-transparent after:border-t-foreground"
        >
          Last used
        </span>
      )}
    </div>
  )
}
