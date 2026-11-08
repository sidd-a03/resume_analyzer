import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from './config/configuration.js';
import { StandardSchemaValidationPipe } from '@nestjs/common';
import { CacheControlMiddleware } from './common/middleware/cache-control/cache-control.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    bodyParser: false,
    routeConflictPolicy: { 
      duplicate: 'error', 
      shadow: 'warn' 
    },
  });

  app.useSecurityHeaders()

  app.use(CacheControlMiddleware)

  app.set('etag', false)

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService)

  const PORT = config.getOrThrow('port', { infer: true })
  const frontendOrigin = config.getOrThrow('frontendUrl', { infer: true })

  const trustProxy = config.get('trustProxy', { infer: true })
  if (trustProxy) app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy)

  app.setGlobalPrefix("api", { exclude: ['/api/auth/{*path}'] })

  app.enableCors({
    origin: [frontendOrigin],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.enableCsrfProtection({
    trustedOrigins: [frontendOrigin]
  })

  app.enableShutdownHooks()

  app.useGlobalPipes(new StandardSchemaValidationPipe())

  await app.listen(PORT);
}
await bootstrap();
