import { useEffect } from 'react';
import { useDeviceStore } from '../../devices/store/deviceStore';
import { useLightingStore } from '../store/lightingStore';
import { deviceService } from '../../../services/deviceService';
import { LightState } from '../../../types';

export const useLightEvents = () => {
  const selectedIp = useDeviceStore((state) => state.selectedIp);
  const refreshState = useLightingStore((state) => state.refreshState);

  // Immediate query when selected IP changes
  useEffect(() => {
    if (!selectedIp) return;
    refreshState(selectedIp);
  }, [selectedIp, refreshState]);

  // Event listener subscription
  useEffect(() => {
    let unlistenPromise: Promise<() => void> | null = null;

    unlistenPromise = deviceService.subscribeToDeviceState((payload) => {
      // Get the latest selected IP from the store directly to avoid stale enclosure
      const currentSelectedIp = useDeviceStore.getState().selectedIp;
      if (payload.ip !== currentSelectedIp) return;

      if (payload.online && payload.state) {
        const newState: LightState = {
          state: !!payload.state.state,
          dimming: typeof payload.state.dimming === 'number' ? payload.state.dimming : 60,
        };

        if (payload.state.r !== undefined && payload.state.r !== null) {
          newState.r = payload.state.r;
          newState.g = payload.state.g;
          newState.b = payload.state.b;
        }
        if (payload.state.temp) {
          newState.temp = payload.state.temp;
        }
        if (payload.state.sceneId) {
          newState.sceneId = payload.state.sceneId;
        }

        useLightingStore.setState({ lampState: newState, isConnected: true });
        useDeviceStore.getState().setConnectionStatus('Lámpara conectada');
      } else {
        useLightingStore.setState({ isConnected: false });
        useDeviceStore.getState().setConnectionStatus('Lámpara no responde');
      }
    });

    return () => {
      if (unlistenPromise) {
        unlistenPromise.then((unlisten) => unlisten());
      }
    };
  }, []);
};
