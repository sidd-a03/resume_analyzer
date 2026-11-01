"use client"

import { Coins, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { GatedButton } from "@/components/admin/gated-button"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { pluralCredits } from "@/constants/analysis"
import { adjustCredits } from "@/lib/actions/admin"
import type { Gate } from "@/lib/admin-access"

type Direction = "grant" | "revoke"

/** Grant or take away credits by hand. Superadmins only; the server action checks again. */
export function AdjustCreditsDialog({ gate, email: fixedEmail }: { gate: Gate; email?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [direction, setDirection] = useState<Direction>("grant")
  const [email, setEmail] = useState(fixedEmail ?? "")
  const [amount, setAmount] = useState("1")
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)

  function reset(next: boolean) {
    setOpen(next)
    if (!next) {
      setDirection("grant")
      setEmail(fixedEmail ?? "")
      setAmount("1")
      setNote("")
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await adjustCredits({ email: email.trim(), amount: Number(amount), note, direction })
    setPending(false)
    if (!result.ok) {
      toast.error(result.message)
      return
    }
    const n = pluralCredits(Number(amount))
    toast.success(direction === "grant" ? `Granted ${n} to ${email}` : `Revoked ${n} from ${email}`)
    reset(false)
    router.refresh()
  }

  return (
    <>
      <GatedButton gate={gate} variant="outline" onClick={() => setOpen(true)}>
        <Coins />
        Adjust credits
      </GatedButton>

      <Dialog open={open} onOpenChange={reset}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Adjust credits</DialogTitle>
              <DialogDescription>Recorded in the ledger and the audit log with your reason.</DialogDescription>
            </DialogHeader>

            <RadioGroup
              value={direction}
              onValueChange={(v) => setDirection(v as Direction)}
              aria-label="Grant or revoke"
              className="grid-cols-2 gap-2"
            >
              {(["grant", "revoke"] as const).map((d) => (
                <Label
                  key={d}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 font-normal has-data-checked:border-foreground"
                >
                  <RadioGroupItem value={d} />
                  {d === "grant" ? "Grant" : "Revoke"}
                </Label>
              ))}
            </RadioGroup>

            <div className="flex flex-col gap-2">
              <Label htmlFor="credits-email">User email</Label>
              <Input
                id="credits-email"
                type="email"
                required
                value={email}
                readOnly={Boolean(fixedEmail)}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="credits-amount">Credits</Label>
              <Input
                id="credits-amount"
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                step={1}
                required
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-32 font-mono"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="credits-note">Reason</Label>
              <Textarea
                id="credits-note"
                required
                minLength={3}
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Refund for a stuck analysis"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => reset(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" variant={direction === "revoke" ? "destructive" : "default"} disabled={pending}>
                {pending && <Loader2 className="animate-spin" />}
                {direction === "grant" ? "Grant credits" : "Revoke credits"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
