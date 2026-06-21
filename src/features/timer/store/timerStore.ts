import { create } from 'zustand';
import { useLightingStore } from '../../lighting/store/lightingStore';

interface TimerState {
  timerActive: boolean;
  timerSeconds: number;
  totalTimerSeconds: number;
  timerFadeOut: boolean;
  initialDimming: number;

  // Actions
  startTimer: (minutes: number, fadeOut: boolean, currentDimming: number) => void;
  tickTimer: () => void;
  cancelTimer: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timerActive: false,
  timerSeconds: 0,
  totalTimerSeconds: 0,
  timerFadeOut: false,
  initialDimming: 100,

  startTimer: (minutes, fadeOut, currentDimming) => {
    const seconds = minutes * 60;
    set({
      timerActive: true,
      timerSeconds: seconds,
      totalTimerSeconds: seconds,
      timerFadeOut: fadeOut,
      initialDimming: currentDimming,
    });
  },

  tickTimer: () => {
    const { timerSeconds, timerFadeOut, totalTimerSeconds, initialDimming, cancelTimer } = get();
    if (timerSeconds <= 1) {
      cancelTimer();
      // Turn off light
      useLightingStore.getState().setLampState({ state: false });
    } else {
      const nextSecs = timerSeconds - 1;
      set({ timerSeconds: nextSecs });

      // Gradual Fade-out calculation:
      // Adjust dimming every 15 seconds to avoid network spam.
      if (timerFadeOut && nextSecs % 15 === 0) {
        const progress = nextSecs / totalTimerSeconds; // 1.0 down to 0.0
        const minDim = 10;
        const range = initialDimming - minDim;
        if (range > 0) {
          const targetDimming = Math.max(minDim, Math.round(minDim + range * progress));
          const currentDimming = useLightingStore.getState().lampState.dimming;
          if (targetDimming !== currentDimming) {
            useLightingStore.getState().setLampState({ dimming: targetDimming });
          }
        }
      }
    }
  },

  cancelTimer: () => {
    set({
      timerActive: false,
      timerSeconds: 0,
      totalTimerSeconds: 0,
      timerFadeOut: false,
    });
  },
}));
