import { useDeviceStore } from '../store/deviceStore';

export const getActiveDeviceIp = (): string | null => {
  return useDeviceStore.getState().selectedIp;
};

export const setDeviceConnectionStatus = (status: string) => {
  useDeviceStore.getState().setConnectionStatus(status);
};
