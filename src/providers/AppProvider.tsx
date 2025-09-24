import React, { createContext, useContext, useMemo, useState } from 'react';

export type InteractionMode = 'voice' | 'text';
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
