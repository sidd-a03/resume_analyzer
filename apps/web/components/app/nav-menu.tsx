"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { adminNav, appNav, isActive } from "@/components/app/nav-items"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"

/** Sidebar links. Closes the mobile sheet after a tap. Without a pathname nothing is marked active. */
export function NavLinks({ section, pathname }: { section: "app" | "admin"; pathname: string | null }) {
  const { setOpenMobile } = useSidebar()
  const items = section === "app" ? appNav : adminNav

  return (
    <SidebarMenu>
      {items.map(({ title, href, icon: Icon }) => {
        const active = pathname !== null && isActive(pathname, href)
        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton
              isActive={active}
              tooltip={title}
              render={<Link href={href} aria-current={active ? "page" : undefined} onClick={() => setOpenMobile(false)} />}
            >
              <Icon />
              <span>{title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

/** Reads the URL, so render it inside <Suspense> with `NavLinks pathname={null}` as the fallback. */
export function NavMenu({ section }: { section: "app" | "admin" }) {
  return <NavLinks section={section} pathname={usePathname()} />
}
