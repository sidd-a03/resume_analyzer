"use client"

import { usePathname } from "next/navigation"

import { titleForPath } from "@/components/app/nav-items"

export function TopbarTitle() {
  return <p className="min-w-0 truncate font-medium">{titleForPath(usePathname())}</p>
}
