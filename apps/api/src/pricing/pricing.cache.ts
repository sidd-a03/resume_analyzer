import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';
import type { PublicPricing } from '@repo/validation';
import {
    PRICING_BUMP_RETRY_DELAYS_MS,
    PRICING_CACHE_TTL_SECONDS,
    PRICING_REDIS_TIMEOUT_MS,
    PRICING_VERSION_KEY,
    pricingValueKey,
} from './pricing.constants.js';

const FAILED = Symbol('redis-failed');

@Injectable()
export class PricingCache implements OnModuleDestroy {
    private readonly logger = new Logger(PricingCache.name);
    private readonly inFlight = new Map<string, Promise<PublicPricing>>();
    private retryTimer: NodeJS.Timeout | null = null;

    constructor(private readonly redis: Redis) {}

    async get(load: () => Promise<PublicPricing>): Promise<PublicPricing> {
        const version = await this.safe(
            'version', 
            () => this.redis.get(PRICING_VERSION_KEY)
        );

        if (version === FAILED) return load();

        const key = pricingValueKey(version ?? '0');

        const hit = await this.safe(
            'read', 
            () => this.redis.get(key)
        );

        if (hit === FAILED) return load();

        if (hit) return JSON.parse(hit) as PublicPricing;

        let pending = this.inFlight.get(key);

        if (!pending) {
            pending = this.loadAndStore(key, load).finally(() => this.inFlight.delete(key));
            this.inFlight.set(key, pending);
        }
        return pending;
    }

    async invalidate() {
        if (await this.bumpVersion()) {
            this.cancelRetry();
            return;
        }

        if (this.retryTimer) return; 
        this.logger.warn('Pricing version bump failed; retrying in the background');
        this.scheduleRetry(0);
    }

    onModuleDestroy() {
        this.cancelRetry();
    }

    private async bumpVersion(): Promise<boolean> {
        return (
            await this.safe(
                'invalidate', 
                () => this.redis.incr(PRICING_VERSION_KEY)
            )
        ) !== FAILED;
    }

    private scheduleRetry(attempt: number) {
        const delay = PRICING_BUMP_RETRY_DELAYS_MS[attempt];
        if (delay === undefined) {
            this.retryTimer = null;
            this.logger.error(`Pricing version bump gave up; visitors may see old prices for up to ${PRICING_CACHE_TTL_SECONDS}s`);
            return;
        }

        this.retryTimer = setTimeout(async () => {
            if (await this.bumpVersion()) {
                this.retryTimer = null;
                this.logger.log(`Pricing version bumped on retry ${attempt + 1}`);
                return;
            }
            this.scheduleRetry(attempt + 1);
        }, delay);
        this.retryTimer.unref(); 
    }

    private cancelRetry() {
        if (this.retryTimer) clearTimeout(this.retryTimer);
        this.retryTimer = null;
    }


    private async loadAndStore(key: string, load: () => Promise<PublicPricing>) {
        const fresh = await load();
        await this.safe(
            'write', 
            () => this.redis.set(key, JSON.stringify(fresh), 'EX', PRICING_CACHE_TTL_SECONDS)
        );
        return fresh;
    }

    private async safe<T>(what: string, call: () => Promise<T>): Promise<T | typeof FAILED> {
        let timer: NodeJS.Timeout | undefined;
        try {
            return await Promise.race([
                call(),
                new Promise<never>((_, reject) => {
                    timer = setTimeout(() => reject(new Error(`timed out after ${PRICING_REDIS_TIMEOUT_MS}ms`)), PRICING_REDIS_TIMEOUT_MS);
                }),
            ]);
        } catch (error) {
            this.logger.warn(`Pricing cache ${what} failed: ${(error as Error).message}`);
            return FAILED;
        } finally {
            clearTimeout(timer);
        }
    }
}
