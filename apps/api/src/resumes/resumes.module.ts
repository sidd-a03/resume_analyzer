import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { MAINTENANCE_QUEUE } from './resume-retention.constants.js';
import { MaintenanceProcessor } from './resume-retention.processor.js';
import { ResumeRetentionService } from './resume-retention.service.js';
import { ResumesController } from './resumes.controller.js';
import { ResumesService } from './resumes.service.js';

/**
 * The resumes a user already has: deleting them on request, and clearing their text once they expire.
 * Getting a new file in lives in UploadsModule.
 */
@Module({
  imports: [PrismaModule, BullModule.registerQueue({ name: MAINTENANCE_QUEUE })],
  controllers: [ResumesController],
  providers: [ResumesService, ResumeRetentionService, MaintenanceProcessor],
})
export class ResumesModule {}
