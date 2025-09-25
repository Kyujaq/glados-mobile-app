import { createTransportConfig } from '../transportConfig';

describe('createTransportConfig', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('builds config with defaults when overrides are omitted', () => {
    const config = createTransportConfig();

    expect(config.baseUrl).toBe('https://tailscale-node.local');
    expect(config.sttPath).toBe('/api/stt/stream');
    expect(config.ttsPath).toBe('/api/tts/stream');
    expect(config.textPath).toBe('/api/chat/text');
    expect(config.healthPath).toBe('/healthz');
    expect(config.tailscaleHostname).toBe('tailscale-node.local');
    expect(config.useTls).toBe(true);
  });

  it('normalises base url without protocol using TLS flag', () => {
    const config = createTransportConfig({
      baseUrl: 'tailscale-device.tailnet.ts.net',
      useTls: false,
    });

    expect(config.baseUrl).toBe('http://tailscale-device.tailnet.ts.net');
  });

  it('prefers Tailscale IP and port when provided', () => {
    const config = createTransportConfig({
      baseUrl: '',
      tailscaleIp: '100.64.0.1',
      tailscalePort: 4430,
    });

    expect(config.baseUrl).toBe('https://100.64.0.1:4430');
  });

  it('inherits auth token and default headers', () => {
    const config = createTransportConfig({
      authToken: 'abc123',
      defaultHeaders: { 'X-Test': '1' },
    });

    expect(config.authToken).toBe('abc123');
    expect(config.defaultHeaders).toEqual({ 'X-Test': '1' });
  });
});
