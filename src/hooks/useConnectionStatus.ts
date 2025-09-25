import { useCallback, useMemo } from 'react';
import { ConnectionState, useAppContext } from '../providers/AppProvider';
import { transport } from '../services';

export const useConnectionStatus = () => {
  const { connectionState, setConnectionState } = useAppContext();

  const setStatus = useCallback(
    (state: ConnectionState) => {
      setConnectionState(state);
    },
    [setConnectionState],
  );

  const refreshConnection = useCallback(async () => {
    try {
      return await transport.probeConnection();
    } catch (error) {
      setConnectionState('error');
      throw error;
    }
  }, [setConnectionState]);

  return useMemo(
    () => ({
      connectionState,
      setConnectionState: setStatus,
      refreshConnection,
      isConnected: connectionState === 'connected',
    }),
    [connectionState, refreshConnection, setStatus],
  );
};
