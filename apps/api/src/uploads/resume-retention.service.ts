import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { Prisma } from '@repo/database';
import { PrismaService } from '../common/prisma/prisma.service.js';
import {
    MAINTENANCE_QUEUE,
    TEXT_CLEANUP_BATCH,
    TEXT_CLEANUP_EVERY_MS,
    TEXT_CLEANUP_GRACE_MS,
    TEXT_CLEANUP_JOB,
    TEXT_CLEANUP_MAX_BATCHES,
    TEXT_CLEANUP_SCHEDULER_ID,
} from './resume-retention.constants.js';


@Injectable()
export class ResumeRetentionService implements OnModuleInit {
    private readonly logger = new Logger(ResumeRetentionService.name);

    constructor(
        private readonly prisma: PrismaService,
        @InjectQueue(MAINTENANCE_QUEUE) private readonly queue: Queue,
    ) {}

    async onModuleInit() {
        await this.queue.upsertJobScheduler(
            TEXT_CLEANUP_SCHEDULER_ID,
            { every: TEXT_CLEANUP_EVERY_MS },
            { name: TEXT_CLEANUP_JOB, opts: { removeOnComplete: true, removeOnFail: 100 } },
        );
    }

    async clearExpiredText() {
        const cutoff = new Date(Date.now() - TEXT_CLEANUP_GRACE_MS);
        let cleared = 0;

        const expired: Prisma.ResumeWhereInput = {
            expiresAt: { lte: cutoff },
            textContent: { not: null },
            analyses: { 
                none: { 
                    status: { 
                        in: ['QUEUED', 'RUNNING'] 
                    } 
                } 
            },
        };

        for (let batch = 0; batch < TEXT_CLEANUP_MAX_BATCHES; batch++) {

            const rows = await this.prisma.resume.findMany({
                where: expired,
                orderBy: { expiresAt: 'asc' },
                take: TEXT_CLEANUP_BATCH,
                select: { id: true },
            });

            if (rows.length === 0) break;

            const { count } = await this.prisma.resume.updateMany({
                where: { 
                    id: { 
                        in: rows.map((r) => r.id) 
                    }, 
                    ...expired 
                },
                data: { 
                    textContent: null 
                },
            });

            cleared += count;
            if (rows.length < TEXT_CLEANUP_BATCH) break;
        }

        if (cleared) this.logger.log(`Cleared the text of ${cleared} expired resumes`);
        return { cleared };
    }
}
