import { createHash } from 'node:crypto';
import {
    ForbiddenException,
    GoneException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    NotFoundException,
    OnModuleInit,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Prisma } from '@repo/database';
import { FREE_PREVIEWS_PER_DAY, type StartAnalysisInput } from '@repo/validation';
import type { Queue } from 'bullmq';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { PricingService } from '../pricing/pricing.service.js';
import {
    ANALYSIS_QUEUE,
    ANALYZE_JOB,
    ANALYZE_JOB_OPTIONS,
    PROMPT_VERSION,
    STUCK_AFTER_MS,
    SWEEP_EVERY_MS,
    SWEEP_JOB,
    type AnalyzeJobData,
} from './analysis.constants.js';
import { AnalysisRunner } from './analysis-runner.service.js';

const DAY_MS = 24 * 60 * 60 * 1000;

class InsufficientCreditsError extends Error {}

const summary = {
    id: true,
    resumeId: true,
    type: true,
    status: true,
    creditsSpent: true,
    createdAt: true,
} satisfies Prisma.AnalysisSelect

@Injectable()
export class AnalysesService implements OnModuleInit {
    private readonly logger = new Logger(AnalysesService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly runner: AnalysisRunner,
        private readonly pricing: PricingService,
        @InjectQueue(ANALYSIS_QUEUE) private readonly queue: Queue<AnalyzeJobData>,
    ) {}

    async onModuleInit() {
        // Upsert, so every API instance can call it on startup without creating duplicates
        await this.queue.upsertJobScheduler('analysis-sweeper', { every: SWEEP_EVERY_MS }, { name: SWEEP_JOB });
    }

    async start(userId: string, input: StartAnalysisInput) {

        const resume = await this.prisma.resume.findFirst({
            where: { 
                id: input.resumeId, 
                userId 
            },
            select: { 
                contentHash: true, 
                textContent: true, 
                expiresAt: true 
            },
        });

        if (!resume) throw new NotFoundException('Resume not found');
        
        if (!resume.textContent || resume.expiresAt <= new Date()) {
            throw new GoneException('This resume has expired. Upload it again to analyze it.');
        }

        const jobDescription = input.type === 'JOB_MATCH' ? input.jobDescription!.replace(/\s+/g, ' ').trim() : null;

        const inputHash = jobDescription
            ? createHash('sha256').update(`${resume.contentHash}\n${jobDescription.toLowerCase()}`).digest('hex')
            : resume.contentHash;

        const key = { 
            userId, 
            type: input.type, 
            inputHash, 
            promptVersion: PROMPT_VERSION 
        };

        const existing = await this.prisma.analysis.findUnique({
            where: { 
                userId_type_inputHash_promptVersion: key 
            },
            select: summary,
        });

        if (existing && existing.status !== 'FAILED') 
            return { 
                ...existing, 
                reused: true 
            };
        
        if (existing) {
            await this.prisma.analysis.delete({ 
                where: { 
                    id: existing.id 
                } 
            });
        }

        if (input.type === 'PREVIEW') 
            await this.checkFreePreview(userId, inputHash);

        // Today's price from the database (superadmins can change it); stored on the analysis as creditsSpent
        const cost = await this.pricing.costOf(input.type);

        let analysis;

        try {
            analysis = await this.prisma.$transaction(async (tx) => {
                if (cost > 0) {
                    const charged = await tx.credit.updateMany({
                        where: { 
                            userId, 
                            balance: { 
                                gte: cost 
                            } 
                        },
                        data: { 
                            balance: { 
                                decrement: cost
                            } 
                        }
                    });
                    if (charged.count !== 1) throw new InsufficientCreditsError();
                }

                const created = await tx.analysis.create({
                    data: {
                        ...key,
                        resumeId: input.resumeId,
                        creditsSpent: cost,
                        jobTitle: input.type === 'JOB_MATCH' ? (input.jobTitle ?? null) : null,
                        jobDescription,
                    },
                    select: summary,
                });

                if (cost > 0) {
                    await tx.creditTransaction.create({
                        data: { 
                            userId, 
                            delta: -cost, 
                            reason: 'ANALYSIS', 
                            analysisId: created.id 
                        },
                    });
                }
                return created;
            });
        } catch (error) {
            if (error instanceof InsufficientCreditsError) {
                throw new HttpException(`This needs ${cost} credit${cost === 1 ? '' : 's'}. Buy more to continue.`, HttpStatus.PAYMENT_REQUIRED);
            }
            // Two identical requests raced; the other one created it
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                
                const winner = await this.prisma.analysis.findUniqueOrThrow({
                    where: { 
                        userId_type_inputHash_promptVersion: key 
                    },
                    select: summary,
                });

                return { 
                    ...winner, 
                    reused: true 
                };
            }
            throw error;
        }

        try {
            await this.queue.add(
                ANALYZE_JOB, 
                { 
                    analysisId: analysis.id 
                }, 
                { 
                    ...ANALYZE_JOB_OPTIONS, 
                    jobId: analysis.id 
                }
            );
        } catch (error) {
            this.logger.error(`Enqueue failed for ${analysis.id}: ${error instanceof Error ? error.message : String(error)}`);
            
            await this.runner.failAndRefund(analysis.id, 'ENQUEUE_FAILED');
            throw new ServiceUnavailableException("Couldn't start the analysis. Your credits were returned. Try again.");
        }

        return { ...analysis, reused: false };
    }

    async get(userId: string, id: string) {
        const a = await this.prisma.analysis.findFirst({
            where: { id, userId },
            select: {
                ...summary,
                score: true,
                progressStep: true,
                refunded: true,
                error: true,
                jobTitle: true,
                completedAt: true,
                result: true,
                resume: { select: { fileName: true } },
            },
        });
        if (!a) throw new NotFoundException('Analysis not found');
        const { result, resume, ...rest } = a;
        return { ...rest, fileName: resume.fileName, report: result };
    }

    async sweepStuck() {
        const stuck = await this.prisma.analysis.findMany({
            where: { 
                status: 'QUEUED', 
                createdAt: { 
                    lt: new Date(Date.now() - STUCK_AFTER_MS) 
                } 
            },
            select: { 
                id: true 
            },
            take: 100,
        });

        for (const { id } of stuck) {
            await this.queue.add(
                ANALYZE_JOB, 
                { analysisId: id }, 
                { ...ANALYZE_JOB_OPTIONS, jobId: id }
            );
        }
        
        if (stuck.length) this.logger.warn(`Re-enqueued ${stuck.length} stuck analyses`);
        return { requeued: stuck.length };
    }

    private async checkFreePreview(userId: string, inputHash: string) {
        const [today, usedElsewhere] = await Promise.all([

            this.prisma.analysis.count({
                where: { 
                    userId, 
                    type: 'PREVIEW', 
                    status: { 
                        not: 'FAILED' 
                    }, 
                    createdAt: { 
                        gte: new Date(Date.now() - DAY_MS) 
                    } 
                },
            }),

            this.prisma.analysis.findFirst({
                where: { 
                    type: 'PREVIEW', 
                    inputHash, 
                    userId: { 
                        not: userId 
                    }, 
                    status: { 
                        not: 'FAILED' 
                    } 
                },
                select: { id: true },
            })
        ]);

        if (today >= FREE_PREVIEWS_PER_DAY) {
            throw new HttpException(`You've used today's ${FREE_PREVIEWS_PER_DAY} free previews. Try again tomorrow.`, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (usedElsewhere) {
            this.logger.warn(`Free preview denied for ${userId}: resume already previewed by another account`);
            throw new ForbiddenException('This resume already had its free preview. Run a full analysis instead.');
        }
    }
}
