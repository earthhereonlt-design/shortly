import Redis from "ioredis";

// Cache/rate-limit layer. Redis is OPTIONAL: if REDIS_URL is unset (or the
// server is unreachable) every helper degrades to a no-op so the request path
// never crashes. The previous version fell back to localhost:6379, which on
// Railway produced an endless stream of unhandled "error" events.

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

const REDIS_URL = process.env.REDIS_URL;

function createClient(): Redis | null {
  if (!REDIS_URL) {
    console.warn(
      "[redis] REDIS_URL not set — caching & rate limiting disabled (degrades gracefully).",
    );
    return null;
  }

  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 2,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    // Fail fast: caching is best-effort, so never retry/reconnect storms.
    retryStrategy: () => null,
  });

  // Without a listener, ioredis emits an UNHANDLED "error" event that can crash
  // the process. Swallow connection errors — caching is non-critical.
  client.on("error", (err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[redis] connection error: ${err.message}`);
    }
  });

  return client;
}

export const redis: Redis | null =
  globalForRedis.redis ?? (globalForRedis.redis = createClient());

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 60,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    /* best-effort */
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length) await redis.del(...keys);
  } catch {
    /* best-effort */
  }
}

/** Increment a counter, optionally setting a TTL on first increment. No-op if
 *  Redis is unavailable. Centralizes the `incr`/`expire` pattern used by rate
 *  limiting and click counters. */
export async function cacheIncr(
  key: string,
  ttlSeconds?: number,
): Promise<void> {
  if (!redis) return;
  try {
    const n = await redis.incr(key);
    if (ttlSeconds && n === 1) await redis.expire(key, ttlSeconds);
  } catch {
    /* best-effort */
  }
}
