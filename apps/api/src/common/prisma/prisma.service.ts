
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@repo/database';
import { PrismaPg } from '@prisma/adapter-pg';
import type { AppConfig } from '../../config/configuration.js';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService<AppConfig, true>) {
        const adapter = new PrismaPg({
            connectionString: configService.getOrThrow('database.url', { infer: true }),
        });
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
