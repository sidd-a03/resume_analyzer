import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Suspense } from "react"

import { NavLinks, NavMenu } from "@/components/app/nav-menu"
import { Logo } from "@/components/shared/logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AdminSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center border-b px-3 group-data-[collapsible=icon]:px-2">
        <Logo href="/admin" className="[&>span]:group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <Suspense fallback={<NavLinks section="admin" pathname={null} />}>
              <NavMenu section="admin" />
            </Suspense>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Back to app" render={<Link href="/dashboard" />}>
              <ArrowLeft />
              <span>Back to app</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
