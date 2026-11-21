import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { AdminPricingController, PricingController } from './pricing.controller.js';
import { PricingCache } from './pricing.cache.js';
import { PricingService } from './pricing.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PricingController, AdminPricingController],
  providers: [PricingService, PricingCache],
  exports: [PricingService],
})
export class PricingModule {}
