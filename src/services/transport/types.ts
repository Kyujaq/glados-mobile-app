import type { ConnectionState } from '../../providers/AppProvider';

export interface TransportConfig {
  baseUrl: string;
  sttPath: string;
  ttsPath: string;
  textPath: string;
  healthPath: string;
  tailscaleHostname: string;
  tailscaleIp?: string;
  tailscalePort?: number;
  useTls: boolean;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
  connectionTimeoutMs?: number;
}

export interface TransportDependencies {
  fetch?: typeof fetch;
  AbortController?: typeof AbortController;
}

export interface TextMessagePayload {
  message: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}

export interface TextMessageResult {
  conversationId: string | null;
  prompt: string;
  reply: string;
  raw: unknown;
}

export interface AudioChunkPayload {
  chunk: ArrayBuffer | Uint8Array;
  sessionId?: string;
  isLastChunk?: boolean;
  metadata?: Record<string, unknown>;
}

export interface AudioChunkResult {
  sessionId: string;
  status: 'queued' | 'completed' | 'error';
  raw: unknown;
}

export interface TtsRequestPayload {
  text: string;
  sessionId?: string;
  voice?: string;
  metadata?: Record<string, unknown>;
}

export interface TtsResponse {
  audio: ArrayBuffer;
  mimeType: string;
}

export class TransportError extends Error {
  readonly status?: number;

  constructor(message: string, options?: { cause?: unknown; status?: number }) {
    super(message);
    this.name = 'TransportError';
    if (options?.cause) {
      // @ts-expect-error Cause is not widely typed yet
      this.cause = options.cause;
    }
    this.status = options?.status;
  }
}

export type ConnectionListener = (state: ConnectionState) => void;
