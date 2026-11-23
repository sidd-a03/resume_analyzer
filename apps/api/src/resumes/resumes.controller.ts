import { Controller, Delete } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { ResumesService } from './resumes.service.js';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Throttle({ medium: { limit: 3, ttl: 60_000 } })
  @Delete()
  deleteAll(@Session() session: UserSession) {
    return this.resumesService.deleteAll(session.user.id);
  }
}
