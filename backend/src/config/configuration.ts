export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string[];
  databaseUrl: string;
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cacheTtl: number;
  maxWebhookSecret: string;
  max: {
    apiBaseUrl: string;
    botToken: string;
    mode: 'webhook' | 'long_polling';
    longPollingTimeoutSec: number;
  };
  yandexAi: {
    apiKey: string;
    baseUrl: string;
    projectId: string;
    promptId: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  databaseUrl: process.env.DATABASE_URL ?? '',
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  cacheTtl: parseInt(process.env.CACHE_TTL ?? '60', 10),
  maxWebhookSecret: process.env.MAX_WEBHOOK_SECRET ?? 'dev-max-webhook-secret',
  max: {
    apiBaseUrl: process.env.MAX_API_BASE_URL ?? 'https://platform-api.max.ru',
    botToken: process.env.MAX_BOT_TOKEN ?? '',
    mode: (process.env.MAX_MODE ?? 'webhook') as 'webhook' | 'long_polling',
    longPollingTimeoutSec: parseInt(process.env.MAX_LONG_POLLING_TIMEOUT_SEC ?? '25', 10),
  },
  yandexAi: {
    apiKey: process.env.YANDEX_AI_API_KEY ?? '',
    baseUrl: process.env.YANDEX_AI_BASE_URL ?? 'https://ai.api.cloud.yandex.net/v1',
    projectId: process.env.YANDEX_AI_PROJECT_ID ?? '',
    promptId: process.env.YANDEX_AI_PROMPT_ID ?? '',
  },
});
