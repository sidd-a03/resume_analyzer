import type { Metadata } from "next"

import { LegalPage } from "@/components/layout/legal-page"
import { brand } from "@/constants/brand"

export const metadata: Metadata = { title: "Privacy Policy" }

// TODO: replace with reviewed policy text before launch.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>This page is a draft. The final policy will be published before {brand.name} accepts payments.</p>
      <h2>What we collect</h2>
      <p>
        Your account details from the sign-in provider you choose, the resumes you upload, and the analyses we create.
      </p>
      <h2>How we store your files</h2>
      <p>
        Resumes are stored privately and deleted automatically after the retention period. You can delete them at any
        time.
      </p>
      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${brand.supportEmail}`}>{brand.supportEmail}</a>.
      </p>
    </LegalPage>
  )
}
