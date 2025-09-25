import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { transport } from '../services';
import { useSettings } from './SettingsProvider';

export type InteractionMode = 'voice' | 'text' | 'settings';
export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

interface AppContextValue {
  interactionMode: InteractionMode;
  setInteractionMode: (mode: InteractionMode) => void;
  connectionState: ConnectionState;
  setConnectionState: (state: ConnectionState) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('voice');
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const { loading: settingsLoading } = useSettings();

  useEffect(() => {
    if (settingsLoading) {
      return;
    }

    const unsubscribe = transport.subscribe(setConnectionState);
    transport.probeConnection().catch(() => undefined);
    return unsubscribe;
  }, [settingsLoading]);

  const value = useMemo(
    () => ({ interactionMode, setInteractionMode, connectionState, setConnectionState }),
    [interactionMode, connectionState],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  return context;
};
