import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { historyQuerySchema, startAnalysisSchema, type HistoryQuery, type StartAnalysisInput } from '@repo/validation';
import { AnalysesService } from './analyses.service.js';

@Controller('analyses')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Throttle({ medium: { limit: 10, ttl: 60_000 } })
  @Post()
  start(@Session() session: UserSession, @Body({ schema: startAnalysisSchema }) body: StartAnalysisInput) {
    return this.analysesService.start(session.user.id, body);
  }

  @Get()
  list(@Session() session: UserSession, @Query({ schema: historyQuerySchema }) query: HistoryQuery) {
    return this.analysesService.list(session.user.id, query);
  }

  @Get(':id')
  get(@Session() session: UserSession, @Param('id', ParseUUIDPipe) id: string) {
    return this.analysesService.get(session.user.id, id);
  }
}
