import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { ANALYSIS_QUEUE, ANALYZE_JOB, SWEEP_JOB, WORKER_CONCURRENCY, type AnalyzeJobData } from './analysis.constants.js';
import { AnalysisRunner, errorCode } from './analysis-runner.service.js';
import { AnalysesService } from './analyses.service.js';

@Processor(ANALYSIS_QUEUE, { concurrency: WORKER_CONCURRENCY })
export class AnalysisProcessor extends WorkerHost {
    private readonly logger = new Logger(AnalysisProcessor.name);

    constructor(
        private readonly runner: AnalysisRunner,
        private readonly analyses: AnalysesService,
    ) {
        super();
    }

    async process(job: Job<AnalyzeJobData>) {
        if (job.name === SWEEP_JOB) return this.analyses.sweepStuck();
        
        return this.runner.run(job.data.analysisId);
    }

    @OnWorkerEvent('failed')
    async onFailed(job: Job<AnalyzeJobData> | undefined, error: Error) {
        if (!job || job.name !== ANALYZE_JOB) return;

        const final = error.name === 'UnrecoverableError' || job.attemptsMade >= (job.opts.attempts ?? 1);

        this.logger.warn(`Job ${job.id} attempt ${job.attemptsMade} failed${final ? ' (final)' : ''}: ${error.message}`);
        
        if (final) await this.runner.failAndRefund(job.data.analysisId, errorCode(error));
    }
}
