import { createApiKey } from '../services/keyManager';

const name = process.argv[2] || 'default';
const rateLimit = parseInt(process.argv[3] || '100');
const networks = process.argv[4] || '*';

const key = createApiKey(name, rateLimit, networks);

console.log('\n  API Key created:\n');
console.log(`  ID:         ${key.id}`);
console.log(`  Key:        ${key.key}`);
console.log(`  Name:       ${key.name}`);
console.log(`  Rate Limit: ${key.rate_limit} req/s`);
console.log(`  Networks:   ${key.networks}`);
console.log(`\n  Use it with: -H "X-API-Key: ${key.key}"\n`);
