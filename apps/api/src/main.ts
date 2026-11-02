import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { StandardSchemaValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
    bodyParser: false
  });

  const config = app.get(ConfigService)

  const PORT = config.getOrThrow<number>('PORT')
  const frontendOrigin = config.getOrThrow<string>('FRONTEND_URL')

  const trustProxy = config.get<string>('TRUST_PROXY')
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
