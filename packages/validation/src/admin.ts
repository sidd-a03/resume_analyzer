import { z } from "zod";

export const CREDIT_ADJUSTMENT_MAX = 1000;

export const adjustCreditsSchema = z.object({
    direction: z.enum(["grant", "revoke"]),
    email: z.email("Enter the user's email").trim().toLowerCase(),
    amount: z.coerce
        .number()
        .int(`Enter a whole number from 1 to ${CREDIT_ADJUSTMENT_MAX}.`)
        .min(1, `Enter a whole number from 1 to ${CREDIT_ADJUSTMENT_MAX}.`)
        .max(CREDIT_ADJUSTMENT_MAX, `Enter a whole number from 1 to ${CREDIT_ADJUSTMENT_MAX}.`),
    note: z.string().trim().min(3, "Add a short reason.").max(500),
});

export type AdjustCreditsInput = z.input<typeof adjustCreditsSchema>;
