import type { Setting } from '@/types/setting.type'

import { createContext } from 'react'

export interface SettingsContextType {
  updateSettings: (newSettings: Setting) => void
  /**
   * 局部更新 settings 字段（不触发 updatedAt 自增）。
   * 用于写入同步元数据（如切换 gist 后写入 remoteUpdatedAt），避免被识别为"本地有未推送修改"。
   */
  patchSettings: (patch: Partial<Setting>) => void
  settings: Setting
  accessToken: string
  updateAccessToken: (token: string) => void
}

const settings = {} as SettingsContextType

export default createContext<SettingsContextType>(settings)
