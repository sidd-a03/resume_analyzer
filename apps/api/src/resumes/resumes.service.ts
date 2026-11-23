import { ConflictException, Injectable, Logger } from '@nestjs/common';
import type { AnalysisStatus } from '@repo/database';
import { PrismaService } from '../common/prisma/prisma.service.js';

const ACTIVE = { 
    status: { 
        in: ['QUEUED', 'RUNNING'] as const satisfies AnalysisStatus[] 
    } 
};

@Injectable()
export class ResumesService {
    private readonly logger = new Logger(ResumesService.name);

    constructor(private readonly prisma: PrismaService) {}

    async deleteAll(userId: string) {

        if (await this.prisma.analysis.count({ 
            where: { userId, ...ACTIVE } 
        })) {
            throw new ConflictException('An analysis is still running. Wait for it to finish, then try again.');
        }

        const { count } = await this.prisma.resume.deleteMany({
            where: { 
                userId, 
                analyses: { 
                    none: ACTIVE 
                } 
            },
        });

        this.logger.log(`Deleted ${count} resumes at the owner's request`);
        return { deleted: count };
    }
}
