import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
    protected override async getTracker(req: Record<string, any>): Promise<string> {
        const userId: string | undefined = req.user?.id;
        return userId ? `user:${userId}` : `ip:${req.ip}`;
    }
}
