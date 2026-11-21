import { z } from "zod";


export const PACK_IDS = ["starter", "standard", "pro"] as const;
export type PackId = (typeof PACK_IDS)[number];

export const PRICING_LIMITS = {
    packCredits: { min: 1, max: 1000 },
    packPriceInr: { min: 1, max: 100_000 },
    analysisCredits: { min: 1, max: 20 },
    nameChars: { min: 2, max: 30 },
    blurbChars: { min: 5, max: 120 },
} as const;

const L = PRICING_LIMITS;

export const updatePackSchema = z.object({
    name: z.string().trim().min(L.nameChars.min).max(L.nameChars.max),
    credits: z.number().int().min(L.packCredits.min).max(L.packCredits.max),
    priceInr: z.number().int().min(L.packPriceInr.min).max(L.packPriceInr.max),
    blurb: z.string().trim().min(L.blurbChars.min).max(L.blurbChars.max),
    active: z.boolean(),
});

export const updateAnalysisCostsSchema = z.object({
    fullAnalysis: z.number().int().min(L.analysisCredits.min).max(L.analysisCredits.max),
    jobMatch: z.number().int().min(L.analysisCredits.min).max(L.analysisCredits.max),
});

export type UpdatePackInput = z.infer<typeof updatePackSchema>;
export type UpdateAnalysisCostsInput = z.infer<typeof updateAnalysisCostsSchema>;

export interface PricingPack {
    id: PackId;
    name: string;
    credits: number;
    priceInr: number;
    blurb: string;
    active: boolean;
    updatedAt: string;
}

export interface AnalysisCosts {
    preview: 0;
    fullAnalysis: number;
    jobMatch: number;
}

export interface PublicPricing {
    packs: Omit<PricingPack, "active" | "updatedAt">[];
    costs: AnalysisCosts;
}

export interface AdminPricing {
    packs: PricingPack[];
    costs: AnalysisCosts;
}
