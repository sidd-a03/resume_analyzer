import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { AllowAnonymous, Roles, Session, UserHasPermission, type UserSession } from '@thallesp/nestjs-better-auth';

import {
  updateAnalysisCostsSchema,
  updatePackSchema,
  type UpdateAnalysisCostsInput,
  type UpdatePackInput,
} from '@repo/validation';
import { PricingService } from './pricing.service.js';


@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) { }

  @AllowAnonymous()
  @Get()
  get() {
    return this.pricingService.getPublic();
  }
}


@Controller('admin/pricing')
export class AdminPricingController {
  constructor(private readonly pricingService: PricingService) { }

  @Roles(['admin', 'superadmin'])
  @Get()
  get() {
    return this.pricingService.getAdmin();
  }

  @UserHasPermission({ permissions: { pricing: ['update'] } })
  @Put('packs/:id')
  updatePack(@Session() session: UserSession, @Param('id') id: string, @Body({ schema: updatePackSchema }) body: UpdatePackInput) {
    return this.pricingService.updatePack(session.user, id, body);
  }

  @UserHasPermission({ permissions: { pricing: ['update'] } })
  @Put('costs')
  updateCosts(@Session() session: UserSession, @Body({ schema: updateAnalysisCostsSchema }) body: UpdateAnalysisCostsInput) {
    return this.pricingService.updateCosts(session.user, body);
  }
}
