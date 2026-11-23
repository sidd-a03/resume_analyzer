import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadsService } from './uploads.service.js';
import { UploadsController } from './uploads.controller.js';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { MAINTENANCE_QUEUE } from './resume-retention.constants.js';
import { MaintenanceProcessor } from './resume-retention.processor.js';
import { ResumeRetentionService } from './resume-retention.service.js';

@Module({
  imports: [
    PrismaModule, 
    BullModule.registerQueue({ name: MAINTENANCE_QUEUE })
  ],
  controllers: [UploadsController],
  providers: [UploadsService, ResumeRetentionService, MaintenanceProcessor],
})
export class UploadsModule {}
