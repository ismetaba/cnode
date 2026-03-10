import { FastifyInstance } from 'fastify';
import { resolveRole } from '../middleware/roleAuth';

export async function roleRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: { secret: string } }>('/api/auth/role', async (request, reply) => {
    const { secret } = request.body || {};
    if (!secret) {
      return reply.status(400).send({ error: 'secret is required' });
    }

    const role = resolveRole(secret);
    if (!role) {
      return reply.status(401).send({ error: 'Invalid secret' });
    }

    return { role };
  });
}
