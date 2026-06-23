import { useEffect } from 'react';
import { useLightingStore } from '../store/lightingStore';

export const useCircadianAutoClear = () => {
  const circadianActive = useLightingStore((s) => s.circadianActive);
  const setCircadianActive = useLightingStore((s) => s.setCircadianActive);

  useEffect(() => {
    if (!circadianActive) return;
    const timer = setTimeout(() => {
      setCircadianActive(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [circadianActive, setCircadianActive]);
};
