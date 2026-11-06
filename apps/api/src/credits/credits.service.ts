import { Injectable } from '@nestjs/common';
import { LEDGER_PAGE_SIZE } from '@repo/validation';
import { PrismaService } from '../common/prisma/prisma.service.js';

@Injectable()
export class CreditsService {
    constructor(private readonly prisma: PrismaService) {}

    async getBalance(userId: string) {
        const [credit, welcomeClaim] = await Promise.all([
            this.prisma.credit.findUnique({ 
                where: { userId }, 
                select: { balance: true } 
            }),

            this.prisma.welcomeClaim.findUnique({ 
                where: { userId }, 
                select: { id: true } 
            }),
        ]);

        return { balance: credit?.balance ?? 0, welcomeClaimed: welcomeClaim !== null };
    }

    async getTransactions(userId: string, cursor?: string, limit: number = LEDGER_PAGE_SIZE.default) {
        const rows = await this.prisma.creditTransaction.findMany({
            where: { userId },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            take: limit + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            select: {
                id: true,
                delta: true,
                reason: true,
                analysisId: true,
                createdAt: true,
            },
        });

        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;
        return { 
            items, 
            nextCursor: hasMore ? items[items.length - 1]!.id : null 
        };
    }
}
