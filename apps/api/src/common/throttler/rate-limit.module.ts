import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserThrottlerGuard } from './user-throttler.guard.js';


@Module({
    imports: [
        ThrottlerModule.forRoot([
            { name: 'short', ttl: 1000, limit: 10 },
            { name: 'medium', ttl: 10_000, limit: 50 },
            { name: 'long', ttl: 60_000, limit: 200 },
        ]),
    ],
    providers: [{ provide: APP_GUARD, useClass: UserThrottlerGuard }],
})
export class RateLimitModule {}
