import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { AppConfig } from '../../config/configuration.js';

@Global()
@Module({
    providers: [
        {
            provide: Redis,
            inject: [ConfigService],
            useFactory: (config: ConfigService<AppConfig, true>) => new Redis(config.getOrThrow('redis', { infer: true })),
        },
    ],
    exports: [Redis],
})
export class RedisModule implements OnApplicationShutdown {
    constructor(@Inject(Redis) private readonly redis: Redis) {}

    async onApplicationShutdown() {
        await this.redis.quit();
    }
}
