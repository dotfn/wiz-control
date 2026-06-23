export interface LightState {
  state: boolean;
  dimming: number;
  r?: number;
  g?: number;
  b?: number;
  temp?: number;
  sceneId?: number;
}

export interface LightDevice {
  ip: string;
  name?: string;
  state?: LightState;
}

export interface LightScene {
  id: number;
  name: string;
  colors: string[];
  description?: string;
}

export interface DiscoverDeviceResponse {
  ip: string;
  state?: {
    state: boolean;
    dimming: number;
    r?: number;
    g?: number;
    b?: number;
    temp?: number;
    sceneId?: number;
  };
}

export interface PreferencesResponse {
  device_names: Record<string, string>;
  last_ip: string | null;
  theme: string | null;
}
