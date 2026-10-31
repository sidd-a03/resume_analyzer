"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { NavActions } from "@/components/layout/nav-actions"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { navLinks } from "@/constants/brand"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" aria-label="Open menu" className="md:hidden" />}>
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle render={<div />}>
            <Logo />
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col p-2">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={close}
              className="rounded-lg px-3 py-3 text-base font-medium transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Separator />
        <div className="p-4">
          <NavActions stacked onAction={close} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
