import { FastifyRequest, FastifyReply } from 'fastify';
import { getApiKeyByKey, ApiKey } from '../services/keyManager';
import { getWorkspaceForKey, Workspace } from '../services/workspaceManager';

declare module 'fastify' {
  interface FastifyRequest {
    apiKey: ApiKey;
    workspace: Workspace;
  }
}

export async function apiKeyAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const key = request.headers['x-api-key'] as string | undefined;

  if (!key) {
    reply.status(401).send({
      error: 'Missing API key',
      message: 'Provide your API key via the X-API-Key header',
    });
    return;
  }

  const apiKey = getApiKeyByKey(key);
  if (!apiKey) {
    reply.status(401).send({
      error: 'Invalid API key',
      message: 'The provided API key is not valid or has been deactivated',
    });
    return;
  }

  const workspace = getWorkspaceForKey(apiKey.id);
  if (!workspace || !workspace.active) {
    reply.status(403).send({
      error: 'Workspace inactive',
      message: 'The workspace associated with this API key has been deactivated',
    });
    return;
  }

  request.apiKey = apiKey;
  request.workspace = workspace;
}
