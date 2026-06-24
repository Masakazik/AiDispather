import net from 'node:net';
import { execSync } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

function waitForPort(port, host = '127.0.0.1', timeoutMs = 60_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ port, host }, () => {
        socket.end();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
          return;
        }
        setTimeout(attempt, 500);
      });
    };

    attempt();
  });
}

async function waitForPostgresReady(timeoutMs = 60_000) {
  const user = process.env.POSTGRES_USER ?? 'homedispatcher';
  const container = process.env.POSTGRES_CONTAINER ?? 'homedispatcher-postgres';
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      execSync(`docker exec ${container} pg_isready -U ${user}`, { stdio: 'pipe' });
      await sleep(1500);
      return;
    } catch {
      await sleep(1000);
    }
  }

  throw new Error(`Postgres container "${container}" did not become ready in time`);
}

const postgresPort = Number(process.env.POSTGRES_PORT ?? 5432);
const redisPort = Number(process.env.REDIS_PORT ?? 6379);

await waitForPort(postgresPort);
await waitForPort(redisPort);
await waitForPostgresReady();
console.log(`Infrastructure ready (Postgres :${postgresPort}, Redis :${redisPort}).`);
