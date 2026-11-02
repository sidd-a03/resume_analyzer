"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { LedgerTable } from "@/components/credits/ledger-table"
import { Button } from "@/components/ui/button"
import type { LedgerPage } from "@/lib/ledger"
import { transactionsQuery } from "@/lib/queries/credits"


export function LedgerHistory({ initial }: { initial: LedgerPage }) {
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(transactionsQuery(initial))

  async function loadMore() {
    const result = await fetchNextPage()
    if (result.isFetchNextPageError) toast.error("Couldn't load more history. Try again.")
  }

  return (
    <div className="flex flex-col gap-4">
      <LedgerTable entries={data.pages.flatMap((page) => page.items)} />
      {hasNextPage && (
        <Button variant="outline" className="self-center" onClick={loadMore} disabled={isFetchingNextPage}>
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
          Load more
        </Button>
      )}
    </div>
  )
}
