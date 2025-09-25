import { TransportClient } from '../TransportClient';
import { TransportError } from '../types';

type MockResponseOptions = {
  ok?: boolean;
  status?: number;
  body?: unknown;
  arrayBuffer?: Response['arrayBuffer'];
  contentType?: string;
};

const createMockResponse = (options: MockResponseOptions = {}): Response => {
  const { ok = true, status = 200, body, arrayBuffer, contentType = 'application/json' } = options;

  return {
    ok,
    status,
    json: jest.fn(async () => body) as Response['json'],
    arrayBuffer:
      arrayBuffer ?? (jest.fn(async () => new ArrayBuffer(0)) as Response['arrayBuffer']),
    headers: {
      get: jest.fn((key: string) => (key.toLowerCase() === 'content-type' ? contentType : null)),
    } as unknown as Headers,
  } as Response;
};

describe('TransportClient', () => {
  const baseConfig = {
    baseUrl: 'https://device.tailnet.ts.net',
    sttPath: '/api/stt/stream',
    ttsPath: '/api/tts/stream',
    textPath: '/api/chat/text',
    healthPath: '/healthz',
    tailscaleHostname: 'device.tailnet.ts.net',
    useTls: true,
  } as const;

  const noopAbortController = class {
    signal = { aborted: false } as AbortSignal;
    abort = jest.fn();
  };

  it('probes connectivity and updates state to connected', async () => {
    const fetchMock = jest.fn(async () => createMockResponse());
    const transport = new TransportClient(baseConfig, {
      fetch: fetchMock as unknown as typeof fetch,
      AbortController: noopAbortController as unknown as typeof AbortController,
    });

    const states: string[] = [];
    transport.subscribe(state => states.push(state));

    await expect(transport.probeConnection()).resolves.toBe('connected');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://device.tailnet.ts.net/healthz',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(states).toEqual(['idle', 'connecting', 'connected']);
  });

  it('raises TransportError on failed health probe', async () => {
    const response = createMockResponse({ ok: false, status: 503, body: { error: 'offline' } });
    const fetchMock = jest.fn(async () => response);
    const transport = new TransportClient(baseConfig, {
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(transport.probeConnection()).rejects.toThrow(TransportError);
    expect(transport.getState()).toBe('error');
  });

  it('sends text messages and returns structured result', async () => {
    const fetchMock = jest.fn(async (_input, init) => {
      const payload = JSON.parse(String(init?.body));
      expect(payload).toEqual({ message: 'Hello', conversationId: undefined, metadata: undefined });
      return createMockResponse({ body: { reply: 'Hi there!', conversationId: 'conv1' } });
    });
    const transport = new TransportClient(baseConfig, {
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await transport.sendTextMessage({ message: 'Hello' });

    expect(result.reply).toBe('Hi there!');
    expect(result.conversationId).toBe('conv1');
  });

  it('uploads audio chunks with metadata headers', async () => {
    const fetchMock = jest.fn(async (_input, init) => {
      expect(init?.headers).toMatchObject({
        'Content-Type': 'application/octet-stream',
        'X-Session-Id': 'sess-123',
        'X-Final-Chunk': 'true',
      });
      return createMockResponse({ body: { sessionId: 'sess-123', status: 'completed' } });
    });

    const transport = new TransportClient(baseConfig, {
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await transport.sendAudioChunk({
      chunk: new Uint8Array([1, 2, 3]),
      sessionId: 'sess-123',
      isLastChunk: true,
    });

    expect(result.status).toBe('completed');
  });

  it('requests TTS speech and returns audio payload', async () => {
    const fetchMock = jest.fn(async () =>
      createMockResponse({
        arrayBuffer: jest.fn(
          async () => new Uint8Array([5, 6, 7]).buffer,
        ) as Response['arrayBuffer'],
        contentType: 'audio/wav',
      }),
    );
    const transport = new TransportClient(baseConfig, {
      fetch: fetchMock as unknown as typeof fetch,
    });

    const response = await transport.requestTtsSpeech({ text: 'Ping' });

    expect(fetchMock).toHaveBeenCalled();
    expect(response.mimeType).toBe('audio/wav');
    expect(response.audio.byteLength).toBe(3);
  });
});
