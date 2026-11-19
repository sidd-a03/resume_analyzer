import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { startAnalysisSchema, type StartAnalysisInput } from '@repo/validation';
import { AnalysesService } from './analyses.service.js';

@Controller('analyses')
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Throttle({ medium: { limit: 10, ttl: 60_000 } })
  @Post()
  start(@Session() session: UserSession, @Body({ schema: startAnalysisSchema }) body: StartAnalysisInput) {
    return this.analysesService.start(session.user.id, body);
  }

  @Get(':id')
  get(@Session() session: UserSession, @Param('id', ParseUUIDPipe) id: string) {
    return this.analysesService.get(session.user.id, id);
  }
}
