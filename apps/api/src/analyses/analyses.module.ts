import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AiModule } from '@nestjs/ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import type { AppConfig } from '../config/configuration.js';
import { ANALYSIS_QUEUE } from './analysis.constants.js';
import { AnalysesController } from './analyses.controller.js';
import { AnalysesService } from './analyses.service.js';
import { AnalysisProcessor } from './analysis.processor.js';
import { AnalysisRunner } from './analysis-runner.service.js';
import { ResumeAnalyzer } from './resume-analyzer.service.js';

const usageLogger = new Logger('AiUsage');

@Module({
  imports: [
    PrismaModule,

    BullModule.registerQueue({ name: ANALYSIS_QUEUE }),

    AiModule.forRootAsync({
      modelNames: ['preview', 'full'],
      inject: [ConfigService],

      useFactory: (config: ConfigService<AppConfig, true>) => {
        const gemini = config.getOrThrow('gemini', { infer: true });        
        const google = createGoogleGenerativeAI({ apiKey: gemini.apiKey });

        return {
          models: {

            preview: { 
              model: google(gemini.previewModel), 
              maxOutputTokens: 2_000, 
              temperature: 0.2 
            },

            full: { 
              model: google(gemini.fullModel), 
              maxOutputTokens: 8_000, 
              temperature: 0.2 
            },
          },
          defaults: { 
            timeout: '90s', 
            retry: { 
              attempts: 3 
            } 
          },
          onUsage: (e) =>
            usageLogger.log(`${e.label} ${e.model.modelId}: ${e.usage.inputTokens} in / ${e.usage.outputTokens} out, ${e.durationMs}ms`),
        };
      },
    }),
  ],
  controllers: [AnalysesController],
  providers: [AnalysesService, AnalysisRunner, ResumeAnalyzer, AnalysisProcessor],
})
export class AnalysesModule {}
