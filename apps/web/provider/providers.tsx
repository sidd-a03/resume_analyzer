"use client"

import { MotionConfig } from "motion/react"
import type { ReactNode } from "react"

import { AuthDialogProvider } from "@/components/auth/auth-dialog"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "@/provider/tanstack-query/query-provider"
import { ThemeProvider } from "@/provider/theme/theme-provider"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          <QueryProvider>
            <AuthDialogProvider>{children}</AuthDialogProvider>
          </QueryProvider>
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
