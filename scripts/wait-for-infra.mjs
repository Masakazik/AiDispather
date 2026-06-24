import net from 'node:net';

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

const postgresPort = Number(process.env.POSTGRES_PORT ?? 5432);
const redisPort = Number(process.env.REDIS_PORT ?? 6379);

await waitForPort(postgresPort);
await waitForPort(redisPort);
console.log(`Infrastructure ready (Postgres :${postgresPort}, Redis :${redisPort}).`);
