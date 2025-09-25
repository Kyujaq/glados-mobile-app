import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../config';
import { createTransportConfig, transport } from '../services/transport';

export const STORAGE_KEY = '@glados/settings/v1';

const booleanFromString = (value: string): boolean => value.trim().toLowerCase() === 'true';

export interface AppSettings {
  baseUrl: string;
  sttPath: string;
  ttsPath: string;
  textPath: string;
  healthPath: string;
  tailscaleHostname: string;
  tailscaleIp: string;
  tailscalePort: string;
  useTls: boolean;
  apiAuthToken: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  baseUrl: env.API_BASE_URL,
  sttPath: env.STT_PATH,
  ttsPath: env.TTS_PATH,
  textPath: env.TEXT_CHAT_PATH,
  healthPath: env.HEALTH_PATH,
  tailscaleHostname: env.TAILSCALE_HOSTNAME,
  tailscaleIp: env.TAILSCALE_IP,
  tailscalePort: env.TAILSCALE_PORT,
  useTls: booleanFromString(env.USE_TLS),
  apiAuthToken: env.API_AUTH_TOKEN,
};

type PartialSettings = Partial<AppSettings>;

interface SettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  lastSavedAt: number | null;
  updateSettings: (updates: PartialSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const sanitizeSettings = (raw: unknown): PartialSettings => {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const candidate = raw as Record<string, unknown>;
  const result: PartialSettings = {};

  if (typeof candidate.baseUrl === 'string') {
    result.baseUrl = candidate.baseUrl;
  }
  if (typeof candidate.sttPath === 'string') {
    result.sttPath = candidate.sttPath;
  }
  if (typeof candidate.ttsPath === 'string') {
    result.ttsPath = candidate.ttsPath;
  }
  if (typeof candidate.textPath === 'string') {
    result.textPath = candidate.textPath;
  }
  if (typeof candidate.healthPath === 'string') {
    result.healthPath = candidate.healthPath;
  }
  if (typeof candidate.tailscaleHostname === 'string') {
    result.tailscaleHostname = candidate.tailscaleHostname;
  }
  if (typeof candidate.tailscaleIp === 'string') {
    result.tailscaleIp = candidate.tailscaleIp;
  }
  if (candidate.tailscalePort !== undefined) {
    result.tailscalePort = String(candidate.tailscalePort);
  }
  if (candidate.useTls !== undefined) {
    if (typeof candidate.useTls === 'boolean') {
      result.useTls = candidate.useTls;
    } else if (typeof candidate.useTls === 'string') {
      result.useTls = booleanFromString(candidate.useTls);
    }
  }
  if (candidate.apiAuthToken !== undefined && candidate.apiAuthToken !== null) {
    result.apiAuthToken = String(candidate.apiAuthToken);
  }

  return result;
};

export const settingsToConfigOverrides = (settings: AppSettings) => ({
  baseUrl: settings.baseUrl.trim() || undefined,
  sttPath: settings.sttPath.trim(),
  ttsPath: settings.ttsPath.trim(),
  textPath: settings.textPath.trim(),
  healthPath: settings.healthPath.trim(),
  tailscaleHostname: settings.tailscaleHostname.trim(),
  tailscaleIp: settings.tailscaleIp.trim() || undefined,
  tailscalePort: settings.tailscalePort.trim()
    ? Number.parseInt(settings.tailscalePort.trim(), 10)
    : undefined,
  useTls: settings.useTls,
  authToken: settings.apiAuthToken.trim() || undefined,
});

export const SettingsProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const settingsRef = useRef<AppSettings>(DEFAULT_SETTINGS);

  const applyTransportSettings = useCallback(async (next: AppSettings) => {
    const overrides = settingsToConfigOverrides(next);
    const config = createTransportConfig(overrides);
    transport.setConfig(config);
    try {
      await transport.probeConnection();
    } catch (probeError) {
      console.warn('Transport probe after settings update failed', probeError);
    }
  }, []);

  const persistSettings = useCallback(async (next: AppSettings) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setLastSavedAt(Date.now());
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = sanitizeSettings(JSON.parse(raw));
          const merged = { ...DEFAULT_SETTINGS, ...parsed } as AppSettings;
          settingsRef.current = merged;
          setSettings(merged);
          await applyTransportSettings(merged);
        } else {
          settingsRef.current = DEFAULT_SETTINGS;
          await applyTransportSettings(DEFAULT_SETTINGS);
        }
      } catch (bootstrapError) {
        console.error('Failed to load settings from storage', bootstrapError);
        setError('Failed to load saved settings. Using defaults.');
        settingsRef.current = DEFAULT_SETTINGS;
        await applyTransportSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [applyTransportSettings]);

  const updateSettings = useCallback(
    async (updates: PartialSettings) => {
      setError(null);
      const nextState = { ...settingsRef.current, ...updates } as AppSettings;
      settingsRef.current = nextState;
      setSettings(nextState);

      try {
        await persistSettings(nextState);
        await applyTransportSettings(nextState);
      } catch (updateError) {
        console.error('Failed to persist settings', updateError);
        setError('Unable to save settings. Please try again.');
      }
    },
    [applyTransportSettings, persistSettings],
  );

  const resetSettings = useCallback(async () => {
    try {
      settingsRef.current = DEFAULT_SETTINGS;
      setSettings(DEFAULT_SETTINGS);
      await AsyncStorage.removeItem(STORAGE_KEY);
      await applyTransportSettings(DEFAULT_SETTINGS);
      setLastSavedAt(Date.now());
    } catch (resetError) {
      console.error('Failed to reset settings', resetError);
      setError('Unable to reset settings.');
    }
  }, [applyTransportSettings]);

  const value = useMemo(
    () => ({ settings, loading, error, lastSavedAt, updateSettings, resetSettings }),
    [settings, loading, error, lastSavedAt, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextValue => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
