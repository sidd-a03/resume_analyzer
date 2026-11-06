import { createHmac } from 'node:crypto';
import { ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@repo/database';
import { WELCOME_CREDITS } from '@repo/validation';
import { PrismaService } from '../common/prisma/prisma.service.js';
import { IpReputationService } from '../common/risk/ip-reputation.service.js';
import type { AppConfig } from '../config/configuration.js';

const GITHUB_MIN_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

type Signal = 'identity_reused' | 'device_reused' | 'hosting_ip' | 'new_github_account' | 'daily_cap';

const MESSAGES: Partial<Record<Signal, string>> = {
    hosting_ip: 'Welcome credits can’t be claimed over a VPN or proxy. Turn it off and try again.',
    daily_cap: 'Today’s welcome credits are all claimed. Try again tomorrow.',
};
const NOT_ELIGIBLE = 'This account isn’t eligible for the welcome credit.';

@Injectable()
export class WelcomeService {
    private readonly logger = new Logger(WelcomeService.name);
    private readonly secret: string;
    private readonly dailyCap: number;

    constructor(
        private readonly prisma: PrismaService,
        private readonly ipReputation: IpReputationService,
        config: ConfigService<AppConfig, true>,
    ) {
        const welcome = config.getOrThrow('welcome', { infer: true });
        this.secret = welcome.riskHashSecret;
        this.dailyCap = welcome.dailyCap;
    }

    async claim(userId: string, deviceId: string, ip: string | undefined) {
        if (await this.prisma.welcomeClaim.findUnique({ where: { userId }, select: { id: true } })) {
            throw new ConflictException('You’ve already claimed your welcome credit.');
        }

        const accounts = await this.prisma.account.findMany({
            where: { userId },
            select: { providerId: true, accountId: true },
        });

        const identityHashes = accounts.map((a) => this.hash(`${a.providerId}:${a.accountId}`));
        const deviceHash = this.hash(`device:${deviceId}`);
        const ipHash = ip ? this.hash(`ip:${ip}`) : null;

        const signals = await this.riskSignals(userId, accounts, identityHashes, deviceHash, ip);

        if (signals.length > 0) {
            this.logger.warn(`Welcome credit denied for ${userId}: ${signals.join(', ')}`);
            throw new ForbiddenException(MESSAGES[signals[0]!] ?? NOT_ELIGIBLE);
        }

        try {
            await this.prisma.$transaction(async (tx) => {

                await tx.welcomeClaim.create({ 
                    data: { 
                        userId, 
                        deviceHash, 
                        ipHash, 
                        identityHashes 
                    }
                });

                await tx.credit.upsert({
                    where: { userId },
                    create: { 
                        userId, 
                        balance: WELCOME_CREDITS
                    },
                    update: { 
                        balance: { increment: WELCOME_CREDITS } 
                    },
                });

                await tx.creditTransaction.create({ 
                    data: { 
                        userId, 
                        delta: WELCOME_CREDITS, 
                        reason: 'WELCOME' 
                    } 
                });
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException('You’ve already claimed your welcome credit.');
            }
            throw error;
        }

        return { credits: WELCOME_CREDITS };
    }

    private async riskSignals(
        userId: string,
        accounts: { providerId: string; accountId: string }[],
        identityHashes: string[],
        deviceHash: string,
        ip: string | undefined,
    ) {
        const signals: Signal[] = [];
        const [identityReuse, deviceReuse, claimedToday, githubAgeDays] = await Promise.all([

            this.prisma.welcomeClaim.findFirst({ 
                where: { 
                    identityHashes: { 
                        hasSome: identityHashes 
                    } 
                }, 
                select: { id: true } 
            }),

            this.prisma.welcomeClaim.findFirst({ 
                where: { 
                    deviceHash, 
                    NOT: { userId } 
                }, 
                select: { id: true } 
            
            }),

            this.prisma.welcomeClaim.count({ 
                where: { 
                    claimedAt: { gte: new Date(Date.now() - DAY_MS) } 
                } 
            }),

            this.githubAgeDays(accounts),
        ]);

        if (identityReuse) signals.push('identity_reused');
        if (deviceReuse) signals.push('device_reused');

        if (this.ipReputation.isHostingOrVpn(ip)) signals.push('hosting_ip');

        if (githubAgeDays !== null && githubAgeDays < GITHUB_MIN_AGE_DAYS) signals.push('new_github_account');
        if (claimedToday >= this.dailyCap) signals.push('daily_cap');

        return signals.sort((a, b) => Number(b === 'hosting_ip') - Number(a === 'hosting_ip'));
    }

    private async githubAgeDays(accounts: { providerId: string; accountId: string }[]) {
        const github = accounts.find((a) => a.providerId === 'github');
        if (!github || accounts.some((a) => a.providerId === 'google')) return null;

        try {
            const res = await fetch(
                `https://api.github.com/user/${encodeURIComponent(github.accountId)}`, 
                {
                    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ResumeLens' },
                    signal: AbortSignal.timeout(3000),
                }
            );

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const { created_at } = (await res.json()) as { created_at?: string };

            if (!created_at) throw new Error('no created_at');
            return (Date.now() - new Date(created_at).getTime()) / DAY_MS;

        } catch (error) {
            this.logger.warn(`GitHub age lookup failed: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }

    private hash(value: string) {
        return createHmac('sha256', this.secret).update(value).digest('hex');
    }
}
