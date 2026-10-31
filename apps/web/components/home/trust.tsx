import { EyeOff, Lock, Timer, Trash2 } from "lucide-react"

import { BlurFade } from "@/components/ui/blur-fade"

// Keep these in sync with what the backend actually does before launch.
const items = [
  { Icon: Lock, title: "Private by default", body: "Your files are stored privately and only you can open them." },
  { Icon: Timer, title: "Auto-deleted", body: "Resumes are removed automatically after the retention period." },
  { Icon: Trash2, title: "You control your data", body: "Delete any resume or your whole account at any time." },
  { Icon: EyeOff, title: "No resume text in logs", body: "We don't write the contents of your resume to our logs." },
]

export function Trust() {
  return (
    <section aria-labelledby="trust-heading" className="py-16 lg:py-20">
      <div className="container-page">
        <h2 id="trust-heading" className="sr-only">
          Privacy and trust
        </h2>
        <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, body }, i) => (
            <BlurFade key={title} inView delay={i * 0.05} className="flex flex-col gap-3 bg-card p-6">
              <span className="grid size-10 place-items-center rounded-lg border bg-background">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  )
}
