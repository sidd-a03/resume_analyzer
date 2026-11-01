import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Topbar } from "@/components/app/topbar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/** The admin panel. Every page calls `requireAdmin()`, which 404s for everyone else. */
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Topbar area="admin" />
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
