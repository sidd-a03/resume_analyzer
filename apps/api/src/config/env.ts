import { z } from 'zod';

const required = z.string().trim().min(1, 'is required');
const optional = z.string().trim().min(1).optional();

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(8080),
    FRONTEND_URL: z.url(),
    TRUST_PROXY: optional,
    CLIENT_IP_HEADER: optional,

    OBSERVE_APP_KEY: optional,
    OBSERVE_APP_SECRET: optional,

    DATABASE_URL: z.url(),

    BETTER_AUTH_SECRET: z.string().min(32, 'must be at least 32 characters'),
    BETTER_AUTH_URL: z.url(),

    GOOGLE_CLIENT_ID: required,
    GOOGLE_CLIENT_SECRET: required,

    GITHUB_CLIENT_ID: required,
    GITHUB_CLIENT_SECRET: required,

    TURNSTILE_SECRET_KEY: required,

    RAZORPAY_KEY_ID: optional,
    RAZORPAY_KEY_SECRET: optional,

    PHONE_HASH_SECRET: z.string().min(32, 'must be at least 32 characters'),
    RETENTION_DAYS: z.coerce.number().int().positive().default(7),

    REDIS_HOST: required,
    REDIS_PORT: z.coerce.number().int().positive(),
    REDIS_PASSWORD: required,
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
    const result = envSchema.safeParse(raw);
    
    if (!result.success) {
        const problems = result.error.issues.map((issue) => `  ${issue.path.join('.')}: ${issue.message}`).join('\n');
        throw new Error(`Invalid environment variables in apps/api/.env:\n${problems}`);
    }
    return result.data;
}
