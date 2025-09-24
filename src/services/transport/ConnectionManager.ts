import type { ConnectionState } from '../../providers/AppProvider';
import { env } from '../../config/environment';

export interface TransportConfig {
  baseUrl: string;
  sttPath: string;
  ttsPath: string;
  textPath: string;
  tailscaleHostname: string;
}

const joinUrl = (base: string, path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export class ConnectionManager {
  private state: ConnectionState = 'idle';

  constructor(private readonly config: TransportConfig) {}

  getState(): ConnectionState {
    return this.state;
  }

  buildSttUrl(): string {
    return joinUrl(this.config.baseUrl, this.config.sttPath);
  }

  buildTtsUrl(): string {
    return joinUrl(this.config.baseUrl, this.config.ttsPath);
  }

  buildTextUrl(): string {
    return joinUrl(this.config.baseUrl, this.config.textPath);
  }

  async probeConnection(): Promise<ConnectionState> {
    this.state = 'connecting';
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      this.state = 'connected';
    } catch (error) {
      console.warn('Connection probe failed', error);
      this.state = 'error';
    }
    return this.state;
  }
}

const defaultConfig: TransportConfig = {
  baseUrl: env.API_BASE_URL,
  sttPath: env.STT_PATH,
  ttsPath: env.TTS_PATH,
  textPath: env.TEXT_CHAT_PATH,
  tailscaleHostname: env.TAILSCALE_HOSTNAME,
};

export const transport = new ConnectionManager(defaultConfig);
