import Fastify from 'fastify';
import { config } from './config';
import { rpcRoutes } from './routes/rpc';
import { authRoutes } from './routes/auth';
import { analyticsRoutes } from './routes/analytics';
import { roleRoutes } from './routes/role';
import { operatorRoutes } from './routes/operator';
import { getEnabledChains, getAllChains } from './services/chainManager';
import { startHealthChecker } from './services/healthChecker';

const app = Fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
    },
  },
  bodyLimit: 32 * 1024, // 32 KB max request body
});

// CORS
app.addHook('onRequest', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header(
    'Access-Control-Allow-Headers',
    'Content-Type, X-API-Key, X-Admin-Secret'
  );
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (request.method === 'OPTIONS') {
    reply.status(204).send();
  }
});

// Health check
app.get('/health', async () => ({
  status: 'ok',
  uptime: process.uptime(),
  enabledChains: getEnabledChains().length,
  totalChains: getAllChains().length,
}));

// Register routes
app.register(roleRoutes);
app.register(rpcRoutes);
app.register(authRoutes);
app.register(analyticsRoutes);
app.register(operatorRoutes);

// Start
app.listen({ port: config.port, host: config.host }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`CNode API Gateway running at ${address}`);
  app.log.info(`Enabled chains: ${getEnabledChains().map((c) => c.slug).join(', ')}`);
  startHealthChecker();
});
