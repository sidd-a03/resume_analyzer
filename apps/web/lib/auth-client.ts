import { adminClient, lastLoginMethodClient, phoneNumberClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  plugins: [lastLoginMethodClient(), phoneNumberClient(), adminClient()],
})

export type SocialProvider = "google" | "github"

export const socialProviders: SocialProvider[] = ["google", "github"]
