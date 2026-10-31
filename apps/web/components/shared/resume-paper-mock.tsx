import { cn } from "@/lib/utils"

function Line({ w, mark }: { w: string; mark?: "circle" | "highlight" }) {
  return (
    <div className="relative" style={{ width: w }}>
      {mark === "highlight" && (
        <div className="absolute -inset-x-1 -inset-y-1 -rotate-[0.6deg] rounded-sm bg-highlight/80" />
      )}
      <div className="relative h-2 rounded-full bg-foreground/15" />
      {/* hand-drawn looking loop from the reviewer's red pen */}
      {mark === "circle" && (
        <div className="absolute -inset-x-2 -inset-y-2 rotate-[-1.5deg] rounded-[50%] border-2 border-pen/80" />
      )}
    </div>
  )
}

/** A printed resume page made of skeleton lines, marked up like a reviewer would. */
export function ResumePaperMock({ name, role, className }: { name: string; role: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("aspect-[8.5/11] w-full rounded-sm border bg-card p-7 shadow-paper", className)}
    >
      <div className="border-b pb-4">
        <span className="font-heading text-lg font-semibold">{name}</span>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">{role}</span>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        <div className="h-1.5 w-16 rounded-full bg-foreground/40" />
        <Line w="92%" />
        <Line w="78%" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="h-1.5 w-20 rounded-full bg-foreground/40" />
        <Line w="80%" mark="circle" />
        <Line w="70%" />
        <Line w="84%" />
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <div className="h-1.5 w-14 rounded-full bg-foreground/40" />
        <Line w="86%" mark="highlight" />
        <Line w="64%" />
        <Line w="74%" />
      </div>

      <div className="mt-6 flex flex-wrap gap-1.5">
        {["w-12", "w-16", "w-10", "w-14", "w-12"].map((w, i) => (
          <div key={i} className={cn("h-4 rounded-sm border bg-muted", w)} />
        ))}
      </div>
    </div>
  )
}
