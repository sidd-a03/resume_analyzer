import type {} from 'multer'; 
import { createHash, randomUUID } from 'node:crypto';
import { basename } from 'node:path';
import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    Logger,
    UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RESUME_UPLOAD } from '@repo/validation';
import { extractText, getDocumentProxy } from 'unpdf';
import { PrismaService } from '../common/prisma/prisma.service.js';
import type { AppConfig } from '../config/configuration.js';

const PARSE_TIMEOUT_MS = 10_000;

const MAX_CONCURRENT_PARSES = 4;

const UPLOAD_LOCK_TTL_MS = 60_000;

const RELEASE_LOCK = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) end return 0`;

@Injectable()
export class UploadsService {
    private readonly logger = new Logger(UploadsService.name);
    private readonly retentionDays: number;
    private activeParses = 0;
    private readonly parseQueue: (() => void)[] = [];

    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: Redis,
        config: ConfigService<AppConfig, true>,
    ) {
        this.retentionDays = config.getOrThrow('retention.days', { infer: true });
    }

    async uploadResume(userId: string, file: Express.Multer.File) {
        const fileName = this.cleanFileName(file.originalname);

        if (!fileName.toLowerCase().endsWith(RESUME_UPLOAD.extension)) {
            throw new BadRequestException('Only .pdf files are accepted');
        }

        const lockKey = `upload-lock:${userId}`;
        const lockToken = randomUUID();
        const locked = await this.redis.set(lockKey, lockToken, 'PX', UPLOAD_LOCK_TTL_MS, 'NX');
        
        if (!locked) {
            throw new HttpException('Another upload is still being processed. Try again in a moment.', HttpStatus.TOO_MANY_REQUESTS);
        }

        try {
            const { pages, text } = await this.withParseSlot(() => this.extract(file.buffer));

            const textContent = text.replace(/\s+/g, ' ').trim();

            if (textContent.length < RESUME_UPLOAD.minTextChars) {
                throw new UnprocessableEntityException(
                    "We couldn't find readable text in this PDF. It looks scanned or image-only, which isn't supported yet.",
                );
            }
            if (textContent.length > RESUME_UPLOAD.maxTextChars) {
                throw new UnprocessableEntityException('This PDF has too much text for a resume.');
            }

            const contentHash = createHash('sha256').update(textContent.toLowerCase()).digest('hex');

            const expiresAt = new Date(Date.now() + this.retentionDays * 24 * 60 * 60 * 1000);
            const data = { fileName, sizeBytes: file.size, pages, textContent, expiresAt };


            const resume = await this.prisma.resume.upsert({
                where: { userId_contentHash: { userId, contentHash } },
                create: { ...data, userId, contentHash },
                update: data,
                select: { id: true, fileName: true, sizeBytes: true, pages: true, expiresAt: true, createdAt: true },
            });

            return resume;
        } finally {
            await this.redis.eval(RELEASE_LOCK, 1, lockKey, lockToken);
        }
    }

    private async extract(buffer: Buffer) {

        const pdf = await getDocumentProxy(new Uint8Array(buffer)).catch((error: unknown) => {
            const name = error instanceof Error ? error.name : '';

            if (name === 'PasswordException') {
                throw new UnprocessableEntityException('This PDF is password-protected. Remove the password and upload it again.');
            }
            throw new UnprocessableEntityException("This file couldn't be read as a PDF. It may be damaged.");
        });

        try {
            if (pdf.numPages > RESUME_UPLOAD.maxPages) {
                throw new UnprocessableEntityException(`Resumes can be at most ${RESUME_UPLOAD.maxPages} pages. This one has ${pdf.numPages}.`);
            }

            let timer: NodeJS.Timeout | undefined;
            const timeout = new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () => reject(new UnprocessableEntityException('This PDF took too long to read. Try exporting it again.')),
                    PARSE_TIMEOUT_MS,
                );
            });

            try {
                const { text } = await Promise.race([extractText(pdf, { mergePages: true }), timeout]);
                return { pages: pdf.numPages, text };

            } catch (error) {
                if (error instanceof HttpException) throw error;

                this.logger.warn(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`);

                throw new UnprocessableEntityException("We couldn't read the text in this PDF.");
            } finally {
                clearTimeout(timer);
            }
        } finally {
            await pdf.loadingTask.destroy();
        }
    }

    private async withParseSlot<T>(task: () => Promise<T>): Promise<T> {
        if (this.activeParses >= MAX_CONCURRENT_PARSES) {
            await new Promise<void>((resolve) => this.parseQueue.push(resolve));
        }
        this.activeParses++;
        try {
            return await task();
        } finally {
            this.activeParses--;
            this.parseQueue.shift()?.();
        }
    }

    private cleanFileName(name: string) {
        const decoded = Buffer.from(name, 'latin1').toString('utf8');

        const cleaned = basename(decoded.replaceAll('\\', '/')).replace(/\p{Cc}/gu, '').trim();
        return cleaned.slice(-200) || 'resume.pdf';
    }
}
