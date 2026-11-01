"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const

const subscribe = () => () => {}

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  return (
    <section aria-labelledby="appearance-heading" className="rounded-xl border bg-card p-6">
      <h2 id="appearance-heading" className="text-xl font-semibold">
        Appearance
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">System follows your device setting.</p>

      <RadioGroup
        value={mounted ? (theme ?? "system") : null}
        onValueChange={(value) => setTheme(value as string)}
        aria-label="Theme"
        className="mt-6 grid-cols-3 gap-3"
      >
        {options.map(({ value, label, Icon }) => (
          <Label
            key={value}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border bg-background p-4 font-normal transition-colors hover:border-foreground/25 has-data-checked:border-foreground has-data-checked:shadow-paper"
          >
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
            <RadioGroupItem value={value} className="sr-only" />
          </Label>
        ))}
      </RadioGroup>
    </section>
  )
}
