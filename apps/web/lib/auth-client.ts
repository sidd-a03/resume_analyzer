import { adminClient, lastLoginMethodClient, phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

import { apiURL } from "@/constants/api"
import { ac, roles } from "@/lib/access"

export const authClient = createAuthClient({
  baseURL: apiURL,
  plugins: [lastLoginMethodClient(), phoneNumberClient(), adminClient({ ac, roles })],
})

export type SocialProvider = "google" | "github"

export const socialProviders: SocialProvider[] = ["google", "github"]
