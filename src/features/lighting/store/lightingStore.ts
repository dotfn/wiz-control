import { create } from 'zustand';
import { WizState } from '../../../types';
import { wizService } from '../../../services/wizService';
import { useDeviceStore } from '../../devices/store/deviceStore';

interface LightingState {
  lampState: WizState;
  isConnected: boolean;
  circadianActive: boolean;

  // Actions
  setLampState: (updates: Partial<WizState>) => Promise<void>;
  refreshState: (ip: string) => Promise<void>;
  applyCircadianRhythm: () => void;
  setIsConnected: (connected: boolean) => void;
  setCircadianActive: (active: boolean) => void;
}

export const useLightingStore = create<LightingState>((set, get) => ({
  lampState: {
    state: false,
    dimming: 60,
    r: 255,
    g: 180,
    b: 84,
  },
  isConnected: false,
  circadianActive: false,

  setLampState: async (updates) => {
    const previousState = get().lampState;
    // Optimistic UI update
    set((prev) => ({ lampState: { ...prev.lampState, ...updates } }));

    const selectedIp = useDeviceStore.getState().selectedIp;
    if (!selectedIp) return;

    try {
      await wizService.control(selectedIp, updates);
      set({ isConnected: true });
      useDeviceStore.getState().setConnectionStatus('Lámpara conectada');
    } catch (e) {
      // Rollback on failure
      set({ lampState: previousState, isConnected: false });
      useDeviceStore.getState().setConnectionStatus('Lámpara no responde');
      console.error('Error al enviar comando de control:', e);
    }
  },

  refreshState: async (ip) => {
    try {
      const data = await wizService.getState(ip);
      if (!data) throw new Error();

      const newState: WizState = {
        state: !!data.state,
        dimming: typeof data.dimming === 'number' ? data.dimming : 60,
      };

      if (data.r !== undefined && data.r !== null) {
        newState.r = data.r;
        newState.g = data.g;
        newState.b = data.b;
      }
      if (data.temp) {
        newState.temp = data.temp;
      }
      if (data.sceneId) {
        newState.sceneId = data.sceneId;
      }

      set({ lampState: newState, isConnected: true });
      useDeviceStore.getState().setConnectionStatus('Lámpara conectada');
    } catch (e) {
      set({ isConnected: false });
      useDeviceStore.getState().setConnectionStatus('Lámpara no responde');
    }
  },

  applyCircadianRhythm: () => {
    const hour = new Date().getHours();
    let temp = 4000;
    let dimming = 80;

    if (hour >= 0 && hour < 6) {
      temp = 2200;
      dimming = 15;
    } else if (hour >= 6 && hour < 9) {
      temp = 3000;
      dimming = 60;
    } else if (hour >= 9 && hour < 17) {
      temp = 5000;
      dimming = 100;
    } else if (hour >= 17 && hour < 20) {
      temp = 3500;
      dimming = 70;
    } else {
      temp = 2700;
      dimming = 40;
    }

    set({ circadianActive: true });
    get().setLampState({ state: true, temp, dimming, sceneId: undefined });

    // Toast/Alert auto-clear
    setTimeout(() => set({ circadianActive: false }), 3000);
  },

  setIsConnected: (connected) => set({ isConnected: connected }),
  setCircadianActive: (active) => set({ circadianActive: active }),
}));
