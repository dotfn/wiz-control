import { isTauri } from '../utils/tauri';
import { tauriDeviceService } from './tauri/deviceService';
import { demoDeviceService } from './demo/deviceService';
import { LightState } from '../types';

export interface DeviceStatePayload {
  ip: string;
  online: boolean;
  state: LightState | null;
}

export const deviceService = isTauri() ? tauriDeviceService : demoDeviceService;
export type DeviceServiceType = typeof tauriDeviceService;
export type { UnlistenFn } from '@tauri-apps/api/event';
