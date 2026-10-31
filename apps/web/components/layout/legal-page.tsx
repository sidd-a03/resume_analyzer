import type { ReactNode } from "react"

/** Simple text layout for policy and contact pages. */
export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="container-page max-w-3xl py-16 lg:py-24">
      <h1 className="text-[clamp(2rem,4vw,3rem)] leading-tight font-bold tracking-[-0.025em]">{title}</h1>
      {updated && <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>}
      <div className="mt-10 flex flex-col gap-6 text-muted-foreground [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-pen/60 [&_a]:underline-offset-4 hover:[&_a]:decoration-pen">
        {children}
      </div>
    </article>
  )
}
