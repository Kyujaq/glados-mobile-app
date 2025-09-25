import { env } from '../../config/environment';
import type { TransportConfig } from './types';

type SanitiseContext = {
  useTls: boolean;
  tailscaleHostname: string;
  tailscaleIp?: string;
  tailscalePort?: number;
};

const hasProtocol = (candidate: string): boolean => /^https?:\/\//i.test(candidate);

const sanitiseBaseUrl = (baseUrl: string | undefined, context: SanitiseContext): string => {
  const protocol = context.useTls ? 'https' : 'http';
  const host = context.tailscaleIp?.trim() || context.tailscaleHostname;
  const portSegment = context.tailscalePort ? `:${context.tailscalePort}` : '';

  if (baseUrl && baseUrl.trim().length > 0) {
    const trimmed = baseUrl.trim();
    if (hasProtocol(trimmed)) {
      return trimmed.replace(/\/+$/, '');
    }
    const stripped = trimmed.replace(/^\/+/, '');
    return `${protocol}://${stripped}`;
  }

  return `${protocol}://${host}${portSegment}`;
};

const parseBoolean = (value: string | boolean | undefined, fallback: boolean): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return fallback;
};

const parsePort = (value: string | number | undefined): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return undefined;
};

export const createTransportConfig = (
  overrides: Partial<TransportConfig> = {},
): TransportConfig => {
  const tailscaleHostname = overrides.tailscaleHostname ?? env.TAILSCALE_HOSTNAME;
  const tailscaleIp = overrides.tailscaleIp ?? (env.TAILSCALE_IP || undefined);
  const tailscalePort = parsePort(overrides.tailscalePort ?? env.TAILSCALE_PORT);
  const useTls = parseBoolean(overrides.useTls ?? env.USE_TLS, true);

  const baseUrl = sanitiseBaseUrl(overrides.baseUrl ?? env.API_BASE_URL, {
    useTls,
    tailscaleHostname,
    tailscaleIp,
    tailscalePort,
  });

  return {
    baseUrl,
    sttPath: overrides.sttPath ?? env.STT_PATH,
    ttsPath: overrides.ttsPath ?? env.TTS_PATH,
    textPath: overrides.textPath ?? env.TEXT_CHAT_PATH,
    healthPath: overrides.healthPath ?? env.HEALTH_PATH,
    tailscaleHostname,
    tailscaleIp,
    tailscalePort,
    useTls,
    authToken: overrides.authToken ?? (env.API_AUTH_TOKEN || undefined),
    defaultHeaders: overrides.defaultHeaders,
    connectionTimeoutMs: overrides.connectionTimeoutMs ?? 2500,
  };
};
