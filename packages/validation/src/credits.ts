import { z } from "zod";

export const LEDGER_PAGE_SIZE = { default: 20, max: 50 } as const;


export const ledgerQuerySchema = z.object({
    cursor: z.uuid({ version: "v7" }).optional(),
    limit: z.coerce.number().int().min(1).max(LEDGER_PAGE_SIZE.max).default(LEDGER_PAGE_SIZE.default),
});

export type LedgerQuery = z.infer<typeof ledgerQuerySchema>;
