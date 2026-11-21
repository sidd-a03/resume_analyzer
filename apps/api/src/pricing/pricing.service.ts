import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { AnalysisType, CreditPack } from '@repo/database';
import {
    PACK_IDS,
    type AdminPricing,
    type AnalysisCosts,
    type PackId,
    type PublicPricing,
    type UpdateAnalysisCostsInput,
    type UpdatePackInput,
} from '@repo/validation';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PricingCache } from './pricing.cache.js';


const PACK_ORDER: CreditPack[] = ['STARTER', 'STANDARD', 'PRO'];

const toId = (pack: CreditPack) => pack.toLowerCase() as PackId;

const toEnum = (id: string): CreditPack | null => ((PACK_IDS as readonly string[]).includes(id) ? (id.toUpperCase() as CreditPack) : null);

export interface PricingActor {
    id: string;
    email: string;
    role?: string | string[] | null;
}

@Injectable()
export class PricingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: PricingCache,
    ) {}

    async getAdmin(): Promise<AdminPricing> {
        const [rows, costs] = await Promise.all([
            this.prisma.packPrice.findMany(), 
            this.getCosts()
        ]);
        
        const packs = rows
            .sort((a, b) => PACK_ORDER.indexOf(a.pack) - PACK_ORDER.indexOf(b.pack))
            .map((p) => ({
                id: toId(p.pack),
                name: p.name,
                credits: p.credits,
                priceInr: p.pricePaise / 100,
                blurb: p.blurb,
                active: p.active,
                updatedAt: p.updatedAt.toISOString(),
            }));
            
        return { packs, costs };
    }

    getPublic(): Promise<PublicPricing> {
        return this.cache.get(() => this.loadPublic());
    }

    private async loadPublic(): Promise<PublicPricing> {
        const { packs, costs } = await this.getAdmin();
        return {
            packs: packs.filter((p) => p.active).map(({ active: _active, updatedAt: _updatedAt, ...pack }) => pack),
            costs,
        };
    }

    async costOf(type: AnalysisType) {
        if (type === 'PREVIEW') return 0;

        const row = await this.prisma.analysisPrice.findUnique({ 
            where: { 
                type 
            }, 
            select: { 
                credits: true 
            } 
        });

        if (!row) throw new InternalServerErrorException(`No price set for ${type}`);
        return row.credits;
    }

    async updatePack(actor: PricingActor, id: string, input: UpdatePackInput) {
        const pack = toEnum(id);
        if (!pack) throw new NotFoundException('Pack not found');

        // Serializable: the "another pack is still on sale" check below must still be true when we commit
        const updated = await this.prisma.serializableTransaction(async (tx) => {
            const before = await tx.packPrice.findUniqueOrThrow({ 
                where: { 
                    pack 
                } 
            });

            if (!input.active && before.active) {
                const othersOnSale = await tx.packPrice.count({ 
                    where: { 
                        active: true, 
                        pack: { 
                            not: pack 
                        } 
                    } 
                });

                if (othersOnSale === 0) throw new BadRequestException('At least one pack has to stay on sale');
            }

            const after = await tx.packPrice.update({
                where: { pack },
                data: {
                    name: input.name,
                    credits: input.credits,
                    pricePaise: input.priceInr * 100,
                    blurb: input.blurb,
                    active: input.active,
                },
            });

            await this.audit(tx, actor, `pack:${id}`, {
                before: { 
                    name: before.name, 
                    credits: before.credits, 
                    priceInr: before.pricePaise / 100, 
                    blurb: before.blurb, 
                    active: before.active 
                },
                after: input,
            });

            return { 
                id, 
                name: after.name, 
                credits: after.credits, 
                priceInr: after.pricePaise / 100, 
                blurb: after.blurb, 
                active: after.active 
            };
        });

        await this.cache.invalidate();
        return updated;
    }

    async updateCosts(actor: PricingActor, input: UpdateAnalysisCostsInput): Promise<AnalysisCosts> {
        // Serializable: two saves at once can't both record the same "before" in the audit log
        const updated = await this.prisma.serializableTransaction(async (tx) => {
            const before = await this.getCosts(tx);

            await tx.analysisPrice.update({ 
                where: { 
                    type: 'FULL' 
                }, 
                data: { 
                    credits: input.fullAnalysis 
                } 
            });

            await tx.analysisPrice.update({ 
                where: { 
                    type: 'JOB_MATCH' 
                }, 
                data: { 
                    credits: input.jobMatch 
                } 
            });
            
            await this.audit(tx, actor, 'analysis-costs', { before, after: input });
            return { preview: 0 as const, ...input };
        });
        await this.cache.invalidate();
        return updated;
    }

    private async getCosts(db: Pick<PrismaService, 'analysisPrice'> = this.prisma): Promise<AnalysisCosts> {
        const rows = await db.analysisPrice.findMany({ 
            select: { 
                type: true, 
                credits: true 
            } 
        });

        const credits = (type: AnalysisType) => {
            const row = rows.find((r) => r.type === type);
            if (!row) throw new InternalServerErrorException(`No price set for ${type}`);
            return row.credits;
        };
        
        return { 
            preview: 0, 
            fullAnalysis: credits('FULL'), 
            jobMatch: credits('JOB_MATCH') 
        };
    }

    private audit(tx: Pick<PrismaService, 'auditLog'>, actor: PricingActor, targetId: string, change: object) {
        return tx.auditLog.create({
            data: {
                action: 'PRICING_UPDATE',
                actorId: actor.id,
                actorEmail: actor.email,
                actorRole: (Array.isArray(actor.role) ? actor.role.join(',') : actor.role) || 'unknown',
                targetId,
                detail: JSON.stringify(change),
            },
        });
    }
}
