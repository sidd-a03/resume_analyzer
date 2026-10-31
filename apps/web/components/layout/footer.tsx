import { cacheLife } from "next/cache"
import Link from "next/link"

import { Logo } from "@/components/shared/logo"
import { brand } from "@/constants/brand"

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refund & Cancellation", href: "/refund-policy" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Contact us", href: "/contact" },
      { label: brand.supportEmail, href: `mailto:${brand.supportEmail}` },
    ],
  },
]

// Cached so the prerendered shell doesn't read the clock on every request.
async function CopyrightYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}

export function Footer() {
  return (
    <footer className="border-t bg-card/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Clear, honest resume feedback for freshers and early-career job seekers.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm break-all text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © <CopyrightYear /> {brand.name}. All rights reserved.
          </p>
          <p>Made in India for job seekers everywhere.</p>
        </div>
      </div>
    </footer>
  )
}
