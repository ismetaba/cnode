import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || '0.0.0.0',
  dbPath: process.env.DB_PATH || './data/cnode.db',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  adminSecret: process.env.ADMIN_SECRET || 'change-me-in-production',
  operatorSecret: process.env.OPERATOR_SECRET || 'operator-secret',
};
