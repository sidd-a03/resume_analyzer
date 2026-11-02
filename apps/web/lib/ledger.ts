import type { LedgerEntry, LedgerReason } from "@/lib/types"

export type ApiLedgerPage = {
  items: (Omit<LedgerEntry, "reason"> & { reason: Uppercase<LedgerReason> })[]
  nextCursor: string | null
}

export type LedgerPage = { items: LedgerEntry[]; nextCursor: string | null }

export function toLedgerPage(page: ApiLedgerPage): LedgerPage {
  return {
    items: page.items.map((t) => ({ ...t, reason: t.reason.toLowerCase() as LedgerReason })),
    nextCursor: page.nextCursor,
  }
}
