import { Mail } from "lucide-react"
import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { brand } from "@/constants/brand"

export const metadata: Metadata = { title: "Contact" }

export default function ContactPage() {
  return (
    <LegalPage title="Contact us">
      <p>Questions about your account, a payment, or your data? We&apos;re happy to help.</p>
      <a
        href={`mailto:${brand.supportEmail}`}
        className="flex w-fit items-center gap-3 rounded-xl border bg-card p-5 no-underline!"
      >
        <span className="grid size-10 place-items-center rounded-xl bg-highlight text-foreground">
          <Mail className="size-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col">
          <span className="text-sm text-muted-foreground">Email support</span>
          <span className="text-foreground">{brand.supportEmail}</span>
        </span>
      </a>
    </LegalPage>
  )
}
