import { useDeviceStore, DeviceGroup } from '../store/deviceStore';

export const getActiveDeviceIp = (): string | null => {
  const state = useDeviceStore.getState();
  if (state.selectedMac) {
    return state.macToIp[state.selectedMac] ?? null;
  }
  return null;
};

export const getActiveDeviceMac = (): string | null => {
  return useDeviceStore.getState().selectedMac;
};

export const getSelectedGroupId = (): string | null => {
  return useDeviceStore.getState().selectedGroupId;
};

export const getGroupById = (id: string): DeviceGroup | undefined => {
  return useDeviceStore.getState().groups.find((g) => g.id === id);
};

export const resolveMacToIp = (mac: string): string | null => {
  return useDeviceStore.getState().macToIp[mac] ?? null;
};

export const setDeviceConnectionStatus = (status: string) => {
  useDeviceStore.getState().setConnectionStatus(status);
};

export const updateMacToIp = (mac: string, ip: string) => {
  useDeviceStore.setState((prev) => ({
    macToIp: { ...prev.macToIp, [mac]: ip },
  }));
};
