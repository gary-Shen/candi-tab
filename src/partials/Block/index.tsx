import type { MenuData } from 'lina-context-menu'
import type { EditType } from './EditModal'
import type { Block, Link, Setting } from '@/types/setting.type'
import { ChevronDown, PencilRuler, ListPlus, Plus, Trash2 } from 'lucide-react'
import classNames from 'classnames'
import ContextMenu from 'lina-context-menu'
import _ from 'lodash'
import concat from 'lodash/fp/concat'
import set from 'lodash/fp/set'
import update from 'lodash/fp/update'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card from '@/components/Card'
import MyModal from '@/components/Dialog'
import IconText from '@/components/IconText'
import MyButton from '@/components/LinkButton'
import MyMenu from '@/components/Menu'
import { MovableContainer, MovableTarget } from '@/components/Movable'
import { TYPES } from '@/constant'
import { calcLayout } from '@/utils/calcLayout'
import { gid } from '@/utils/gid'

import { isDark } from '@/utils/hsp'
import EditModal from './EditModal'

let movingLink: Link | null = null
let movingLinkFromWhichBlock: number | undefined

const iconStyle = {
  // fontSize: 16, // Lucide icons ignore fontSize in style, use size prop
}

export interface ConfirmProps {
  title: React.ReactNode
  visible: boolean
  onConfirm: () => void
  onClose: () => void
}
function Confirm({ title, visible, onConfirm, onClose }: ConfirmProps) {
  const { t } = useTranslation()
  return (
    <MyModal
      visible={visible}
      title={t('confirm')}
      onClose={onClose}
      footer={(
        <>
          <MyButton className="flex-1" type="secondary" onClick={onClose}>
            {t('cancel')}
          </MyButton>
          <MyButton className="flex-1 ml-4" type="danger" autoFocus onClick={onConfirm}>
            {t('yes')}
          </MyButton>
        </>
      )}
    >
      {t('Are you sure to delete', { name: title })}
    </MyModal>
  )
}

