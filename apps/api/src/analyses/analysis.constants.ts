import type { JobsOptions } from 'bullmq';

export const ANALYSIS_QUEUE = 'analysis';
export const ANALYZE_JOB = 'analyze';
export const SWEEP_JOB = 'sweep';

export type AnalyzeJobData = { 
    analysisId: string 
};

export const PROMPT_VERSION = '2026-11-v1';

export const ANALYZE_JOB_OPTIONS: JobsOptions = {
    attempts: 2,
    backoff: { type: 'exponential', delay: 15_000 },
    removeOnComplete: true,
    removeOnFail: 1000,
};

export const WORKER_CONCURRENCY = 3;

export const SWEEP_EVERY_MS = 5 * 60 * 1000;
export const STUCK_AFTER_MS = 10 * 60 * 1000;
