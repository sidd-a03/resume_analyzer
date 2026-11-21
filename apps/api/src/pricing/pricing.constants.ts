export const PRICING_VERSION_KEY = 'pricing:version';

export const pricingValueKey = (version: string) => `pricing:public:v1:${version}`;

export const PRICING_CACHE_TTL_SECONDS = 600;

export const PRICING_REDIS_TIMEOUT_MS = 250;

export const PRICING_BUMP_RETRY_DELAYS_MS = [1_000, 2_000, 4_000, 8_000, 15_000, 30_000] as const;
