type EnvironmentKeys =
  | 'API_BASE_URL'
  | 'STT_PATH'
  | 'TTS_PATH'
  | 'TEXT_CHAT_PATH'
  | 'TAILSCALE_HOSTNAME';

type Environment = Record<EnvironmentKeys, string>;

const DEFAULTS: Environment = {
  API_BASE_URL: 'https://tailscale-node.local',
  STT_PATH: '/api/stt/stream',
  TTS_PATH: '/api/tts/stream',
  TEXT_CHAT_PATH: '/api/chat/text',
  TAILSCALE_HOSTNAME: 'tailscale-node.local',
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
  TAILSCALE_HOSTNAME: readEnv('TAILSCALE_HOSTNAME'),
};
