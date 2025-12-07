import type { Setting } from '@/types/setting.type'

import { createContext } from 'react'

export interface SettingsContextType {
  updateSettings: (newSettings: Setting) => void
  settings: Setting
  accessToken: string
  updateAccessToken: (token: string) => void
}

const settings = {} as SettingsContextType

export default createContext<SettingsContextType>(settings)
