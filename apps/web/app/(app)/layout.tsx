import { Suspense } from "react"

import { AppSidebar } from "@/components/app/app-sidebar"
import { ImpersonationBanner } from "@/components/app/impersonation-banner"
import { Topbar } from "@/components/app/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Suspense fallback={null}>
          <ImpersonationBanner />
        </Suspense>
        <Topbar />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
