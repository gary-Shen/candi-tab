import type { Block, Link, MenuLink } from '@/types/setting.type'
import { TYPES } from '@/constant'
import { gid } from './gid'

// 内建色板（排除 default 和 light）
const LINK_COLORS = TYPES.filter(t => t !== 'default' && t !== 'light') as Link['style'][]

/**
 * 随机获取一个内建颜色
 */
function getRandomColor(): Link['style'] {
  return LINK_COLORS[Math.floor(Math.random() * LINK_COLORS.length)]
}

/**
 * Chrome 书签节点类型
 */
export interface ChromeBookmarkNode {
  id: string
  title: string
  url?: string
  children?: ChromeBookmarkNode[]
}

/**
 * 书签来源（顶层文件夹）
 */
export interface BookmarkSource {
  id: string
  title: string
  count: number // 书签数量
}

/**
 * 将 Chrome 书签节点转换为 MenuLink（支持多层嵌套）
 */
function transformToMenuLink(node: ChromeBookmarkNode): MenuLink {
  const menuLink: MenuLink = {
    id: gid(),
    title: node.title || 'Untitled',
  }

  if (node.url) {
    menuLink.url = node.url
  }

  if (node.children && node.children.length > 0) {
    menuLink.children = node.children
      .filter(child => child.title) // 过滤空标题的节点
      .map(child => transformToMenuLink(child))
  }

  return menuLink
}

// 每个链接的高度（rowHeight=4，每个链接约占 8 个单位）
const LINK_HEIGHT = 8
// Block header 高度
const HEADER_HEIGHT = 12
// Block 最小高度
const MIN_BLOCK_HEIGHT = 20

/**
 * 计算 Block 高度（基于链接数量）
 */
function calcBlockHeight(buttonsCount: number): number {
  if (buttonsCount === 0) return MIN_BLOCK_HEIGHT
  return Math.max(MIN_BLOCK_HEIGHT, HEADER_HEIGHT + buttonsCount * LINK_HEIGHT)
}

/**
 * 将书签文件夹转换为 Block
 */
function transformFolderToBlock(folder: ChromeBookmarkNode): { block: Block, height: number } {
  const buttons: Link[] = []

  if (folder.children) {
    for (const child of folder.children) {
      if (!child.title) continue

      if (child.url) {
        // 普通链接
        buttons.push({
          id: gid(),
          title: child.title,
          url: child.url,
          style: getRandomColor(),
        })
      }
      else if (child.children && child.children.length > 0) {
        // 文件夹 -> 转换为带菜单的链接
        buttons.push({
          id: gid(),
          title: child.title,
          style: getRandomColor(),
          menu: child.children
            .filter(c => c.title)
            .map(c => transformToMenuLink(c)),
        })
      }
    }
  }

  const blockId = gid()
  const height = calcBlockHeight(buttons.length)

  return {
    block: {
      id: blockId,
      title: folder.title || 'Untitled',
      layout: {
        i: blockId, // layout.i 必须等于 block.id
        x: 0,
        y: 0,
        w: 6,
        h: height,
      },
      buttons,
    },
    height,
  }
}

/**
 * 将 Chrome 书签树转换为插件的 Block 数组
 * Chrome 书签结构：根节点 -> [书签栏, 其他书签, 移动设备书签]
 * @param startY - 起始 Y 位置（用于追加模式）
 */
export function transformChromeBookmarks(bookmarkTreeNodes: ChromeBookmarkNode[], startY: number = 0): Block[] {
  const blocks: Block[] = []
  const pendingBlocks: { block: Block, height: number }[] = []

  function processNode(node: ChromeBookmarkNode) {
    // 跳过根节点，处理其子节点
    if (node.children) {
      for (const child of node.children) {
        if (child.children && child.children.length > 0) {
          // 这是一个文件夹，转换为 Block
          pendingBlocks.push(transformFolderToBlock(child))
        }
      }
    }
  }

  // 处理所有根节点
  for (const rootNode of bookmarkTreeNodes) {
    processNode(rootNode)
  }

  // 使用两列布局排列 blocks
  // 跟踪每列的当前 Y 位置
  const columnYPositions = [startY, startY] // [左列Y, 右列Y]

  for (const { block, height } of pendingBlocks) {
    // 选择 Y 位置较小的列（更高的位置）
    const columnIndex = columnYPositions[0] <= columnYPositions[1] ? 0 : 1

    // 设置 block 的位置
    block.layout.x = columnIndex * 6
    block.layout.y = columnYPositions[columnIndex]

    // 更新该列的 Y 位置
    columnYPositions[columnIndex] += height

    blocks.push(block)
  }

  return blocks
}

