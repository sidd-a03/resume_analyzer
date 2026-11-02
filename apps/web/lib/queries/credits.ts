import { infiniteQueryOptions } from "@tanstack/react-query"

import { apiClientFetch } from "@/lib/api-client"
import { toLedgerPage, type ApiLedgerPage, type LedgerPage } from "@/lib/ledger"

export const creditKeys = {
  all: ["credits"] as const,
  transactions: () => [...creditKeys.all, "transactions"] as const,
}

export function transactionsQuery(firstPage: LedgerPage) {

  return infiniteQueryOptions({
    queryKey: creditKeys.transactions(),

    queryFn: async ({ pageParam }) => {
      const query = pageParam ? `?${new URLSearchParams({ cursor: pageParam })}` : ""
      return toLedgerPage(await apiClientFetch<ApiLedgerPage>(`/credits/transactions${query}`))
    },
    
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialData: { pages: [firstPage], pageParams: [undefined] },
  })
}
