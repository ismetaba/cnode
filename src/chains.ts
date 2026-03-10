export interface ChainConfig {
  slug: string;
  name: string;
  chainId: number;
  type: 'evm' | 'solana' | 'bitcoin' | 'cosmos';
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl?: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  testnet: boolean;
  enabled: boolean;
}

// Chain registry — add new chains here, gateway picks them up automatically.
// rpcUrl points to your own node or an upstream provider.
export const chains: ChainConfig[] = [
  // ── Ethereum ──────────────────────────────────────────
  {
    slug: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    type: 'evm',
    rpcUrl: process.env.RPC_ETHEREUM || 'http://127.0.0.1:8545',
    wsUrl: process.env.WS_ETHEREUM || 'ws://127.0.0.1:8546',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: true,
  },
  {
    slug: 'ethereum-sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    type: 'evm',
    rpcUrl: process.env.RPC_ETHEREUM_SEPOLIA || 'http://127.0.0.1:8547',
    wsUrl: process.env.WS_ETHEREUM_SEPOLIA || 'ws://127.0.0.1:8548',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    enabled: true,
  },
  {
    slug: 'ethereum-holesky',
    name: 'Ethereum Holesky',
    chainId: 17000,
    type: 'evm',
    rpcUrl: process.env.RPC_ETHEREUM_HOLESKY || 'http://127.0.0.1:8549',
    explorerUrl: 'https://holesky.etherscan.io',
    nativeCurrency: { name: 'Holesky Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── BNB Smart Chain ───────────────────────────────────
  {
    slug: 'bsc',
    name: 'BNB Smart Chain',
    chainId: 56,
    type: 'evm',
    rpcUrl: process.env.RPC_BSC || 'http://127.0.0.1:8550',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'bsc-testnet',
    name: 'BNB Smart Chain Testnet',
    chainId: 97,
    type: 'evm',
    rpcUrl: process.env.RPC_BSC_TESTNET || 'http://127.0.0.1:8551',
    explorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Polygon ───────────────────────────────────────────
  {
    slug: 'polygon',
    name: 'Polygon',
    chainId: 137,
    type: 'evm',
    rpcUrl: process.env.RPC_POLYGON || 'http://127.0.0.1:8552',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'polygon-amoy',
    name: 'Polygon Amoy',
    chainId: 80002,
    type: 'evm',
    rpcUrl: process.env.RPC_POLYGON_AMOY || 'http://127.0.0.1:8553',
    explorerUrl: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Arbitrum ──────────────────────────────────────────
  {
    slug: 'arbitrum',
    name: 'Arbitrum One',
    chainId: 42161,
    type: 'evm',
    rpcUrl: process.env.RPC_ARBITRUM || 'http://127.0.0.1:8554',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    type: 'evm',
    rpcUrl: process.env.RPC_ARBITRUM_SEPOLIA || 'http://127.0.0.1:8555',
    explorerUrl: 'https://sepolia.arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Optimism ──────────────────────────────────────────
  {
    slug: 'optimism',
    name: 'Optimism',
    chainId: 10,
    type: 'evm',
    rpcUrl: process.env.RPC_OPTIMISM || 'http://127.0.0.1:8556',
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'optimism-sepolia',
    name: 'Optimism Sepolia',
    chainId: 11155420,
    type: 'evm',
    rpcUrl: process.env.RPC_OPTIMISM_SEPOLIA || 'http://127.0.0.1:8557',
    explorerUrl: 'https://sepolia-optimistic.etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Base ──────────────────────────────────────────────
  {
    slug: 'base',
    name: 'Base',
    chainId: 8453,
    type: 'evm',
    rpcUrl: process.env.RPC_BASE || 'http://127.0.0.1:8558',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'base-sepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    type: 'evm',
    rpcUrl: process.env.RPC_BASE_SEPOLIA || 'http://127.0.0.1:8559',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Avalanche ─────────────────────────────────────────
  {
    slug: 'avalanche',
    name: 'Avalanche C-Chain',
    chainId: 43114,
    type: 'evm',
    rpcUrl: process.env.RPC_AVALANCHE || 'http://127.0.0.1:8560',
    explorerUrl: 'https://snowscan.xyz',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  {
    slug: 'avalanche-fuji',
    name: 'Avalanche Fuji',
    chainId: 43113,
    type: 'evm',
    rpcUrl: process.env.RPC_AVALANCHE_FUJI || 'http://127.0.0.1:8561',
    explorerUrl: 'https://testnet.snowscan.xyz',
    nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
    testnet: true,
    enabled: false,
  },
  // ── Fantom ────────────────────────────────────────────
  {
    slug: 'fantom',
    name: 'Fantom Opera',
    chainId: 250,
    type: 'evm',
    rpcUrl: process.env.RPC_FANTOM || 'http://127.0.0.1:8562',
    explorerUrl: 'https://ftmscan.com',
    nativeCurrency: { name: 'FTM', symbol: 'FTM', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Linea ─────────────────────────────────────────────
  {
    slug: 'linea',
    name: 'Linea',
    chainId: 59144,
    type: 'evm',
    rpcUrl: process.env.RPC_LINEA || 'http://127.0.0.1:8563',
    explorerUrl: 'https://lineascan.build',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── zkSync Era ────────────────────────────────────────
  {
    slug: 'zksync',
    name: 'zkSync Era',
    chainId: 324,
    type: 'evm',
    rpcUrl: process.env.RPC_ZKSYNC || 'http://127.0.0.1:8564',
    explorerUrl: 'https://explorer.zksync.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Scroll ────────────────────────────────────────────
  {
    slug: 'scroll',
    name: 'Scroll',
    chainId: 534352,
    type: 'evm',
    rpcUrl: process.env.RPC_SCROLL || 'http://127.0.0.1:8565',
    explorerUrl: 'https://scrollscan.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Mantle ────────────────────────────────────────────
  {
    slug: 'mantle',
    name: 'Mantle',
    chainId: 5000,
    type: 'evm',
    rpcUrl: process.env.RPC_MANTLE || 'http://127.0.0.1:8566',
    explorerUrl: 'https://mantlescan.xyz',
    nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Celo ──────────────────────────────────────────────
  {
    slug: 'celo',
    name: 'Celo',
    chainId: 42220,
    type: 'evm',
    rpcUrl: process.env.RPC_CELO || 'http://127.0.0.1:8567',
    explorerUrl: 'https://celoscan.io',
    nativeCurrency: { name: 'CELO', symbol: 'CELO', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Gnosis ────────────────────────────────────────────
  {
    slug: 'gnosis',
    name: 'Gnosis',
    chainId: 100,
    type: 'evm',
    rpcUrl: process.env.RPC_GNOSIS || 'http://127.0.0.1:8568',
    explorerUrl: 'https://gnosisscan.io',
    nativeCurrency: { name: 'xDAI', symbol: 'xDAI', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Blast ─────────────────────────────────────────────
  {
    slug: 'blast',
    name: 'Blast',
    chainId: 81457,
    type: 'evm',
    rpcUrl: process.env.RPC_BLAST || 'http://127.0.0.1:8569',
    explorerUrl: 'https://blastscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Mode ──────────────────────────────────────────────
  {
    slug: 'mode',
    name: 'Mode',
    chainId: 34443,
    type: 'evm',
    rpcUrl: process.env.RPC_MODE || 'http://127.0.0.1:8570',
    explorerUrl: 'https://modescan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Zora ──────────────────────────────────────────────
  {
    slug: 'zora',
    name: 'Zora',
    chainId: 7777777,
    type: 'evm',
    rpcUrl: process.env.RPC_ZORA || 'http://127.0.0.1:8571',
    explorerUrl: 'https://explorer.zora.energy',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Cronos ────────────────────────────────────────────
  {
    slug: 'cronos',
    name: 'Cronos',
    chainId: 25,
    type: 'evm',
    rpcUrl: process.env.RPC_CRONOS || 'http://127.0.0.1:8572',
    explorerUrl: 'https://cronoscan.com',
    nativeCurrency: { name: 'CRO', symbol: 'CRO', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Moonbeam ──────────────────────────────────────────
  {
    slug: 'moonbeam',
    name: 'Moonbeam',
    chainId: 1284,
    type: 'evm',
    rpcUrl: process.env.RPC_MOONBEAM || 'http://127.0.0.1:8573',
    explorerUrl: 'https://moonscan.io',
    nativeCurrency: { name: 'GLMR', symbol: 'GLMR', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Harmony ───────────────────────────────────────────
  {
    slug: 'harmony',
    name: 'Harmony',
    chainId: 1666600000,
    type: 'evm',
    rpcUrl: process.env.RPC_HARMONY || 'http://127.0.0.1:8574',
    explorerUrl: 'https://explorer.harmony.one',
    nativeCurrency: { name: 'ONE', symbol: 'ONE', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Kaia (ex-Klaytn) ─────────────────────────────────
  {
    slug: 'kaia',
    name: 'Kaia',
    chainId: 8217,
    type: 'evm',
    rpcUrl: process.env.RPC_KAIA || 'http://127.0.0.1:8575',
    explorerUrl: 'https://kaiascan.io',
    nativeCurrency: { name: 'KAIA', symbol: 'KAIA', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Sei ───────────────────────────────────────────────
  {
    slug: 'sei',
    name: 'Sei',
    chainId: 1329,
    type: 'evm',
    rpcUrl: process.env.RPC_SEI || 'http://127.0.0.1:8576',
    explorerUrl: 'https://seitrace.com',
    nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Unichain ──────────────────────────────────────────
  {
    slug: 'unichain',
    name: 'Unichain',
    chainId: 130,
    type: 'evm',
    rpcUrl: process.env.RPC_UNICHAIN || 'http://127.0.0.1:8577',
    explorerUrl: 'https://uniscan.xyz',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── World Chain ───────────────────────────────────────
  {
    slug: 'worldchain',
    name: 'World Chain',
    chainId: 480,
    type: 'evm',
    rpcUrl: process.env.RPC_WORLDCHAIN || 'http://127.0.0.1:8578',
    explorerUrl: 'https://worldscan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Polygon zkEVM ─────────────────────────────────────
  {
    slug: 'polygon-zkevm',
    name: 'Polygon zkEVM',
    chainId: 1101,
    type: 'evm',
    rpcUrl: process.env.RPC_POLYGON_ZKEVM || 'http://127.0.0.1:8579',
    explorerUrl: 'https://zkevm.polygonscan.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
  // ── Starknet ──────────────────────────────────────────
  {
    slug: 'starknet',
    name: 'Starknet',
    chainId: 0, // Starknet uses its own chain identification
    type: 'evm', // Starknet is not EVM but uses JSON-RPC
    rpcUrl: process.env.RPC_STARKNET || 'http://127.0.0.1:8580',
    explorerUrl: 'https://starkscan.co',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    testnet: false,
    enabled: false,
  },
];

// Build lookup maps for fast access
const slugMap = new Map<string, ChainConfig>();
const chainIdMap = new Map<number, ChainConfig[]>();

for (const chain of chains) {
  slugMap.set(chain.slug, chain);
  const existing = chainIdMap.get(chain.chainId) || [];
  existing.push(chain);
  chainIdMap.set(chain.chainId, existing);
}

export function getChainBySlug(slug: string): ChainConfig | undefined {
  return slugMap.get(slug);
}

export function getEnabledChains(): ChainConfig[] {
  return chains.filter((c) => c.enabled);
}

export function getAllChains(): ChainConfig[] {
  return chains;
}
