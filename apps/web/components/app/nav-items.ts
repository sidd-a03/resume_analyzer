import {
  Coins,
  FilePlus2,
  Files,
  History,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const appNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "New analysis", href: "/analyze", icon: FilePlus2 },
  { title: "History", href: "/history", icon: History },
  { title: "Credits", href: "/credits", icon: Coins },
  { title: "Settings", href: "/settings", icon: Settings },
]

export const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Analyses", href: "/admin/analyses", icon: Files },
  { title: "Credits", href: "/admin/credits", icon: Coins },
  { title: "Abuse review", href: "/admin/abuse", icon: ShieldAlert },
  { title: "Audit log", href: "/admin/audit", icon: ScrollText },
]

/** `/admin` is a prefix of every admin page, so it only matches itself. */
export function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/history" && pathname.startsWith("/analyses/"))
}

/** Top-bar title for a path. Analysis pages share one title. */
export function titleForPath(pathname: string) {
  if (pathname.startsWith("/analyses/")) return "Analysis"
  if (/^\/admin\/users\/[^/]+$/.test(pathname)) return "User"
  return [...appNav, ...adminNav].find((item) => isActive(pathname, item.href))?.title ?? ""
}
