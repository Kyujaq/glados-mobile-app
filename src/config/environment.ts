type EnvironmentKeys =
  | 'API_BASE_URL'
  | 'STT_PATH'
  | 'TTS_PATH'
  | 'TEXT_CHAT_PATH'
  | 'HEALTH_PATH'
  | 'TAILSCALE_HOSTNAME'
  | 'TAILSCALE_IP'
  | 'TAILSCALE_PORT'
  | 'USE_TLS'
  | 'API_AUTH_TOKEN';

type Environment = Record<EnvironmentKeys, string>;

const DEFAULTS: Environment = {
  API_BASE_URL: 'https://tailscale-node.local',
  STT_PATH: '/api/stt/stream',
  TTS_PATH: '/api/tts/stream',
  TEXT_CHAT_PATH: '/api/chat/text',
  HEALTH_PATH: '/healthz',
  TAILSCALE_HOSTNAME: 'tailscale-node.local',
  TAILSCALE_IP: '',
  TAILSCALE_PORT: '',
  USE_TLS: 'true',
  API_AUTH_TOKEN: '',
};

const readEnv = (key: EnvironmentKeys): string => {
  const source =
    typeof process !== 'undefined'
      ? (process.env as Record<string, string | undefined>)
      : undefined;
  const runtimeEnvSource = globalThis as Record<string, unknown>;
  const runtimeEnv = Reflect.get(runtimeEnvSource, '__APP_ENV__') as
    | Partial<Environment>
    | undefined;
  return runtimeEnv?.[key] ?? source?.[key] ?? DEFAULTS[key];
};

export const env: Environment = {
  API_BASE_URL: readEnv('API_BASE_URL'),
  STT_PATH: readEnv('STT_PATH'),
  TTS_PATH: readEnv('TTS_PATH'),
  TEXT_CHAT_PATH: readEnv('TEXT_CHAT_PATH'),
  HEALTH_PATH: readEnv('HEALTH_PATH'),
  TAILSCALE_HOSTNAME: readEnv('TAILSCALE_HOSTNAME'),
  TAILSCALE_IP: readEnv('TAILSCALE_IP'),
  TAILSCALE_PORT: readEnv('TAILSCALE_PORT'),
  USE_TLS: readEnv('USE_TLS'),
  API_AUTH_TOKEN: readEnv('API_AUTH_TOKEN'),
};
