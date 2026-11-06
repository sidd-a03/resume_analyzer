import { randomUUID } from 'node:crypto';
import { Controller, Get, HttpCode, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ledgerQuerySchema, type LedgerQuery } from '@repo/validation';
import type { Request, Response } from 'express';
import type { AppConfig } from '../config/configuration.js';
import { CreditsService } from './credits.service.js';
import { WelcomeService } from './welcome.service.js';

const DEVICE_COOKIE = 'resumelens_device';
const DEVICE_COOKIE_MAX_AGE_MS = 2 * 365 * 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('credits')
export class CreditsController {
  private readonly secureCookies: boolean;

  constructor(
    private readonly creditsService: CreditsService,
    private readonly welcomeService: WelcomeService,
    config: ConfigService<AppConfig, true>,
  ) {
    this.secureCookies = config.getOrThrow('nodeEnv', { infer: true }) === 'production';
  }

  @Get()
  getBalance(@Session() session: UserSession) {
    return this.creditsService.getBalance(session.user.id);
  }

  @Get('transactions')
  getTransactions(@Session() session: UserSession, @Query({ schema: ledgerQuerySchema }) query: LedgerQuery) {
    return this.creditsService.getTransactions(session.user.id, query.cursor, query.limit);
  }

  @Throttle({ medium: { limit: 5, ttl: 60_000 } })
  @Post('welcome')
  @HttpCode(200)
  claimWelcome(@Session() session: UserSession, @Req() req: Request, @Res({ passthrough: true }) res: Response) {

    const existing = readCookie(req.headers.cookie, DEVICE_COOKIE);
    const deviceId = existing && UUID.test(existing) ? existing : randomUUID();
    
    res.cookie(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      secure: this.secureCookies,
      sameSite: 'lax',
      path: '/',
      maxAge: DEVICE_COOKIE_MAX_AGE_MS,
    });

    return this.welcomeService.claim(session.user.id, deviceId, req.ip);
  }
}

function readCookie(header: string | undefined, name: string) {
  for (const part of header?.split(';') ?? []) {
    const [key, ...value] = part.trim().split('=');
    if (key !== name) continue;
    try {
      return decodeURIComponent(value.join('='));
    } catch {
      return undefined;
    }
  }
  return undefined;
}
