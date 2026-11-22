"use client"

import { useMutation } from "@tanstack/react-query"
import { Loader2, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
  PRICING_LIMITS as L,
  updateAnalysisCostsSchema,
  updatePackSchema,
  type AdminPricing,
  type PricingPack,
  type UpdateAnalysisCostsInput,
  type UpdatePackInput,
} from "@repo/validation"

import { GatedButton } from "@/components/admin/gated-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { pluralCredits } from "@/constants/analysis"
import { saveAnalysisCosts, savePackPrice, type PricingActionResult } from "@/lib/actions/pricing"
import type { Gate } from "@/lib/admin-access"
import { formatDateTime } from "@/lib/format"

const inrPrecise = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 })

/**
 * Saves through a Server Action: it calls the API, then clears the shared pricing cache and re-renders this
 * page, all on the server. Saving and clearing the cache can't come apart, even if the tab closes mid-save.
 */
function useSave<TBody, TResult>(save: (body: TBody) => Promise<PricingActionResult<TResult>>, success: string) {
  return useMutation({
    mutationFn: async (body: TBody) => {
      const result = await save(body)
      if (!result.ok) throw new Error(result.message)
      return result.data
    },
    onSuccess: () => toast.success(success),
    onError: (error) => toast.error(error.message),
  })
}

/** First zod issue as a sentence, or null when the form is valid */
function firstIssue(result: { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } }) {
  if (result.success || !result.error) return null
  const issue = result.error.issues[0]!
  return `${String(issue.path[0] ?? "")}: ${issue.message}`
}

export function PricingEditor({ pricing, gate }: { pricing: AdminPricing; gate: Gate }) {
  return (
    <div className="flex flex-col gap-8">
      <CostsCard costs={pricing.costs} gate={gate} />
      <section aria-labelledby="packs-heading">
        <h2 id="packs-heading" className="text-lg font-semibold">
          Credit packs
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Past purchases keep the price they were bought at. At least one pack has to stay on sale.
        </p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {pricing.packs.map((pack) => (
            <PackCard key={`${pack.id}-${pack.updatedAt}`} pack={pack} gate={gate} />
          ))}
        </div>
      </section>
    </div>
  )
}

function CostsCard({ costs, gate }: { costs: AdminPricing["costs"]; gate: Gate }) {
  const [full, setFull] = useState(String(costs.fullAnalysis))
  const [jobMatch, setJobMatch] = useState(String(costs.jobMatch))
  const save = useSave((body: UpdateAnalysisCostsInput) => saveAnalysisCosts(body), "Analysis costs saved")

  const body = { fullAnalysis: Number(full), jobMatch: Number(jobMatch) }
  const parsed = updateAnalysisCostsSchema.safeParse(body)
  const dirty = body.fullAnalysis !== costs.fullAnalysis || body.jobMatch !== costs.jobMatch
  const error = firstIssue(parsed)

  return (
    <section aria-labelledby="costs-heading" className="rounded-xl border bg-card p-6">
      <h2 id="costs-heading" className="text-lg font-semibold">
        Analysis costs
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Charged when an analysis starts, so a change only affects analyses started after you save. The free preview
        always costs 0.
      </p>
      <form
        className="mt-5 flex flex-wrap items-end gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (parsed.success) save.mutate(parsed.data)
        }}
      >
        <fieldset disabled={!gate.ok || save.isPending} className="contents">
          <CreditsField id="cost-full" label="Full analysis" value={full} onChange={setFull} />
          <CreditsField id="cost-job-match" label="Full + job match" value={jobMatch} onChange={setJobMatch} />
        </fieldset>
        <GatedButton gate={gate} type="submit" disabled={!dirty || !parsed.success || save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Save costs
        </GatedButton>
      </form>
      {dirty && error && <p className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  )
}

function CreditsField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={L.analysisCredits.min}
          max={L.analysisCredits.max}
          step={1}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-24 font-mono"
        />
        <span className="text-sm text-muted-foreground">credits</span>
      </div>
    </div>
  )
}

function PackCard({ pack, gate }: { pack: PricingPack; gate: Gate }) {
  const [name, setName] = useState(pack.name)
  const [credits, setCredits] = useState(String(pack.credits))
  const [price, setPrice] = useState(String(pack.priceInr))
  const [blurb, setBlurb] = useState(pack.blurb)
  const [active, setActive] = useState(pack.active)
  const save = useSave((body: UpdatePackInput) => savePackPrice(pack.id, body), `${name.trim() || pack.name} saved`)

  const body = { name, credits: Number(credits), priceInr: Number(price), blurb, active }
  const parsed = updatePackSchema.safeParse(body)
  const dirty =
    name !== pack.name ||
    body.credits !== pack.credits ||
    body.priceInr !== pack.priceInr ||
    blurb !== pack.blurb ||
    active !== pack.active
  const error = firstIssue(parsed)
  const perCredit = parsed.success ? inrPrecise.format(body.priceInr / body.credits) : "–"
  const field = (key: string) => `pack-${pack.id}-${key}`

  return (
    <form
      className="flex flex-col gap-4 rounded-xl border bg-card p-5 data-[hidden=true]:border-dashed data-[hidden=true]:opacity-75"
      data-hidden={!active}
      aria-label={`${pack.name} pack`}
      onSubmit={(event) => {
        event.preventDefault()
        if (parsed.success) save.mutate(parsed.data)
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{pack.id}</span>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={active}
            disabled={!gate.ok || save.isPending}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4 accent-foreground"
          />
          On sale
        </label>
      </div>

      <fieldset disabled={!gate.ok || save.isPending} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={field("name")}>Name</Label>
          <Input id={field("name")} required maxLength={L.nameChars.max} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor={field("price")}>Price (₹)</Label>
            <Input
              id={field("price")}
              type="number"
              inputMode="numeric"
              min={L.packPriceInr.min}
              max={L.packPriceInr.max}
              step={1}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={field("credits")}>Credits</Label>
            <Input
              id={field("credits")}
              type="number"
              inputMode="numeric"
              min={L.packCredits.min}
              max={L.packCredits.max}
              step={1}
              required
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <p className="-mt-2 font-mono text-xs text-muted-foreground">
          {perCredit} per credit{parsed.success && ` · ${pluralCredits(body.credits)}`}
        </p>
        <div className="flex flex-col gap-2">
          <Label htmlFor={field("blurb")}>Blurb</Label>
          <Textarea
            id={field("blurb")}
            required
            maxLength={L.blurbChars.max}
            rows={2}
            value={blurb}
            onChange={(e) => setBlurb(e.target.value)}
          />
        </div>
      </fieldset>

      {dirty && error && <p className="text-sm text-destructive">{error}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">Updated {formatDateTime(pack.updatedAt)}</span>
        <GatedButton gate={gate} type="submit" size="sm" disabled={!dirty || !parsed.success || save.isPending}>
          {save.isPending ? <Loader2 className="animate-spin" /> : <Save />}
          Save
        </GatedButton>
      </div>
    </form>
  )
}
