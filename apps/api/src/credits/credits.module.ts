import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service.js';
import { CreditsController } from './credits.controller.js';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { IpReputationService } from '../common/risk/ip-reputation.service.js';
import { WelcomeService } from './welcome.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CreditsController],
  providers: [CreditsService, WelcomeService, IpReputationService],
  exports: [CreditsService]
})
export class CreditsModule {}
