import { DEFAULT_SETTINGS, sanitizeSettings, settingsToConfigOverrides } from '../SettingsProvider';

describe('Settings helpers', () => {
  it('sanitizes partial persisted values', () => {
    const raw = {
      baseUrl: ' https://example.com ',
      sttPath: '/stt',
      useTls: 'false',
      tailscalePort: 4433,
      apiAuthToken: 123,
      ignored: 'value',
    };

    const result = sanitizeSettings(raw);

    expect(result).toEqual({
      baseUrl: ' https://example.com ',
      sttPath: '/stt',
      useTls: false,
      tailscalePort: '4433',
      apiAuthToken: '123',
    });
  });

  it('builds config overrides from settings', () => {
    const overrides = settingsToConfigOverrides({
      ...DEFAULT_SETTINGS,
      baseUrl: 'http://example.local',
      sttPath: '/v1/stt',
      ttsPath: '/v1/tts',
      textPath: '/v1/chat',
      healthPath: '/health',
      tailscaleHostname: 'host.tailnet.ts.net',
      tailscaleIp: '100.64.0.10',
      tailscalePort: '4433',
      useTls: true,
      apiAuthToken: 'abc',
    });

    expect(overrides).toEqual({
      baseUrl: 'http://example.local',
      sttPath: '/v1/stt',
      ttsPath: '/v1/tts',
      textPath: '/v1/chat',
      healthPath: '/health',
      tailscaleHostname: 'host.tailnet.ts.net',
      tailscaleIp: '100.64.0.10',
      tailscalePort: 4433,
      useTls: true,
      authToken: 'abc',
    });
  });
});
