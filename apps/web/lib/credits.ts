import { cache } from "react"

import { apiFetch } from "@/lib/api"
import { toLedgerPage, type ApiLedgerPage, type LedgerPage } from "@/lib/ledger"


export const getCreditBalance = cache(async () => (await apiFetch<{ balance: number }>("/credits"))?.balance ?? 0)

export async function getCreditTransactions(): Promise<LedgerPage> {
  const page = await apiFetch<ApiLedgerPage>("/credits/transactions")
  return page ? toLedgerPage(page) : { items: [], nextCursor: null }
}
