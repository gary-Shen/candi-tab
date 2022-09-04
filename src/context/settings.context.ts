import { createContext } from 'react';

import type { Setting } from '@/types/setting.type';

export interface SettingsContextType {
  updateSettings: (newSettings: Setting) => void;
  settings: Setting;
  accessToken: string;
  updateAccessToken: (token: string) => void;
}

const settings = {} as SettingsContextType;

export default createContext<SettingsContextType>(settings);
