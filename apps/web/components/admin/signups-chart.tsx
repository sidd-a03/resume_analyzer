"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { TableFilter } from "@/components/shared/data-table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

// Same zone as lib/format, so a signup at 11pm IST counts on the right day
const timeZone = "Asia/Kolkata"
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
const monthName = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "long", year: "numeric" })
const monthShort = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", month: "short" })
const dayLabel = new Intl.DateTimeFormat("en-IN", { timeZone: "UTC", day: "numeric", month: "short", year: "numeric" })

const config = { signups: { label: "Signups", color: "var(--pen)" } } satisfies ChartConfig

const YEAR = "12m"

type Point = { key: string; tick: string; label: string; signups: number }


function lastMonths(today: string) {
  const [y, m] = today.split("-").map(Number) as [number, number]
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - i, 1))
    return { key: d.toISOString().slice(0, 7), date: d }
  })
}

function buildSeries(range: string, counts: Map<string, number>, today: string): Point[] {
  if (range === YEAR) {
    return lastMonths(today)
      .reverse()
      .map(({ key, date }) => {
        let signups = 0
        for (const [day, n] of counts) if (day.startsWith(key)) signups += n
        return { key, tick: monthShort.format(date), label: monthName.format(date), signups }
      })
  }

  const [y, m] = range.split("-").map(Number) as [number, number]
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate()

  const lastDay = range === today.slice(0, 7) ? Number(today.slice(8, 10)) : daysInMonth
  return Array.from({ length: lastDay }, (_, i) => {
    const key = `${range}-${String(i + 1).padStart(2, "0")}`
    return {
      key,
      tick: String(i + 1),
      label: dayLabel.format(new Date(Date.UTC(y, m - 1, i + 1))),
      signups: counts.get(key) ?? 0,
    }
  })
}


export function SignupsChart({ createdAt, today }: { createdAt: string[]; today: string }) {
  const [range, setRange] = useState(today.slice(0, 7))

  const counts = new Map<string, number>()
  for (const iso of createdAt) {
    const key = dayKey.format(new Date(iso))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const series = buildSeries(range, counts, today)
  const total = series.reduce((sum, p) => sum + p.signups, 0)
  const rangeItems = [
    ...lastMonths(today).map(({ key, date }) => ({ value: key, label: monthName.format(date) })),
    { value: YEAR, label: "Last 12 months" },
  ]
  const caption = range === YEAR ? "in the last 12 months" : `in ${rangeItems.find((r) => r.value === range)?.label}`

  return (
    <section aria-labelledby="signups-heading" className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="signups-heading" className="font-semibold">
            Signups
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono text-2xl font-semibold text-foreground">{total}</span> new{" "}
            {total === 1 ? "user" : "users"} {caption}
          </p>
        </div>
        <TableFilter items={rangeItems} value={range} onChange={(v) => v && setRange(v)} label="Choose a period" />
      </div>

      <ChartContainer config={config} className="mt-6 aspect-auto h-64 w-full" aria-hidden="true">
        <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="signups-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-signups)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--color-signups)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="tick"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={range === YEAR ? 4 : 16}
          />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={40} tickMargin={4} />
          <ChartTooltip
            cursor={{ strokeWidth: 1 }}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) => (payload[0]?.payload as Point | undefined)?.label}
              />
            }
          />
          <Area
            dataKey="signups"
            type="linear"
            stroke="var(--color-signups)"
            strokeWidth={2}
            fill="url(#signups-fill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
          />
        </AreaChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Signups {caption}</caption>
        <thead>
          <tr>
            <th scope="col">{range === YEAR ? "Month" : "Day"}</th>
            <th scope="col">Signups</th>
          </tr>
        </thead>
        <tbody>
          {series.map((p) => (
            <tr key={p.key}>
              <td>{p.label}</td>
              <td>{p.signups}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
