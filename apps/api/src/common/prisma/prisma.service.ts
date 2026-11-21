
import { ConflictException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@repo/database';
import { PrismaPg } from '@prisma/adapter-pg';
import type { AppConfig } from '../../config/configuration.js';

/** Tries in total, including the first one */
const SERIALIZABLE_MAX_ATTEMPTS = 3;

/**
 * Postgres 40001 (serialization failure) or 40P01 (deadlock). Prisma reports it two ways:
 *  - during a query inside the transaction: PrismaClientKnownRequestError with code P2034
 *  - at COMMIT: the adapter's raw DriverAdapterError with cause.kind 'TransactionWriteConflict'
 */
function isWriteConflict(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) return error.code === 'P2034';
    const e = error as { name?: unknown; cause?: { kind?: unknown } } | null;
    return e?.name === 'DriverAdapterError' && e.cause?.kind === 'TransactionWriteConflict';
}

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

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

    /**
     * Runs `fn` as a SERIALIZABLE transaction: Postgres guarantees the result is the same as if the
     * transactions had run one after another. When two of them clash, Postgres cancels one with error
     * 40001 (Prisma: P2034); we run that one again from the start, so it sees the other's committed data.
     *
     * Use it when a transaction reads something, decides based on it, then writes ("check, then act").
     * `fn` may run more than once, so it must only touch the database through `tx`.
     */
    async serializableTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        for (let attempt = 1; ; attempt++) {
            try {
                return await this.$transaction(fn, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
            } catch (error) {
                if (!isWriteConflict(error)) throw error; // a real error (validation, 404, ...): never retry

                if (attempt >= SERIALIZABLE_MAX_ATTEMPTS) {
                    this.logger.warn(`Serializable transaction still conflicting after ${attempt} attempts`);
                    throw new ConflictException('Someone else changed this at the same time. Please try again.');
                }
                this.logger.debug(`Write conflict, running the transaction again (attempt ${attempt + 1})`);
                // Random short wait so the two clashing requests don't retry in lockstep and clash again
                await new Promise((resolve) => setTimeout(resolve, 20 + Math.random() * 80 * attempt));
            }
        }
    }
}
