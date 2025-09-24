import { useCallback } from 'react';
import { ConnectionState, useAppContext } from '../providers/AppProvider';

export const useConnectionStatus = () => {
  const { connectionState, setConnectionState } = useAppContext();

  const setStatus = useCallback(
    (state: ConnectionState) => {
      setConnectionState(state);
    },
    [setConnectionState],
  );

  return { connectionState, setConnectionState: setStatus };
};
