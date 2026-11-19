import { Injectable, Logger } from '@nestjs/common';
import { AiModelError, AiOutputError } from '@nestjs/ai';
import { Prisma } from '@repo/database';
import { UnrecoverableError } from 'bullmq';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { ResumeAnalyzer } from './resume-analyzer.service.js';


export function errorCode(error: unknown) {
    if (error instanceof UnrecoverableError) return error.message; // already a code, e.g. TEXT_EXPIRED
    if (error instanceof AiOutputError) return 'AI_BAD_OUTPUT';
    if (error instanceof AiModelError) return 'AI_UNAVAILABLE';
    return 'INTERNAL_ERROR';
}

@Injectable()
export class AnalysisRunner {
    private readonly logger = new Logger(AnalysisRunner.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly analyzer: ResumeAnalyzer,
    ) {}

    async run(analysisId: string) {
        const a = await this.prisma.analysis.findUnique({
            where: { 
                id: analysisId
             },
            include: { 
                resume: { 
                    select: { 
                        textContent: true 
                    } 
                } 
            },
        });

        if (!a || a.status === 'SUCCEEDED' || a.status === 'FAILED') return;

        if (!a.resume.textContent) throw new UnrecoverableError('TEXT_EXPIRED');

        await this.prisma.analysis.update({ 
            where: { 
                id: a.id 
            }, 
            data: { 
                status: 'RUNNING', 
                progressStep: 1 
            }
        });

        const out = await this.analyzer.analyze({
            type: a.type,
            resumeText: a.resume.textContent,
            jobTitle: a.jobTitle,
            jobDescription: a.jobDescription,
        });

        await this.prisma.analysis.update({
            where: { 
                id: a.id 
            },
            data: {
                status: 'SUCCEEDED',
                progressStep: 2,
                result: out.report,
                score: out.score,
                model: out.model,
                inputTokens: out.usage.inputTokens,
                outputTokens: out.usage.outputTokens,
                error: null,
                completedAt: new Date(),
            },
        });
    }

    async failAndRefund(analysisId: string, code: string) {

        const closed = await this.prisma.analysis.updateMany({
            where: { 
                id: analysisId, 
                status: { 
                    in: ['QUEUED', 'RUNNING']
                } 
            },
            data: { 
                status: 'FAILED', 
                error: code, 
                completedAt: new Date() 
            },
        });

        if (closed.count === 0) return;

        const a = await this.prisma.analysis.findUniqueOrThrow({
            where: { 
                id: analysisId 
            },
            select: { 
                userId: true, 
                creditsSpent: true 
            },
        });

        this.logger.warn(`Analysis ${analysisId} failed: ${code}`);
        if (a.creditsSpent === 0) return;

        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.creditTransaction.create({
                    data: { 
                        userId: a.userId, 
                        delta: a.creditsSpent, 
                        reason: 'REFUND', 
                        analysisId 
                    },
                });

                await tx.credit.update({ 
                    where: { 
                        userId: a.userId 
                    }, 
                    data: { 
                        balance: { 
                            increment: a.creditsSpent 
                        } 
                    } 
                });

                await tx.analysis.update({ 
                    where: { 
                        id: analysisId 
                    }, 
                    data: { 
                        refunded: true 
                    } 
                });
            });

        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return; // already refunded
            throw error;
        }
    }
}
