import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './config/socket';
import prisma from './config/database';
import redis from './config/redis';

const httpServer = http.createServer(app);
initSocket(httpServer);

async function main() {
  await prisma.$connect();
  console.log('✅ Database connected');

  await redis.ping();
  console.log('✅ Redis connected');

  httpServer.listen(env.port, () => {
    console.log(`🚀 Server running on port ${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

// Dev by TrBinhDev
