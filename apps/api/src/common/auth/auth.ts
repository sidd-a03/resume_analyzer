import { betterAuth, BetterAuthOptions } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, captcha, lastLoginMethod, phoneNumber } from "better-auth/plugins";
import { prisma } from "@repo/database";
import { ac, adminRole, regularRole, superadminRole } from "./permission.js";

const authConfig = {
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
            ipAddressHeaders: process.env.CLIENT_IP_HEADER ? [process.env.CLIENT_IP_HEADER] : undefined,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [process.env.FRONTEND_URL as string],
    onAPIError: {
        errorURL: `${process.env.FRONTEND_URL}/?auth=1`,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
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
    plugins: [
        lastLoginMethod(),
        admin({
            ac,
            roles: { regular: regularRole, admin: adminRole, superadmin: superadminRole },
            defaultBanReason: "Spamming",
            defaultBanExpiresIn: 60 * 60 * 24, // 1 day
            bannedUserMessage: (user) => {
                return user.banReason
                    ? `You have been banned. Reason: ${user.banReason}`
                    : "You have been banned from this application. Please contact support if you believe this is an error";
            },
        }),
        phoneNumber({
            sendOTP: async ({ phoneNumber, code }) => {
                if (process.env.NODE_ENV === "production") throw new Error("SMS provider not configured")
                console.log(`[dev] OTP for ${phoneNumber}: ${code}`)
            },

        }),
        captcha({
            provider: "cloudflare-turnstile",
            secretKey: process.env.TURNSTILE_SECRET_KEY as string,
            endpoints: ['/sign-in/social', '/phone-number/send-otp'],
        })
    ]
} satisfies BetterAuthOptions

export const auth = betterAuth(authConfig) as ReturnType<typeof betterAuth<typeof authConfig>>;