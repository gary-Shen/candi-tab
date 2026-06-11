import type { Setting } from '@/types/setting.type'

import { get, set } from './storage'

export function save(settings: Setting) {
  return set('settings', settings)
}

export function load(): Promise<Setting> {
  return get('settings') as Promise<Setting>
}

/**
 * 三方合并的 base：上次成功 push/pull 时的内容快照（不含设备本地同步元数据）。
 * 模块级缓存让同步逻辑可以同步读取；持久化保证跨会话可用。
 */
let syncBaseCache: Setting | null = null

export async function loadSyncBase(): Promise<Setting | null> {
  syncBaseCache = ((await get('syncBase')) as Setting) ?? null
  return syncBaseCache
}

export function getSyncBase(): Setting | null {
  return syncBaseCache
}

export function setSyncBase(content: Setting | null) {
  syncBaseCache = content
  return set('syncBase', content)
}

/** 采纳来自其他标签页的 syncBase 变更：只更新本实例缓存，不回写存储（避免回声循环） */
export function adoptSyncBase(content: Setting | null) {
  syncBaseCache = content
}
