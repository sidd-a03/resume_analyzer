import { Briefcase, GraduationCap, Repeat, Search } from "lucide-react"

const audiences = [
  { label: "Freshers", Icon: GraduationCap },
  { label: "Campus placements", Icon: Briefcase },
  { label: "Career switchers", Icon: Repeat },
  { label: "Internship hunters", Icon: Search },
]

export function BuiltFor() {
  return (
    <section aria-label="Who it's for" className="border-y bg-card/40">
      <div className="container-page flex flex-col items-center gap-4 py-8 md:flex-row md:justify-center md:gap-8">
        <span className="text-sm font-medium text-muted-foreground">Built for</span>
        <ul className="flex flex-wrap justify-center gap-2.5">
          {audiences.map(({ label, Icon }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-md border bg-card px-3.5 py-1.5 text-sm font-medium"
            >
              <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
