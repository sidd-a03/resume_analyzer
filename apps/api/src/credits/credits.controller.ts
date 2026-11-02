import { Controller, Get, Query } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ledgerQuerySchema, type LedgerQuery } from '@repo/validation';
import { CreditsService } from './credits.service.js';

@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}

  @Get()
  getBalance(@Session() session: UserSession) {
    return this.creditsService.getBalance(session.user.id);
  }

  @Get('transactions')
  getTransactions(@Session() session: UserSession, @Query({ schema: ledgerQuerySchema }) query: LedgerQuery) {
    return this.creditsService.getTransactions(session.user.id, query.cursor, query.limit);
  }
}
