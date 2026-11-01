import { Suspense } from "react"

import { NavLinks, NavMenu } from "@/components/app/nav-menu"
import { Logo } from "@/components/shared/logo"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader } from "@/components/ui/sidebar"
import { pricingNote } from "@/constants/pricing"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b px-3 group-data-[collapsible=icon]:px-2">
        <Logo href="/" className="[&>span]:group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            {/* The links prerender; only the active highlight waits for the URL */}
            <Suspense fallback={<NavLinks section="app" pathname={null} />}>
              <NavMenu section="app" />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <p className="rounded-lg border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
          {pricingNote}
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
