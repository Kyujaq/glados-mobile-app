import type { ConnectionState } from '../../providers/AppProvider';
import { createTransportConfig } from './transportConfig';
import type {
  AudioChunkPayload,
  AudioChunkResult,
  TransportConfig,
  TransportDependencies,
  TextMessagePayload,
  TextMessageResult,
  TtsRequestPayload,
  TtsResponse,
} from './types';
import { TransportError } from './types';

type StateListener = (state: ConnectionState) => void;

const hasProtocol = (value: string): boolean => /^https?:\/\//i.test(value);
const normalizePath = (path: string): string => {
  if (hasProtocol(path)) {
    return path;
  }
  if (path.startsWith('/')) {
    return path;
  }
  return `/${path}`;
};
const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export class TransportClient {
  private config: TransportConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly AbortControllerImpl?: typeof AbortController;
  private state: ConnectionState = 'idle';
  private readonly listeners = new Set<StateListener>();

  constructor(config: TransportConfig, dependencies: TransportDependencies = {}) {
    this.config = config;
    this.fetchImpl = dependencies.fetch ?? (globalThis.fetch as typeof fetch);
    this.AbortControllerImpl =
      dependencies.AbortController ??
      (globalThis.AbortController as typeof AbortController | undefined);

    if (!this.fetchImpl) {
      throw new TransportError('Fetch implementation is required for TransportClient');
    }
  }

  static create(
    overrides: Partial<TransportConfig> = {},
    dependencies: TransportDependencies = {},
  ): TransportClient {
    const config = createTransportConfig(overrides);
    return new TransportClient(config, dependencies);
  }

  getState(): ConnectionState {
    return this.state;
  }

  getConfig(): TransportConfig {
    return this.config;
  }

  setConfig(nextConfig: TransportConfig): void {
    this.config = nextConfig;
    this.setState('idle');
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setState(next: ConnectionState): void {
    if (this.state === next) {
      return;
    }
    this.state = next;
    this.listeners.forEach(listener => listener(this.state));
  }

  private buildUrl(path: string): string {
    if (hasProtocol(path)) {
      return path;
    }

    const base = trimTrailingSlash(this.config.baseUrl);
    const normalized = normalizePath(path);
    return `${base}${normalized}`;
  }

  private createHeaders(extra: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json, */*;q=0.8',
      ...this.config.defaultHeaders,
      ...extra,
    };

    if (this.config.authToken) {
      headers.Authorization = `Bearer ${this.config.authToken}`;
    }

    return headers;
  }

  async probeConnection(
    timeoutMs = this.config.connectionTimeoutMs ?? 2500,
  ): Promise<ConnectionState> {
    this.setState('connecting');
    const controller = this.AbortControllerImpl ? new this.AbortControllerImpl() : undefined;
    const timeout = controller ? setTimeout(() => controller.abort(), timeoutMs) : undefined;

    try {
      const response = await this.fetchImpl(this.buildUrl(this.config.healthPath), {
        method: 'GET',
        headers: this.createHeaders(),
        signal: controller?.signal,
      });

      if (!response.ok) {
        this.setState('error');
        throw new TransportError('Health probe failed', { status: response.status });
      }

      this.setState('connected');
      return this.state;
    } catch (error) {
      this.setState('error');
      if (error instanceof TransportError) {
        throw error;
      }
      throw new TransportError('Connection probe failed', { cause: error });
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
  }

  async sendTextMessage(payload: TextMessagePayload): Promise<TextMessageResult> {
    const response = await this.fetchImpl(this.buildUrl(this.config.textPath), {
      method: 'POST',
      headers: this.createHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        message: payload.message,
        conversationId: payload.conversationId,
        metadata: payload.metadata,
      }),
    });

    const rawBody = await this.safeParseJson(response);

    if (!response.ok) {
      throw new TransportError('Text message request failed', {
        status: response.status,
        cause: rawBody,
      });
    }

    const replyText = this.extractReplyText(rawBody);

    return {
      conversationId:
        rawBody && typeof rawBody === 'object' && 'conversationId' in rawBody
          ? ((rawBody as Record<string, unknown>).conversationId as string | null)
          : payload.conversationId ?? null,
      prompt: payload.message,
      reply: replyText,
      raw: rawBody,
    };
  }

  async sendAudioChunk(payload: AudioChunkPayload): Promise<AudioChunkResult> {
    const buffer = this.toUint8Array(payload.chunk);
    const headers: Record<string, string> = {
      'Content-Type': 'application/octet-stream',
    };

    if (payload.sessionId) {
      headers['X-Session-Id'] = payload.sessionId;
    }

    if (payload.isLastChunk) {
      headers['X-Final-Chunk'] = 'true';
    }

    const response = await this.fetchImpl(this.buildUrl(this.config.sttPath), {
      method: 'POST',
      headers: this.createHeaders(headers),
      body: buffer,
    });

    const rawBody = await this.safeParseJson(response);

    if (!response.ok) {
      throw new TransportError('STT chunk upload failed', {
        status: response.status,
        cause: rawBody,
      });
    }

    const sessionId =
      (rawBody && typeof rawBody === 'object' && 'sessionId' in rawBody
        ? (rawBody as Record<string, unknown>).sessionId
        : undefined) ??
      payload.sessionId ??
      '';
    const status =
      (rawBody && typeof rawBody === 'object' && 'status' in rawBody
        ? ((rawBody as Record<string, unknown>).status as AudioChunkResult['status'])
        : undefined) ?? 'queued';

    return { sessionId, status, raw: rawBody };
  }

  async requestTtsSpeech(payload: TtsRequestPayload): Promise<TtsResponse> {
    const response = await this.fetchImpl(this.buildUrl(this.config.ttsPath), {
      method: 'POST',
      headers: this.createHeaders({
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg, audio/wav;q=0.9, application/json;q=0.5',
      }),
      body: JSON.stringify({
        text: payload.text,
        sessionId: payload.sessionId,
        voice: payload.voice,
        metadata: payload.metadata,
      }),
    });

    if (!response.ok) {
      const rawBody = await this.safeParseJson(response);
      throw new TransportError('TTS request failed', {
        status: response.status,
        cause: rawBody,
      });
    }

    const mimeType = response.headers.get('content-type') ?? 'audio/mpeg';
    const audio = await response.arrayBuffer();

    return {
      audio,
      mimeType,
    };
  }

  private extractReplyText(raw: unknown): string {
    if (!raw || typeof raw !== 'object') {
      return '';
    }

    const candidate =
      (raw as Record<string, unknown>).reply ?? (raw as Record<string, unknown>).message;
    if (typeof candidate === 'string') {
      return candidate;
    }

    if (Array.isArray((raw as Record<string, unknown>).messages)) {
      const messages = (raw as Record<string, unknown>).messages as Array<Record<string, unknown>>;
      const assistantMessage = messages.find(msg => msg.role === 'assistant');
      if (assistantMessage && typeof assistantMessage.content === 'string') {
        return assistantMessage.content;
      }
    }

    return '';
  }

  private toUint8Array(chunk: ArrayBuffer | Uint8Array): Uint8Array {
    return chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
  }

  private async safeParseJson(response: Response): Promise<unknown> {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('json')) {
      return null;
    }

    try {
      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'SyntaxError') {
        return null;
      }
      throw error;
    }
  }
}
