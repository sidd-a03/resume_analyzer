import type {} from 'multer';
import { Controller, FileTypeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { RESUME_UPLOAD } from '@repo/validation';
import { UploadsService } from './uploads.service.js';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Throttle({ medium: { limit: 5, ttl: 60_000 } })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: RESUME_UPLOAD.maxBytes, files: 1, fields: 0 },
    }),
  )
  uploadFile(
    @Session() session: UserSession,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: RESUME_UPLOAD.mimeType, errorMessage: 'Upload a PDF file' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadResume(session.user.id, file);
  }
}
