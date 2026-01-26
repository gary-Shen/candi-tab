import type { MenuLink } from '@/types/setting.type'
import classNames from 'classnames'
import { ChevronDown, ChevronRight, FolderPlus, Link2, Plus, Trash2 } from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { gid } from '@/utils/gid'
import Input from './Input'
import Button from './LinkButton'

interface MenuTreeItemProps {
  item: MenuLink
  depth: number
  onUpdate: (id: string, updates: Partial<MenuLink>) => void
  onDelete: (id: string) => void
  onAddChild: (parentId: string, isFolder: boolean) => void
}

function MenuTreeItem({ item, depth, onUpdate, onDelete, onAddChild }: MenuTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { t } = useTranslation()
  const hasChildren = item.children && item.children.length > 0
  const isFolder = hasChildren || !item.url

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(item.id, { title: e.target.value })
  }, [item.id, onUpdate])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(item.id, { url: e.target.value })
  }, [item.id, onUpdate])

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [])

  const handleDelete = useCallback(() => {
    onDelete(item.id)
  }, [item.id, onDelete])

  const handleAddLink = useCallback(() => {
    onAddChild(item.id, false)
  }, [item.id, onAddChild])

  const handleAddFolder = useCallback(() => {
    onAddChild(item.id, true)
  }, [item.id, onAddChild])

  return (
    <div className="menu-tree-item">
      <div
        className={classNames(
          'flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800',
          { 'ml-4': depth > 0 },
        )}
        style={{ marginLeft: depth * 16 }}
      >
        {/* 展开/折叠按钮 */}
        <button
          type="button"
          className={classNames(
            'w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600',
            { invisible: !hasChildren },
          )}
          onClick={handleToggleExpand}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* 图标 */}
        <span className="text-gray-400">
          {isFolder ? <FolderPlus size={14} /> : <Link2 size={14} />}
        </span>

        {/* 标题输入 */}
        <Input
          className="flex-1 !py-1 !text-sm"
          placeholder={t('title')}
          value={item.title}
          onChange={handleTitleChange}
        />

        {/* URL输入（仅链接显示） */}
        {!isFolder && (
          <Input
            className="flex-1 !py-1 !text-sm"
            placeholder="URL"
            value={item.url || ''}
            onChange={handleUrlChange}
          />
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-1">
          {/* 添加子链接 */}
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-blue-500 rounded"
            onClick={handleAddLink}
            title={t('addLink')}
          >
            <Plus size={14} />
          </button>
          {/* 添加子文件夹 */}
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-green-500 rounded"
            onClick={handleAddFolder}
            title={t('Add folder')}
          >
            <FolderPlus size={14} />
          </button>
          {/* 删除 */}
          <button
            type="button"
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 rounded"
            onClick={handleDelete}
            title={t('delete')}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* 子项 */}
      {hasChildren && isExpanded && (
        <div className="menu-tree-children">
          {item.children!.map(child => (
            <MenuTreeItem
              key={child.id}
              item={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export interface MenuTreeEditorProps {
  items: MenuLink[]
  onChange: (items: MenuLink[]) => void
}

export default function MenuTreeEditor({ items, onChange }: MenuTreeEditorProps) {
  const { t } = useTranslation()

  // 递归更新项目
  const updateItemRecursive = useCallback((
    list: MenuLink[],
    id: string,
    updates: Partial<MenuLink>,
  ): MenuLink[] => {
    return list.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates }
      }
      if (item.children) {
        return {
          ...item,
          children: updateItemRecursive(item.children, id, updates),
        }
      }
      return item
    })
  }, [])

  // 递归删除项目
  const deleteItemRecursive = useCallback((list: MenuLink[], id: string): MenuLink[] => {
    return list
      .filter(item => item.id !== id)
      .map((item) => {
        if (item.children) {
          return {
            ...item,
            children: deleteItemRecursive(item.children, id),
          }
        }
        return item
      })
  }, [])

  // 递归添加子项
  const addChildRecursive = useCallback((
    list: MenuLink[],
    parentId: string,
    newItem: MenuLink,
  ): MenuLink[] => {
    return list.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        }
      }
      if (item.children) {
        return {
          ...item,
          children: addChildRecursive(item.children, parentId, newItem),
        }
      }
      return item
    })
  }, [])

  const handleUpdate = useCallback((id: string, updates: Partial<MenuLink>) => {
    onChange(updateItemRecursive(items, id, updates))
  }, [items, onChange, updateItemRecursive])

  const handleDelete = useCallback((id: string) => {
    onChange(deleteItemRecursive(items, id))
  }, [items, onChange, deleteItemRecursive])

  const handleAddChild = useCallback((parentId: string, isFolder: boolean) => {
    const newItem: MenuLink = {
      id: gid(),
      title: isFolder ? t('New folder') : t('New link'),
      ...(isFolder ? { children: [] } : { url: '' }),
    }
    onChange(addChildRecursive(items, parentId, newItem))
  }, [items, onChange, addChildRecursive, t])

  const handleAddRoot = useCallback((isFolder: boolean) => {
    const newItem: MenuLink = {
      id: gid(),
      title: isFolder ? t('New folder') : t('New link'),
      ...(isFolder ? { children: [] } : { url: '' }),
    }
    onChange([...items, newItem])
  }, [items, onChange, t])

  return (
    <div className="menu-tree-editor">
      <div className="max-h-[300px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-2">
        {items.length === 0
          ? (
              <div className="text-center text-gray-400 py-4">{t('No menu items')}</div>
            )
          : (
              items.map(item => (
                <MenuTreeItem
                  key={item.id}
                  item={item}
                  depth={0}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onAddChild={handleAddChild}
                />
              ))
            )}
      </div>

      <div className="flex gap-2 mt-2">
        <Button type="secondary" className="flex-1" onClick={() => handleAddRoot(false)}>
          <Plus size={14} className="mr-1" />
          {t('addLink')}
        </Button>
        <Button type="secondary" className="flex-1" onClick={() => handleAddRoot(true)}>
          <FolderPlus size={14} className="mr-1" />
          {t('Add folder')}
        </Button>
      </div>
    </div>
  )
}
