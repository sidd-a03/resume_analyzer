import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration, { type AppConfig } from './config/configuration.js';
import { validateEnv } from './config/env.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { createAuth } from './common/auth/auth.js';
import { PrismaModule } from './common/prisma/prisma.module.js';
import { RedisModule } from './common/redis/redis.module.js';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './utils/transform.interceptor.js';
import { CreditsModule } from './credits/credits.module.js';
import { RateLimitModule } from './common/throttler/rate-limit.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { BullModule } from '@nestjs/bullmq';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com,
    // then run `npx @nestjs/observe link` to write your key pair into .env.
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'api',
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [configuration]
    }),

    AuthModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({ auth: createAuth(config) }),
    }),

    RateLimitModule,

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => ({
        connection: config.getOrThrow('redis', { infer: true }),
      }),
    }),

    PrismaModule,

    RedisModule,

    CreditsModule,

    UploadsModule,

  ],
  controllers: [AppController],
  providers: [
    AppService, 
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}
