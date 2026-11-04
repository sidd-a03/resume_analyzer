import { validateEnv } from './env.js';

const configuration = () => {
    const env = validateEnv(process.env);
    return {
        nodeEnv: env.NODE_ENV,
        port: env.PORT,
        frontendUrl: env.FRONTEND_URL,
        trustProxy: env.TRUST_PROXY,
        observe: {
            appKey: env.OBSERVE_APP_KEY,
            appSecret: env.OBSERVE_APP_SECRET,
        },
        database: {
            url: env.DATABASE_URL,
        },
        auth: {
            secret: env.BETTER_AUTH_SECRET,
            url: env.BETTER_AUTH_URL,
            clientIpHeader: env.CLIENT_IP_HEADER,
            google: { 
                clientId: env.GOOGLE_CLIENT_ID, 
                clientSecret: env.GOOGLE_CLIENT_SECRET 
            },
            github: { 
                clientId: env.GITHUB_CLIENT_ID, 
                clientSecret: env.GITHUB_CLIENT_SECRET
             },
            turnstileSecretKey: env.TURNSTILE_SECRET_KEY,
        },
        razorpay: {
            keyId: env.RAZORPAY_KEY_ID,
            keySecret: env.RAZORPAY_KEY_SECRET,
        },
        redis: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
            password: env.REDIS_PASSWORD,
        },
        retention: {
            days: env.RETENTION_DAYS,
        },
        phoneHash: {
            secret: env.PHONE_HASH_SECRET,
        },
    };
};

export type AppConfig = ReturnType<typeof configuration>;

export default configuration;
