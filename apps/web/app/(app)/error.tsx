"use client"

import { RotateCcw } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-app">
      <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border bg-card px-6 py-14 text-center">
        <span className="-rotate-[4deg] font-hand text-3xl text-pen">oops.</span>
        <div>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This page didn&apos;t load. It&apos;s probably temporary, so try again.
          </p>
        </div>
        <Button onClick={() => retry()}>
          <RotateCcw />
          Try again
        </Button>
      </div>
    </div>
  )
}
