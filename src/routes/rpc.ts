import { FastifyInstance } from 'fastify';
import { getChainBySlug, getEnabledChains } from '../services/chainManager';
import { canAccessNetwork } from '../services/keyManager';
import { forwardRpcCall, JsonRpcRequest } from '../services/rpcProxy';
import { logRequest } from '../services/analyticsService';
import { apiKeyAuth } from '../middleware/apiKeyAuth';
import { workspaceQuotaCheck, rateLimiter } from '../middleware/rateLimiter';

export async function rpcRoutes(app: FastifyInstance): Promise<void> {
  // List available chains
  app.get('/v1/chains', async () => {
    const enabled = getEnabledChains();
    return {
      chains: enabled.map((c) => ({
        slug: c.slug,
        name: c.name,
        chainId: c.chainId,
        type: c.type,
        testnet: c.testnet,
        nativeCurrency: c.nativeCurrency,
        explorerUrl: c.explorerUrl,
      })),
    };
  });

  // JSON-RPC proxy endpoint
  app.post<{ Params: { network: string } }>(
    '/v1/:network',
    { preHandler: [apiKeyAuth, workspaceQuotaCheck, rateLimiter] },
    async (request, reply) => {
      const { network } = request.params;
      const chain = getChainBySlug(network);

      if (!chain || !chain.enabled) {
        return reply.status(404).send({
          error: 'Unknown network',
          message: `Network "${network}" is not available. GET /v1/chains to see available networks.`,
        });
      }

      if (!canAccessNetwork(request.apiKey, network)) {
        return reply.status(403).send({
          error: 'Network not allowed',
          message: `Your API key does not have access to "${network}".`,
        });
      }

      const body = request.body as JsonRpcRequest | JsonRpcRequest[];

      // Basic validation
      const toValidate = Array.isArray(body) ? body : [body];
      for (const req of toValidate) {
        if (!req.jsonrpc || !req.method) {
          return reply.status(400).send({
            error: 'Invalid JSON-RPC request',
            message: 'Request must include "jsonrpc" and "method" fields.',
          });
        }
      }

      try {
        const { response, latencyMs } = await forwardRpcCall(chain, body);

        // Log each method (async, non-blocking)
        const primaryMethod = Array.isArray(body) ? 'batch' : body.method;
        const hasError = Array.isArray(response)
          ? response.some((r) => r.error)
          : !!response.error;

        logRequest(
          request.apiKey.id,
          network,
          primaryMethod,
          hasError ? 502 : 200,
          latencyMs
        );

        reply.header('X-Response-Time', `${latencyMs}ms`);
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown upstream error';
        const primaryMethod = Array.isArray(body) ? 'batch' : body.method;

        logRequest(request.apiKey.id, network, primaryMethod, 502, 0);

        return reply.status(502).send({
          error: 'Upstream node error',
          message,
        });
      }
    }
  );
}
