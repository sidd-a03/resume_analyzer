import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { removeAllListeners } from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
    bodyParser: false
  });

  const config = app.get(ConfigService)

  const PORT = config.getOrThrow<number>('PORT')
  const frontendOrigin = config.getOrThrow<string>('FRONTEND_URL')

  app.setGlobalPrefix("api")

  app.enableCors({
    origin: [frontendOrigin],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.enableCsrfProtection({
    trustedOrigins: [frontendOrigin]
  })

  app.enableShutdownHooks()

  await app.listen(PORT);
}
await bootstrap();
