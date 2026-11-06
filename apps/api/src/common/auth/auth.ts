import type { ConfigService } from "@nestjs/config";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { APIError, createAuthMiddleware, getSessionFromCtx } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, captcha, lastLoginMethod, phoneNumber } from "better-auth/plugins";
import { prisma } from "@repo/database";
import { v7 as uuidv7 } from "uuid";
import { e164PhoneSchema } from "@repo/validation";
import { ac, adminRole, regularRole, superadminRole } from "./permission.js";
import type { AppConfig } from "../../config/configuration.js";

const OTP_QUOTA = { windowMs: 60 * 60 * 1000, perUser: 5, perNumber: 5 };

async function takeQuota(key: string, max: number) {
    const now = Date.now();
    const row = await prisma.rateLimit.findUnique({ where: { key } });
    if (row && now - Number(row.lastRequest) < OTP_QUOTA.windowMs) {
        if (row.count >= max) return false;
        await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
        return true;
    }

    await prisma.rateLimit.upsert({
        where: { key },
        create: { id: uuidv7(), key, count: 1, lastRequest: BigInt(now) },
        update: { count: 1, lastRequest: BigInt(now) },
    });
    return true;
}

function authOptions(config: ConfigService<AppConfig, true>) {
    const env = config.getOrThrow("auth", { infer: true });
    const frontendUrl = config.getOrThrow("frontendUrl", { infer: true });
    const isProduction = config.getOrThrow("nodeEnv", { infer: true }) === "production";

    return {
        database: prismaAdapter(prisma, {
            provider: "postgresql",
        }),
        appName: "ResumeLens",
        rateLimit: {
            enabled: true,
            window: 60,
            max: 100,
            storage: 'database',
            customRules: {
                '/get-session': false,
                '/sign-in/social': { window: 60, max: 10 },
                '/phone-number/send-otp': { window: 60, max: 3 },
            },
        },
        advanced: {
            ipAddress: {
                ipAddressHeaders: env.clientIpHeader ? [env.clientIpHeader] : undefined,
            },

            backgroundTasks: {
                handler: (promise) => void promise,
            },

            database: {
                generateId: () => uuidv7(),
            },
            
            crossSubDomainCookies: env.cookieDomain ? { enabled: true, domain: env.cookieDomain } : undefined,
        },

        disabledPaths: [
            "/sign-in/phone-number",
            "/phone-number/request-password-reset",
            "/phone-number/reset-password",
            "/phone-number/send-otp",
            "/phone-number/verify",
        ],
        hooks: {
            before: createAuthMiddleware(async (ctx) => {
                if (ctx.path === "/phone-number/send-otp") {
                    const session = await getSessionFromCtx(ctx);
                    if (!session) throw new APIError("UNAUTHORIZED", { message: "Sign in to verify a phone number", code: "SIGN_IN_REQUIRED" });
                    const phone = String(ctx.body?.phoneNumber ?? "");
                    const allowed =
                        (await takeQuota(`otp-user|${session.user.id}`, OTP_QUOTA.perUser)) &&
                        (await takeQuota(`otp-phone|${phone}`, OTP_QUOTA.perNumber));
                    if (!allowed) throw new APIError("TOO_MANY_REQUESTS", { message: "Too many codes requested. Try again in an hour.", code: "OTP_QUOTA_EXCEEDED" });
                }

                if (ctx.path === "/phone-number/verify" && ctx.body?.updatePhoneNumber !== true) {
                    throw new APIError("BAD_REQUEST", { message: "Invalid request" });
                }

                if (ctx.path === "/link-social") {
                    const session = await getSessionFromCtx(ctx);
                    const providerId = String(ctx.body?.provider ?? "");
                    if (
                        session 
                        && 
                        await prisma.account.findFirst({ 
                            where: { userId: session.user.id, providerId }, 
                            select: { id: true } 
                        })
                    ) {
                        throw new APIError("CONFLICT", {
                            message: "You already have an account from this provider connected. Disconnect it first.",
                            code: "PROVIDER_ALREADY_CONNECTED",
                        });
                    }
                }
            }),
        },
        secret: env.secret,
        baseURL: env.url,
        trustedOrigins: [frontendUrl],
        onAPIError: {
            errorURL: `${frontendUrl}/?auth=1`,
        },
        socialProviders: {
            google: {
                clientId: env.google.clientId,
                clientSecret: env.google.clientSecret
            },
            github: {
                clientId: env.github.clientId,
                clientSecret: env.github.clientSecret
            }
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)

        },
        account: {
            accountLinking: {
                enabled: true,
                trustedProviders: ["google", "github"],
                allowDifferentEmails: true
            }
        },
        user: {
            deleteUser: { enabled: true },
        },
        plugins: [
            lastLoginMethod(),
            admin({
                ac,
                roles: { regular: regularRole, admin: adminRole, superadmin: superadminRole },
                defaultRole: "regular",
                adminRoles: ["admin", "superadmin"],
                defaultBanReason: "Spamming",
                defaultBanExpiresIn: 60 * 60 * 24, // 1 day
                bannedUserMessage: (user) => {
                    return user.banReason
                        ? `You have been banned. Reason: ${user.banReason}`
                        : "You have been banned from this application. Please contact support if you believe this is an error";
                },
            }),
            phoneNumber({
                phoneNumberValidator: (phoneNumber) => e164PhoneSchema.safeParse(phoneNumber).success,

                sendOTP: async ({ phoneNumber, code }, ctx) => {
                    const owner = await prisma.user.findUnique({ where: { phoneNumber }, select: { id: true } });
                    const caller = ctx ? await getSessionFromCtx(ctx) : null;
  
                    if (owner && owner.id !== caller?.user.id) return;
                    if (isProduction) throw new Error("SMS provider not configured")
                    console.log(`[dev] OTP for ${phoneNumber}: ${code}`)
                },

            }),
            captcha({
                provider: "cloudflare-turnstile",
                secretKey: env.turnstileSecretKey,
                endpoints: ['/sign-in/social', '/phone-number/send-otp'],
            })
        ]
    } satisfies BetterAuthOptions;
}

export function createAuth(config: ConfigService<AppConfig, true>) {
    return betterAuth(authOptions(config)) as ReturnType<typeof betterAuth<ReturnType<typeof authOptions>>>;
}