export interface BlockProps {
  block: Block
  settings: Setting
  updateSettings: (setting: Setting) => void
  index: number
  editable?: boolean
  onMenuClick: (index: number) => void
}
export default function BlockContainer({ block, settings, updateSettings, index, editable, onMenuClick }: BlockProps) {
  const { buttons: links, title } = block
  const { t } = useTranslation()
  const [editVisible, toggleEditVisible] = useState<boolean>(false)
  const [editType, setEditType] = useState<EditType>('block')
  const [editData, setEditData] = useState<Block | Link>(block)
  const [activeLinkIndex, setActiveLinkIndex] = useState<number>(-1)
  const [isAddition, toggleAddition] = useState<boolean>(false)
  const [confirmVisible, toggleConfirmVisible] = useState(false)
  const [dataToDelete, setDataToDelete] = useState<Block | Link | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const blockBodyRef = useRef<HTMLDivElement | null>(null)
  const blockHeaderRef = useRef<HTMLDivElement | null>(null)

  /**
   * 动态更新block尺寸
   */
  const updateLayout = useCallback(
    (inputSettings: Setting) => {
      if (!blockBodyRef.current || !blockHeaderRef.current) {
        return
      }

      // 更新全部Block布局
      setTimeout(() => {
        updateSettings(calcLayout(inputSettings))
      })
    },
    [updateSettings],
  )

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(pre => !pre)
    // Wait for render
    setTimeout(() => {
      updateLayout(settings)
    })
  }, [settings, updateLayout])

  /**
   * 编辑block
   */
  const handleEditBlock = useCallback(() => {
    setEditType('block')
    toggleEditVisible(true)
    setEditData(block)
  }, [block])
  /**
   * 编辑表单
   */
  const handleOnChange = useCallback(
    (field: string) => (value: string | number | undefined | any[]) => {
      setEditData(pre => set(field)(value)(pre))
    },
    [],
  )

  /**
   * 保存表单
   */
  const handleSave = useCallback(() => {
    let newSettings = _.cloneDeep(settings)
    if (isAddition) {
      if (editType === 'link') {
        newSettings.links[index].buttons!.splice(activeLinkIndex + 1, 0, editData as Link)
      }
      else {
        newSettings = update('links')(blocks => concat(blocks || [])([editData]))(newSettings)
      }
    }
    else {
      if (editType === 'link') {
        newSettings = set(`links[${index}].buttons[${activeLinkIndex}]`)(editData)(newSettings)
      }
      else {
        newSettings = set(`links[${index}]`)(editData)(newSettings)
      }
    }

    newSettings.createdAt = new Date().getTime()
    toggleEditVisible(false)
    toggleAddition(false)
    updateSettings(newSettings)
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'))
    }, 1000)
    updateLayout(newSettings)
  }, [activeLinkIndex, editData, editType, index, isAddition, settings, updateLayout, updateSettings])

  /**
   * 添加block
   */
  const handleAddBlock = useCallback(() => {
    toggleAddition(true)
    const newId = gid()
    setEditData({
      id: newId,
      title: 'Untitled',
      buttons: [],
      layout: {
        i: newId,
        w: 2,
        h: 30,
        x: block.layout.x,
        y: 39.5,
      },
    })
    toggleEditVisible(true)
    setEditType('block')
  }, [block.layout.x])

  useEffect(() => {
    document.addEventListener('candi-add-block', handleAddBlock)

    return () => {
      document.removeEventListener('candi-add-block', handleAddBlock)
    }
  }, [handleAddBlock])

  /**
   * 删除block
   */
  const handleDelete = useCallback(() => {
    const isBlock = dataToDelete && (dataToDelete as Block).layout
    const isLink = !isBlock
    let path = ''

    if (isLink) {
      path = `links[${index}].buttons`
    }
    else {
      path = 'links'
    }

    setDataToDelete(null)
    const newSettings = update(path)(items => items.filter((item: Link | Block) => item.id !== dataToDelete?.id))(
      settings,
    )
    newSettings.createdAt = new Date().getTime()
    updateSettings(newSettings)
    toggleConfirmVisible(false)
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'))
    }, 1000)
    updateLayout(newSettings)
  }, [dataToDelete, index, settings, updateLayout, updateSettings])

  const handleCloseConfirm = useCallback(() => {
    toggleConfirmVisible(false)
  }, [])

  /**
   * 添加链接
   */
  const handleAddLink = useCallback(() => {
    setEditType('link')
    toggleAddition(true)
    setEditData({
      id: gid(),
      title: '',
      url: '',
      style: 'info',
    })
    toggleEditVisible(true)
  }, [])

  /**
   * 打开右键菜单时记录link索引
   * @param {*} linkIndex
   */
  const handleLinkContextOpen = useCallback((linkIndex: number) => {
    setActiveLinkIndex(linkIndex)
  }, [])

  const handleDragCancel = useCallback(() => {
    movingLink = null
    movingLinkFromWhichBlock = undefined
  }, [])

  // link排序
  const handleContainerMouseUp = useCallback(
    (insertOrder: number) => {
      if (!movingLink || _.isNil(movingLinkFromWhichBlock) || _.isNil(insertOrder)) {
        return
      }

      let newSettings = _.cloneDeep(settings)
      // 在原来的block中删除
      newSettings = update(`links[${movingLinkFromWhichBlock}].buttons`)((buttons) => {
        return buttons.filter((item: Link) => item.id !== movingLink!.id)
      })(newSettings)

      newSettings.links[index].buttons?.splice(insertOrder, 0, _.cloneDeep(movingLink))

      newSettings.createdAt = new Date().getTime()
      updateSettings(newSettings)

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'))
      }, 1000)
      // 延时任务，等待渲染完成后自动更新布局
      setTimeout(() => {
        updateLayout(newSettings)
      }, 100)
    },
    [index, settings, updateLayout, updateSettings],
  )

  const blockMenu = useMemo(
    () => [
      [
        {
          title: t('edit'),
          icon: <PencilRuler size={16} />,
          onClick: handleEditBlock,
        },
        {
          title: t('addBlock'),
          icon: <Plus size={16} />,
          onClick: handleAddBlock,
        },
      ],
      [
        {
          title: t('delete'),
          icon: <Trash2 size={16} />,
          onClick: () => {
            setDataToDelete(block)
            toggleConfirmVisible(true)
          },
        },
      ],
    ],
    [block, handleAddBlock, handleEditBlock, t],
  )

  const card = (
    <div className="p-2 h-full [&_.card]:h-full [&_.card]:bg-card-body [&_.card]:border-default">
      <Card className="card h-full">
        <Card.Header className={classNames('block-header flex justify-between select-none', { 'cursor-move': editable })} ref={blockHeaderRef}>
          {title}
          {editable
            ? (
              <div
                className="cursor-pointer hover:text-color-primary flex items-center"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleAddLink}
              >
                <Plus size={16} />
              </div>
            )
            : (
              <div
                className="cursor-pointer hover:text-color-primary flex items-center transition-transform duration-300"
                style={{ transform: collapsed ? 'rotate(90deg)' : 'rotate(0deg)' }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={handleToggleCollapse}
              >
                <ChevronDown size={16} />
              </div>
            )}
        </Card.Header>
        <MovableContainer
          className="flex flex-col p-card-x block-content"
          ref={blockBodyRef}
          disabled={!editable}
          onMouseUp={handleContainerMouseUp}
        >

          {links?.filter((_, i) => !collapsed || i < 2).map((link, linkIndex) => {
            const { title: buttonTitle, style, url, menu, id, description } = link
            const isBlurred = collapsed && linkIndex === 1
            const buttonStyle = TYPES.includes(style)
              ? {}
              : {
                backgroundColor: style,
                color: isDark(style) ? '#fff' : '#000',
              }



            const blurClass = isBlurred ? 'opacity-50 blur-[1px]' : ''

            const linkMenu = [
              [
                {
                  title: t('edit'),
                  icon: <PencilRuler size={16} />,
                  onClick: () => {
                    setEditType('link')
                    toggleEditVisible(true)
                    setEditData(link)
                  },
                },
                {
                  title: t('addLinkAfter'),
                  icon: <ListPlus size={16} />,
                  onClick: handleAddLink,
                },
              ],
              [
                {
                  title: t('delete'),
                  icon: <Trash2 size={16} />,
                  onClick: () => {
                    setDataToDelete(link)
                    toggleConfirmVisible(true)
                  },
                },
              ],
            ] as MenuData

            if (menu) {
              const linkItem = (
                <MovableTarget
                  disabled={!editable}
                  onMouseDown={() => {
                    movingLink = link
                    movingLinkFromWhichBlock = index
                  }}
                  onCancel={handleDragCancel}
                >
                  <div className={`w-full my-1 first:mt-0 last:mb-0 group-[.under-context-menu]:m-0 ${blurClass}`} onClick={() => onMenuClick(index)}>
                    <MyMenu
                      className="w-full"
                      buttonStyle={{
                        backgroundColor: TYPES.includes(style) ? `var(--color-${style})` : style,
                        color: TYPES.includes(style)
                          ? ['light', 'default'].includes(style)
                            ? '#000'
                            : undefined
                          : isDark(style)
                            ? '#fff'
                            : '#000',
                      }}
                      buttonClassName="w-full"
                      options={menu.map(({ title: menuTitle, url: menuItemUrl, id: menuItemId }) => {
                        return {
                          title: menuTitle,
                          as: 'a',
                          href: menuItemUrl,
                          key: menuItemId,
                          className: `border-transparent text-inherit hover:text-white`,
                        }
                      })}
                    >
                      <MyButton
                        className="w-full py-[0.3rem] px-2 border-0"
                        type={TYPES.includes(style) ? style : 'light'}
                        style={buttonStyle}
                      >
                        <IconText position="right" text={buttonTitle}>
                          <ChevronDown size={16} />
                        </IconText>
                      </MyButton>
                    </MyMenu>
                    {isBlurred && (
                      <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent dark:from-black/80 pointer-events-none" />
                    )}
                  </div>
                </MovableTarget>
              )

              return editable
                ? (
                  <ContextMenu key={id} menu={linkMenu} onOpen={() => handleLinkContextOpen(linkIndex)}>
                    <span className="my-1 first:mt-0 last:mb-0 group under-context-menu">{linkItem!}</span>
                  </ContextMenu>
                )
                : (
                  <React.Fragment key={id}>{linkItem}</React.Fragment>
                )
            }

            const button = (
              <MovableTarget
                disabled={!editable}
                onMouseDown={() => {
                  movingLink = link
                  movingLinkFromWhichBlock = index
                }}
                onCancel={handleDragCancel}
              >
                <div className={`relative w-full my-1 first:mt-0 last:mb-0 ${blurClass}`}>
                  <MyButton
                    as={editable ? 'button' : 'a'}
                    title={description}
                    // @ts-expect-error Library typings incomplete
                    href={url}
                    size="sm"
                    date-url={url}
                    className="w-full py-[0.3rem] px-2 border-0"
                    type={TYPES.includes(style) ? style : 'light'}
                    style={buttonStyle}
                  >
                    {buttonTitle}
                  </MyButton>
                  {isBlurred && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent dark:from-gray-900/90 pointer-events-none backdrop-blur-[1px]" />
                  )}
                </div>
              </MovableTarget>
            )

            if (editable) {
              return (
                <ContextMenu key={id} menu={linkMenu} onOpen={() => handleLinkContextOpen(linkIndex)}>
                  <div className="my-1 first:mt-0 last:mb-0 under-context-menu">{button}</div>
                </ContextMenu>
              )
            }

            return <React.Fragment key={id}>{button}</React.Fragment>
          })}
        </MovableContainer>
      </Card>
    </div>
  )

  if (editable) {
    return (
      <>
        <ContextMenu menu={blockMenu}>{card}</ContextMenu>
        <EditModal
          visible={editVisible}
          onClose={() => toggleEditVisible(false)}
          onChange={handleOnChange}
          onSave={handleSave}
          type={editType}
          data={editData}
        />
        <Confirm
          title={dataToDelete ? dataToDelete.title : ''}
          onClose={handleCloseConfirm}
          visible={confirmVisible}
          onConfirm={handleDelete}
        />
      </>
    )
  }

  return card
}
