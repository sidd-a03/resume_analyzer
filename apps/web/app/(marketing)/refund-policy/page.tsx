import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { brand } from "@/constants/brand"

export const metadata: Metadata = { title: "Refund & Cancellation Policy" }

// TODO: replace with reviewed policy text before applying for live payments.
export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>This page is a draft. The final policy will be published before {brand.name} accepts payments.</p>
      <h2>Failed analyses</h2>
      <p>If an analysis fails, the credits used for it are returned to your balance automatically.</p>
      <h2>Requesting a refund</h2>
      <p>
        Email <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a> with your payment details and we&apos;ll
        get back to you.
      </p>
    </LegalPage>
  )
}
