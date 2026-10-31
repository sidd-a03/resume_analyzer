import type { ComponentType, SVGProps } from "react"

import { GitHubIcon, GoogleIcon } from "@/components/auth/brand-icons"
import type { SocialProvider } from "@/lib/auth-client"

export const providerMeta: Record<SocialProvider, { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }> = {
  google: { label: "Google", Icon: GoogleIcon },
  github: { label: "GitHub", Icon: GitHubIcon },
}
