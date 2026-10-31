
export const creditCosts = {
  preview: 0,
  fullAnalysis: 1,
  jobMatch: 2,
} as const

export interface CreditPack {
  id: "starter" | "standard" | "pro"
  name: string
  credits: number
  priceInr: number
  blurb: string
}

export const creditPacks: CreditPack[] = [
  { id: "starter", name: "Starter", credits: 5, priceInr: 49, blurb: "Polish one resume before a deadline." },
  { id: "standard", name: "Standard", credits: 15, priceInr: 129, blurb: "Tailor your resume for a round of applications." },
  { id: "pro", name: "Pro", credits: 40, priceInr: 299, blurb: "For placement season, when you apply everywhere." },
]

export const pricingNote = "Credits never expire. Failed analyses are refunded automatically."
