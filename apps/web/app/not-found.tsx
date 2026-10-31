import Link from "next/link"

import { LogoMark } from "@/components/shared/logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-4 py-24 text-center">
      <LogoMark className="size-12" />
      <p className="font-mono text-sm font-semibold text-pen">404</p>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">We couldn&apos;t find that page</h1>
      <p className="max-w-md text-muted-foreground">The link may be broken, or the page may have moved.</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-2 h-11 rounded-lg px-5")}>
        Back to home
      </Link>
    </main>
  )
}
