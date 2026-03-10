import { FastifyRequest, FastifyReply } from 'fastify';
import { getRedis, isRedisAvailable } from '../services/redisClient';
import { incrementAndCheckQuota } from '../services/workspaceManager';

// In-memory fallback when Redis is unavailable
const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimit(
  key: string,
  limit: number,
  windowSec = 1
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const redis = getRedis();
  if (redis && isRedisAvailable()) {
    try {
      const redisKey = `rl:${key}`;
      const multi = redis.multi();
      multi.incr(redisKey);
      multi.pttl(redisKey);
      const results = await multi.exec();

      const count = (results?.[0]?.[1] as number) || 0;
      const ttl = (results?.[1]?.[1] as number) || -1;

      if (ttl < 0) {
        await redis.pexpire(redisKey, windowMs);
      }

      const remaining = Math.max(0, limit - count);
      const resetAt = now + (ttl > 0 ? ttl : windowMs);
      return { allowed: count <= limit, remaining, resetAt };
    } catch {
      // Fall through to in-memory on Redis error
    }
  }

  // In-memory fallback
  const entry = memoryStore.get(key);
  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  return { allowed: entry.count <= limit, remaining, resetAt: entry.resetAt };
}

// Cleanup stale in-memory entries every 60s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) memoryStore.delete(key);
  }
}, 60_000);

export async function workspaceQuotaCheck(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const workspace = request.workspace;
  if (!workspace) return;

  const { allowed, used, limit } = incrementAndCheckQuota(
    workspace.id,
    workspace.monthly_quota
  );

  reply.header('X-Workspace-Quota-Limit', limit);
  reply.header('X-Workspace-Quota-Used', used);
  reply.header('X-Workspace-Quota-Remaining', Math.max(0, limit - used));

  if (!allowed) {
    reply.status(429).send({
      error: 'Monthly quota exceeded',
      message: `Workspace "${workspace.name}" has used ${used}/${limit} monthly requests. Upgrade your quota.`,
    });
  }
}

export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = request.apiKey;
  if (!apiKey) return;

  const limit = apiKey.rate_limit > 0 ? apiKey.rate_limit : 1;

  const { allowed, remaining, resetAt } = await checkRateLimit(
    apiKey.id,
    limit
  );

  reply.header('X-RateLimit-Limit', limit);
  reply.header('X-RateLimit-Remaining', remaining);
  reply.header('X-RateLimit-Reset', Math.ceil(resetAt / 1000));

  if (!allowed) {
    reply.status(429).send({
      error: 'Rate limit exceeded',
      message: `Limit: ${limit} req/s. Upgrade your plan for higher limits.`,
    });
  }
}
