import { cache } from "react"

import { apiFetch } from "@/lib/api"
import { toLedgerPage, type ApiLedgerPage, type LedgerPage } from "@/lib/ledger"


export const getCredits = cache(
  async () => (
    await apiFetch<{ balance: number; welcomeClaimed: boolean }>("/credits")) 
    ?? 
    { 
      balance: 0, 
      welcomeClaimed: false 
    },
)

export const getCreditBalance = async () => (await getCredits()).balance

export async function getCreditTransactions(): Promise<LedgerPage> {
  const page = await apiFetch<ApiLedgerPage>("/credits/transactions")
  return page ? toLedgerPage(page) : { items: [], nextCursor: null }
}
