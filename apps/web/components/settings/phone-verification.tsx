"use client"

import { BadgeCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ClaimWelcomeButton } from "@/components/dashboard/claim-welcome-button"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { captchaHeaders, TurnstileWidget, useTurnstile } from "@/components/widget/turnstile-widget"
import { authClient } from "@/lib/auth-client"
import { countryOptions, nationalPhoneSchema, type SupportedCountry } from "@repo/validation"
import { authErrorMessage } from "@/lib/auth-errors"

const RESEND_AFTER = 30

const countryItems = countryOptions.map((c) => ({ value: c.code, label: `${c.flag} ${c.callingCode}` }))

function maskPhone(phone: string) {
  return `${phone.slice(0, 5)} •••• ${phone.slice(-2)}`
}

export function PhoneVerification({
  verifiedNumber,
  welcomeClaimed,
}: {
  verifiedNumber: string | null
  welcomeClaimed: boolean
}) {
  const router = useRouter()
  const { ref: captchaRef, token, setToken, reset: resetCaptcha } = useTurnstile()
  const [country, setCountry] = useState<SupportedCountry>(countryOptions[0]!.code)
  const [digits, setDigits] = useState("")
  const [touched, setTouched] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [busy, setBusy] = useState<"send" | "verify" | null>(null)

  const counting = cooldown > 0
  // The same schema the API checks, so a number that passes here isn't rejected there
  const parsed = nationalPhoneSchema.safeParse({ country, number: digits })
  useEffect(() => {
    if (!counting) return
    const timer = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [counting])

  async function sendCode(phoneNumber: string) {
    if (!token) return
    setBusy("send")
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber,
      fetchOptions: { headers: captchaHeaders(token) },
    })
    resetCaptcha() // tokens are single-use
    setBusy(null)

    if (error) {
      toast.error(authErrorMessage(error, "Couldn't send the code. Try again."))
      return
    }
    setSentTo(phoneNumber)
    setCode("")
    setCooldown(RESEND_AFTER)
    toast.success(`Code sent to ${maskPhone(phoneNumber)}`)
  }

  async function verify(value: string) {
    if (!sentTo) return
    setBusy("verify")
    const { error } = await authClient.phoneNumber.verify({ phoneNumber: sentTo, code: value, updatePhoneNumber: true })
    setBusy(null)

    if (error) {
      setCode("")
      toast.error(authErrorMessage(error, "That code didn't work."))
      return
    }
    toast.success("Phone number verified")
    router.refresh()
  }

  return (
    <section id="phone" aria-labelledby="phone-heading" className="scroll-mt-24 rounded-xl border bg-card p-6">
      <h2 id="phone-heading" className="text-xl font-semibold">
        Phone verification
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Verify your mobile number to claim your free welcome credit. One number per account.
      </p>

      {verifiedNumber ? (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-mono text-sm">
            <BadgeCheck className="size-5 text-success" aria-hidden="true" />
            {maskPhone(verifiedNumber)}
            <span className="font-sans text-success">Verified</span>
          </p>
          {!welcomeClaimed && <ClaimWelcomeButton />}
        </div>
      ) : sentTo === null ? (
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (parsed.success) sendCode(parsed.data)
          }}
        >
          <div>
            <Label htmlFor="phone-input">Mobile number</Label>
            <div className="mt-2 flex max-w-xs items-center overflow-hidden rounded-lg border bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              {countryItems.length === 1 ? (
                <span className="flex shrink-0 items-center gap-1.5 self-stretch whitespace-nowrap border-r px-3 font-mono text-sm text-muted-foreground">
                  {countryItems[0]!.label}
                </span>
              ) : (
                <Select items={countryItems} value={country} onValueChange={(value) => setCountry(value as SupportedCountry)}>
                  <SelectTrigger aria-label="Country" className="shrink-0 rounded-none border-0 border-r font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Input
                id="phone-input"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="98765 43210"
                value={digits}
                onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, 15))}
                onBlur={() => setTouched(true)}
                className="border-0 font-mono focus-visible:ring-0"
                aria-invalid={touched && digits.length > 0 && !parsed.success}
              />
            </div>
          </div>
          <TurnstileWidget ref={captchaRef} onToken={setToken} className="max-w-xs" />
          <Button type="submit" className="self-start" disabled={!parsed.success || !token || busy !== null}>
            {busy === "send" && <Loader2 className="animate-spin" />}
            {token ? "Send code" : "Checking you're human…"}
          </Button>
        </form>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="otp">Enter the 6-digit code sent to {maskPhone(sentTo)}</Label>
            <InputOTP
              id="otp"
              maxLength={6}
              value={code}
              onChange={setCode}
              onComplete={verify}
              disabled={busy === "verify"}
              containerClassName="mt-3"
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }, (_, i) => (
                  <InputOTPSlot key={i} index={i} className="size-11 font-mono text-base" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* A resend needs a fresh captcha token */}
          <TurnstileWidget ref={captchaRef} onToken={setToken} className="max-w-xs" />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={counting || !token || busy !== null}
              onClick={() => sendCode(sentTo)}
            >
              {busy === "send" && <Loader2 className="animate-spin" />}
              {counting ? `Resend in 0:${String(cooldown).padStart(2, "0")}` : "Resend code"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSentTo(null)} disabled={busy !== null}>
              Change number
            </Button>
            {busy === "verify" && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Verifying" />}
          </div>
        </div>
      )}
    </section>
  )
}
