import type { Setting } from '@/types/setting.type'

/** GitHub ISO 时间戳 → 毫秒；非法/缺失返回 0 */
export function toMs(iso: string | undefined): number {
  if (!iso) {
    return 0
  }
  const ms = new Date(iso).getTime()
  return Number.isFinite(ms) ? ms : 0
}

/**
 * 序列化推送到 Gist 的内容：剔除仅对当前设备有意义的同步元数据。
 * remoteUpdatedAt / lastSyncedUpdatedAt 描述的是"本设备相对远端的同步状态"，
 * 随内容下发会把过期的基线带给其他设备。
 */
export function serializeSettingsForPush(settings: Setting): string {
  return JSON.stringify({
    ...settings,
    remoteUpdatedAt: undefined,
    lastSyncedUpdatedAt: undefined,
  })
}
