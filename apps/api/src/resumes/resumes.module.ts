import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module.js';
import { ResumesController } from './resumes.controller.js';
import { ResumesService } from './resumes.service.js';

/** The resumes a user already has: listing, deleting. Getting a new file in lives in UploadsModule. */
@Module({
  imports: [PrismaModule],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
