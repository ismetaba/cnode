import { FastifyInstance } from 'fastify';
import { requireRole } from '../middleware/roleAuth';
import {
  getOverview,
  getTopMethods,
  getTimeseries,
  getNetworkBreakdown,
  getWorkspaceOverview,
  getWorkspaceTopMethods,
  getWorkspaceTimeseries,
  getWorkspaceNetworkBreakdown,
} from '../services/analyticsService';

type Period = '1h' | '24h' | '7d' | '30d';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', requireRole('consumer', 'operator'));

  app.get<{ Querystring: { period?: string; workspace_id?: string } }>(
    '/api/analytics/overview',
    async (request) => {
      const period = (request.query.period || '24h') as Period;
      const wsId = request.query.workspace_id;
      if (wsId) return getWorkspaceOverview(wsId, period);
      return getOverview(period);
    }
  );

  app.get<{ Querystring: { period?: string; workspace_id?: string } }>(
    '/api/analytics/methods',
    async (request) => {
      const period = (request.query.period || '24h') as Period;
      const wsId = request.query.workspace_id;
      if (wsId) return { methods: getWorkspaceTopMethods(wsId, period) };
      return { methods: getTopMethods(period) };
    }
  );

  app.get<{ Querystring: { period?: string; workspace_id?: string } }>(
    '/api/analytics/timeseries',
    async (request) => {
      const period = (request.query.period || '24h') as Period;
      const wsId = request.query.workspace_id;
      if (wsId) return { series: getWorkspaceTimeseries(wsId, period) };
      return { series: getTimeseries(period) };
    }
  );

  app.get<{ Querystring: { period?: string; workspace_id?: string } }>(
    '/api/analytics/networks',
    async (request) => {
      const period = (request.query.period || '24h') as Period;
      const wsId = request.query.workspace_id;
      if (wsId) return { networks: getWorkspaceNetworkBreakdown(wsId, period) };
      return { networks: getNetworkBreakdown(period) };
    }
  );
}
