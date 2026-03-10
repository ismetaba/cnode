import { FastifyInstance } from 'fastify';
import { config } from '../config';
import {
  getOverview,
  getTopMethods,
  getTimeseries,
  getNetworkBreakdown,
} from '../services/analyticsService';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  // Admin auth for analytics
  app.addHook('preHandler', async (request, reply) => {
    const secret = request.headers['x-admin-secret'] as string | undefined;
    if (secret !== config.adminSecret) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or missing X-Admin-Secret header',
      });
    }
  });

  app.get<{ Querystring: { period?: string } }>(
    '/api/analytics/overview',
    async (request) => {
      const period = (request.query.period || '24h') as
        | '1h'
        | '24h'
        | '7d'
        | '30d';
      return getOverview(period);
    }
  );

  app.get<{ Querystring: { period?: string } }>(
    '/api/analytics/methods',
    async (request) => {
      const period = (request.query.period || '24h') as
        | '1h'
        | '24h'
        | '7d'
        | '30d';
      return { methods: getTopMethods(period) };
    }
  );

  app.get<{ Querystring: { period?: string } }>(
    '/api/analytics/timeseries',
    async (request) => {
      const period = (request.query.period || '24h') as
        | '1h'
        | '24h'
        | '7d'
        | '30d';
      return { series: getTimeseries(period) };
    }
  );

  app.get<{ Querystring: { period?: string } }>(
    '/api/analytics/networks',
    async (request) => {
      const period = (request.query.period || '24h') as
        | '1h'
        | '24h'
        | '7d'
        | '30d';
      return { networks: getNetworkBreakdown(period) };
    }
  );
}
