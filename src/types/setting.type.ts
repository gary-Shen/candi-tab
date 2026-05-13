import type { Layout } from 'react-grid-layout'

import type { Theme } from './theme.type'

export interface MenuLink {
  id: string
  title: string
  url: string
}

export interface Link {
  id: string
  style: 'danger' | 'primary' | 'secondary' | 'dark' | 'warning' | 'success' | 'info' | 'light'
  menu?: MenuLink[]
  description?: string
  url?: string
  title: string
}

export type Links = Link[]

export interface Block {
  id: string
  title: string
  layout: Layout
  layouts?: { [key: string]: Layout }
  buttons?: Links
}

export interface Setting {
  links: Block[]
  /**
   * 本地业务时间戳：每次用户改动时单调递增（max(Date.now(), prev+1)）。
   * 用途：判断"本地是否有未推送修改"——当 updatedAt > remoteUpdatedAt 时即为有。
   */
  updatedAt: number
  createdAt: number
  /**
   * 上一次成功 pull/push 完成时 GitHub Gist 的 updated_at（毫秒）。
   * 作为同步基线：服务端权威时间戳，避免依赖客户端时钟。
   */
  remoteUpdatedAt?: number
  general: {
    language: string
  }
  theme: {
    solution: string
    values?: Theme
  }
  // 可能导出gistId
  gistId?: string
  fileName?: string
  clipboard: string
  gist?: {
    id: string
    fileName: string
    description: string
  }
}