/**
 * 本地调试用的 mock 书签数据
 */
const mockBookmarks: ChromeBookmarkNode[] = [
  {
    id: '0',
    title: '',
    children: [
      {
        id: '1',
        title: 'Bookmarks Bar',
        children: [
          { id: '101', title: 'Google', url: 'https://google.com' },
          { id: '102', title: 'GitHub', url: 'https://github.com' },
          {
            id: '103',
            title: 'Development',
            children: [
              { id: '1031', title: 'MDN', url: 'https://developer.mozilla.org' },
              { id: '1032', title: 'Stack Overflow', url: 'https://stackoverflow.com' },
              {
                id: '1033',
                title: 'Frameworks',
                children: [
                  { id: '10331', title: 'React', url: 'https://react.dev' },
                  { id: '10332', title: 'Vue', url: 'https://vuejs.org' },
                  { id: '10333', title: 'Angular', url: 'https://angular.io' },
                ],
              },
            ],
          },
        ],
      },
      {
        id: '2',
        title: 'Other Bookmarks',
        children: [
          { id: '201', title: 'YouTube', url: 'https://youtube.com' },
          { id: '202', title: 'Twitter', url: 'https://twitter.com' },
        ],
      },
    ],
  },
]

/**
 * 统计文件夹中的书签数量（递归）
 */
function countBookmarks(node: ChromeBookmarkNode): number {
  if (node.url) return 1
  if (!node.children) return 0
  return node.children.reduce((sum, child) => sum + countBookmarks(child), 0)
}

/**
 * 获取可用的书签来源（顶层文件夹）
 */
export async function getBookmarkSources(): Promise<BookmarkSource[]> {
  return new Promise((resolve, reject) => {
    if (!chrome?.bookmarks) {
      // 本地调试环境：使用 mock 数据
      if (import.meta.env.DEV) {
        console.log('[DEV] Using mock bookmarks data')
        const sources: BookmarkSource[] = []
        for (const root of mockBookmarks) {
          if (root.children) {
            for (const folder of root.children) {
              if (folder.children && folder.children.length > 0) {
                sources.push({
                  id: folder.id,
                  title: folder.title || 'Untitled',
                  count: countBookmarks(folder),
                })
              }
            }
          }
        }
        resolve(sources)
        return
      }
      reject(new Error('Bookmarks API not available'))
      return
    }

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      const sources: BookmarkSource[] = []
      for (const root of bookmarkTreeNodes) {
        if (root.children) {
          for (const folder of root.children) {
            if (folder.children && folder.children.length > 0) {
              sources.push({
                id: folder.id,
                title: folder.title || 'Untitled',
                count: countBookmarks(folder as ChromeBookmarkNode),
              })
            }
          }
        }
      }
      resolve(sources)
    })
  })
}

/**
 * 获取 Chrome 书签并转换为 Block 数组
 * @param selectedSourceIds - 选中的书签来源 ID，为空则导入全部
 * @param startY - 起始 Y 位置（用于追加模式）
 */
export async function importChromeBookmarks(selectedSourceIds: string[] = [], startY: number = 0): Promise<Block[]> {
  return new Promise((resolve, reject) => {
    if (!chrome?.bookmarks) {
      // 本地调试环境：使用 mock 数据
      if (import.meta.env.DEV) {
        console.log('[DEV] Using mock bookmarks data')
        const filteredBookmarks = filterBookmarksBySourceIds(mockBookmarks, selectedSourceIds)
        const blocks = transformChromeBookmarks(filteredBookmarks, startY)
        resolve(blocks)
        return
      }
      reject(new Error('Bookmarks API not available'))
      return
    }

    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
        return
      }

      const filteredBookmarks = filterBookmarksBySourceIds(bookmarkTreeNodes as ChromeBookmarkNode[], selectedSourceIds)
      const blocks = transformChromeBookmarks(filteredBookmarks, startY)
      resolve(blocks)
    })
  })
}

/**
 * 根据选中的来源 ID 过滤书签
 */
function filterBookmarksBySourceIds(bookmarks: ChromeBookmarkNode[], selectedIds: string[]): ChromeBookmarkNode[] {
  if (selectedIds.length === 0) return bookmarks

  return bookmarks.map((root) => {
    if (!root.children) return root
    return {
      ...root,
      children: root.children.filter(folder => selectedIds.includes(folder.id)),
    }
  })
}
