import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from '@nestjs/ai';
import { fullResultSchema, previewResultSchema, REPORT_LIMITS as L, scoreLabel, type AnalysisTypeName } from '@repo/validation';
import { UnrecoverableError } from 'bullmq';
import type { AppConfig } from '../config/configuration.js';
import { buildPrompt, FULL_INSTRUCTIONS, JOB_MATCH_INSTRUCTIONS, PREVIEW_INSTRUCTIONS } from './prompts.js';

export interface AnalyzeInput {
    type: AnalysisTypeName;
    resumeText: string;
    jobTitle?: string | null;
    jobDescription?: string | null;
}

const clampScore = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
const clampCount = (n: number) => Math.max(0, Math.round(n));


@Injectable()
export class ResumeAnalyzer {
    private readonly configured: boolean;

    constructor(
        private readonly ai: AiService,
        config: ConfigService<AppConfig, true>,
    ) {
        this.configured = Boolean(config.getOrThrow('gemini', { infer: true }).apiKey);
    }

    async analyze(input: AnalyzeInput) {
        if (!this.configured) throw new UnrecoverableError('AI_NOT_CONFIGURED');

        if (input.type === 'PREVIEW') {
            const res = await this.ai.generateObject({
                model: 'preview',
                label: 'analysis.preview',
                schema: previewResultSchema,
                schemaName: 'ResumePreview',
                instructions: PREVIEW_INSTRUCTIONS,
                prompt: buildPrompt(input.resumeText),
            });

            const r = res.object;
            const score = clampScore(r.score);

            const report = {
                kind: 'preview' as const,
                score,
                scoreLabel: scoreLabel(score),
                issues: r.issues.slice(0, L.previewIssues),
                // Only sizes of the paid content, never the content itself
                locked: {
                    issues: clampCount(r.counts.issues - Math.min(r.issues.length, L.previewIssues)),
                    sections: Math.min(clampCount(r.counts.sections), L.sections),
                    rewrites: Math.min(clampCount(r.counts.rewrites), L.rewrites),
                    keywords: Math.min(clampCount(r.counts.missingKeywords), L.keywords),
                },
            };

            return { 
                report, 
                score, 
                model: res.model.modelId, 
                usage: res.usage 
            };
        }

        const isJobMatch = input.type === 'JOB_MATCH';

        const res = await this.ai.generateObject({
            model: 'full',
            label: isJobMatch ? 'analysis.job_match' : 'analysis.full',
            schema: fullResultSchema,
            schemaName: 'ResumeReview',
            instructions: isJobMatch ? JOB_MATCH_INSTRUCTIONS : FULL_INSTRUCTIONS,
            prompt: buildPrompt(
                input.resumeText,
                isJobMatch ? { title: input.jobTitle, description: input.jobDescription ?? '' } : undefined,
            ),
        });

        const r = res.object;
        const score = clampScore(r.score);
        const report = {
            kind: 'full' as const,
            score,
            scoreLabel: scoreLabel(score),
            issues: r.issues.slice(0, L.issues),
            sections: r.sections
                .slice(0, L.sections)
                .map((section) => ({ ...section, suggestions: section.suggestions.slice(0, L.suggestionsPerSection) })),
            keywords: { found: r.keywords.found.slice(0, L.keywords), missing: r.keywords.missing.slice(0, L.keywords) },
            rewrites: r.rewrites.slice(0, L.rewrites),
            jobMatch:
                isJobMatch && r.jobMatch
                    ? {
                          jobTitle: input.jobTitle ?? 'This role',
                          match: clampScore(r.jobMatch.match),
                          missing: r.jobMatch.missing.slice(0, L.jobMissing),
                          suggestions: r.jobMatch.suggestions.slice(0, L.jobSuggestions),
                      }
                    : null,
        };
        
        return { 
            report, 
            score, 
            model: res.model.modelId, 
            usage: res.usage 
        };
    }
}
