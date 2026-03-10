import { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config';

export type Role = 'consumer' | 'operator';

declare module 'fastify' {
  interface FastifyRequest {
    role: Role;
  }
}

export function resolveRole(secret: string | undefined): Role | null {
  if (!secret) return null;
  if (config.operatorSecret && secret === config.operatorSecret) return 'operator';
  if (secret === config.adminSecret) return 'consumer';
  return null;
}

export function requireRole(...allowed: Role[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const secret = request.headers['x-admin-secret'] as string | undefined;
    const role = resolveRole(secret);

    if (!role || !allowed.includes(role)) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing X-Admin-Secret header',
      });
      return;
    }

    request.role = role;
  };
}
