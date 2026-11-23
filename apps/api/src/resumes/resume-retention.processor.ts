import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { MAINTENANCE_QUEUE, TEXT_CLEANUP_JOB } from './resume-retention.constants.js';
import { ResumeRetentionService } from './resume-retention.service.js';


@Processor(MAINTENANCE_QUEUE, { concurrency: 1 })
export class MaintenanceProcessor extends WorkerHost {
    constructor(private readonly retention: ResumeRetentionService) {
        super();
    }

    async process(job: Job) {
        if (job.name === TEXT_CLEANUP_JOB) return this.retention.clearExpiredText();
        throw new Error(`Unknown maintenance job "${job.name}"`);
    }
}
