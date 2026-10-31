export const brand = {
  name: "ResumeLens",
  tagline: "Know what recruiters see in your resume.",
  description:
    "Upload your PDF resume and get a score, clear fixes, and better bullet points. Match it to any job description.",
  supportEmail: "support@resumelens.app",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
] as const
