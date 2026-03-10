import { request } from 'undici';
import { ChainConfig } from '../chains';

export interface JsonRpcRequest {
  jsonrpc: string;
  method: string;
  params?: unknown[];
  id: number | string;
}

export interface JsonRpcResponse {
  jsonrpc: string;
  id: number | string;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export async function forwardRpcCall(
  chain: ChainConfig,
  body: JsonRpcRequest | JsonRpcRequest[]
): Promise<{ response: JsonRpcResponse | JsonRpcResponse[]; latencyMs: number }> {
  const start = performance.now();

  const { statusCode, body: responseBody } = await request(chain.rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await responseBody.text();
  const latencyMs = Math.round(performance.now() - start);

  if (statusCode !== 200) {
    throw new Error(`Upstream node returned ${statusCode}: ${text}`);
  }

  const response = JSON.parse(text);
  return { response, latencyMs };
}
