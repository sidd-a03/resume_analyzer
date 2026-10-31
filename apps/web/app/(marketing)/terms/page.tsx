import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { brand } from "@/constants/brand"

export const metadata: Metadata = { title: "Terms" }

// TODO: replace with reviewed terms before launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>This page is a draft. The final terms will be published before {brand.name} accepts payments.</p>
      <h2>Using the service</h2>
      <p>
        {brand.name} gives automated feedback on resumes. It is guidance, not a guarantee of interviews or of passing
        any employer&apos;s screening system.
      </p>
      <h2>Credits</h2>
      <p>Credits never expire. If an analysis fails, the credits used are refunded automatically.</p>
    </LegalPage>
  )
}
