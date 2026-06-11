import type { Setting } from '@/types/setting.type'
import _ from 'lodash'

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
 * remoteUpdatedAt / remoteVersion / lastSyncedUpdatedAt 描述的是
 * "本设备相对远端的同步状态"，随内容下发会把过期的基线带给其他设备。
 */
export function serializeSettingsForPush(settings: Setting): string {
  return JSON.stringify({
    ...settings,
    remoteUpdatedAt: undefined,
    remoteVersion: undefined,
    lastSyncedUpdatedAt: undefined,
  })
}

// 排除瞬态/同步字段后比较内容是否相同，避免"自己刚推送的回声"触发覆盖
export function isSameContent(a: Setting | null | undefined, b: Setting | null | undefined): boolean {
  if (!a || !b) {
    return false
  }
  const omitKeys: (keyof Setting)[] = [
    'updatedAt',
    'createdAt',
    'remoteUpdatedAt',
    'remoteVersion',
    'lastSyncedUpdatedAt',
    'gist',
  ]
  return _.isEqual(_.omit(a, omitKeys as string[]), _.omit(b, omitKeys as string[]))
}

/** Gist 数据中的当前（最新）修订 SHA */
export function getHeadVersion(gistData: any): string | undefined {
  return gistData?.history?.[0]?.version
}

/**
 * 远端是否严格新于本地基线。
 *
 * 优先用修订 SHA 判断（精确、与时钟无关，消除 updated_at 秒级精度盲区）：
 * - 头部修订 == 基线 → 未变化
 * - 基线出现在历史更深处 → 基线是头部的祖先 → 严格更新
 * - 基线不在历史中 → 过期读（快照早于基线修订）或历史不可用 → 回退时间戳比较
 *
 * 时间戳回退只承认"严格大于"：等于 = 未变化，小于 = 过期读，一律不算更新。
 */
export function isRemoteNewer(gistData: any, settings: Setting | null | undefined): boolean {
  const headVersion = getHeadVersion(gistData)
  const baselineVersion = settings?.remoteVersion
  const headMs = toMs(gistData?.updated_at)
  const baselineMs = settings?.remoteUpdatedAt ?? 0

  if (headVersion && baselineVersion) {
    if (headVersion === baselineVersion) {
      return false
    }
    const history: any[] = Array.isArray(gistData?.history) ? gistData.history : []
    if (history.some(item => item?.version === baselineVersion)) {
      return true
    }
  }

  return headMs > baselineMs
}
