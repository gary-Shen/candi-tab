import ContextMenu from 'lina-context-menu';
import _ from 'lodash';
import { concat, set, update } from 'lodash/fp';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
// import { BiEditAlt, BiListPlus, BiPlusCircle, BiTrash } from 'react-icons/bi';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { BiListPlus } from '@react-icons/all-files/bi/BiListPlus';
import { BiPlusCircle } from '@react-icons/all-files/bi/BiPlusCircle';
import { BiTrash } from '@react-icons/all-files/bi/BiTrash';

import { TYPES } from '@/constant';
import type { Block, Link, Setting } from '@/types/setting.type';
import { gid } from '@/utils/gid';
import { isDark } from '@/utils/hsp';

import Modal from '../Modal';
import { MovableContainer, MovableTarget } from '../Movable';
import type { EditType } from './EditModal';
import EditModal from './EditModal';
import StyledBlock from './styled';

let movingLink: Link | null = null;
let movingLinkFromWhichBlock: number | undefined;

const iconStyle = {
  fontSize: 16,
};

export interface ConfirmProps {
  title: React.ReactNode;
  visible: boolean;
  onConfirm: () => void;
  onClose: () => void;
}
const Confirm = ({ title, visible, onConfirm, onClose }: ConfirmProps) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Header>Confirm</Modal.Header>
      <Modal.Body>
        Are you sure to delete <strong>{title}</strong>?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" autoFocus onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const blockStyle = {
  blockPadding: 16,
  linkMargin: 8,
  blockMargin: 8,
};

export interface BlockProps {
  block: Block;
  onMenuClick: (index: number) => void;
  settings: Setting;
  updateSettings: (setting: Setting) => void;
  index: number;
  editable?: boolean;
}
export default function BlockContainer({ block, onMenuClick, settings, updateSettings, index, editable }: BlockProps) {
  const { buttons: links, title } = block;
  const [editVisible, toggleEditVisible] = useState<boolean>(false);
  const [editType, setEditType] = useState<EditType>('block');
  const [editData, setEditData] = useState<Block | Link>(block);
  const [activeLinkIndex, setActiveLinkIndex] = useState<number>(-1);
  const [isAddition, toggleAddition] = useState<boolean>(false);
  const [confirmVisible, toggleConfirmVisible] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<Block | Link | null>(null);

  const blockBodyRef = useRef<HTMLDivElement | null>(null);
  const blockHeaderRef = useRef<HTMLDivElement | null>(null);

  /**
   * 动态更新block尺寸
   */
  const updateLayout = useCallback(
    (inputSettings: Setting) => {
      if (!blockBodyRef.current || !blockHeaderRef.current) {
        return;
      }

      // 更新全部Block布局
      setTimeout(() => {
        const headerHeight = blockHeaderRef.current?.offsetHeight;
        const blockElements = document.querySelectorAll(`.${blockBodyRef.current!.classList[0]}`);
        let newSettings = inputSettings;
        _.forEach(blockElements, (blockElem, blockIndex) => {
          const linkSize = blockElem.children!.length;
          const linkHeight = _.chain(blockElem.children)
            .map((item) => {
              return (item as HTMLElement).offsetHeight;
            })
            .reduce((memo, cur) => {
              return memo + cur;
            }, 0)
            .value();

          newSettings = update(`links[${blockIndex}]`)((blockItem) => {
            return {
              ...blockItem,
              layout: {
                ...blockItem.layout,
                h:
                  (linkHeight +
                    (linkSize! - 1) * blockStyle.linkMargin +
                    blockStyle.blockPadding * 2 +
                    blockStyle.blockMargin * 2 +
                    headerHeight!) /
                  4,
              },
            };
          })(newSettings);
        });

        updateSettings(newSettings);
      });
    },
    [updateSettings],
  );

  /**
   * 编辑block
   */
  const handleEditBlock = useCallback(() => {
    setEditType('block');
    toggleEditVisible(true);
    setEditData(block);
  }, [block]);

  /**
   * 编辑Link
   */
  const handleEditLink = useCallback((e: React.MouseEvent, unused: any, link: Link) => {
    setEditType('link');
    toggleEditVisible(true);
    setEditData(link);
  }, []);

  /**
   * 编辑表单
   */
  const handleOnChange = useCallback(
    (field: string) => (value: string | number | undefined | any[]) => {
      setEditData(set(field)(value)(editData));
    },
    [editData],
  );

  /**
   * 保存表单
   */
  const handleSave = useCallback(() => {
    let newSettings = _.cloneDeep(settings);
    if (isAddition) {
      if (editType === 'link') {
        newSettings.links[index].buttons!.splice(activeLinkIndex + 1, 0, editData as Link);
      } else {
        newSettings = update('links')((blocks) => concat(blocks || [])([editData]))(newSettings);
      }
    } else {
      if (editType === 'link') {
        newSettings = set(`links[${index}].buttons[${activeLinkIndex}]`)(editData)(newSettings);
      } else {
        newSettings = set(`links[${index}]`)(editData)(newSettings);
      }
    }

    newSettings.createdAt = new Date().getTime();
    toggleEditVisible(false);
    toggleAddition(false);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'));
    }, 1000);
    updateLayout(newSettings);
  }, [activeLinkIndex, editData, editType, index, isAddition, settings, updateLayout]);

  /**
   * 添加block
   */
  const handleAddBlock = useCallback(() => {
    toggleAddition(true);
    const newId = gid();
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
    });
    toggleEditVisible(true);
    setEditType('block');
  }, [block.layout.x]);

  useEffect(() => {
    document.addEventListener('candi-add-block', handleAddBlock);

    return () => {
      document.removeEventListener('candi-add-block', handleAddBlock);
    };
  }, [handleAddBlock]);

  /**
   * 删除block
   */
  const handleDelete = useCallback(() => {
    const isBlock = dataToDelete && (dataToDelete as Block).layout;
    const isLink = !isBlock;
    let path = '';

    if (isLink) {
      path = `links[${index}].buttons`;
    } else {
      path = 'links';
    }

    setDataToDelete(null);
    const newSettings = update(path)((items) => items.filter((item: Link | Block) => item.id !== dataToDelete?.id))(
      settings,
    );
    newSettings.createdAt = new Date().getTime();
    updateSettings(newSettings);
    toggleConfirmVisible(false);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'));
    }, 1000);
    updateLayout(newSettings);
  }, [dataToDelete, index, settings, updateLayout, updateSettings]);

  const handleCloseConfirm = useCallback(() => {
    toggleConfirmVisible(false);
  }, []);

  /**
   * 添加链接
   */
  const handleAddLink = useCallback(() => {
    setEditType('link');
    toggleAddition(true);
    setEditData({
      id: gid(),
      title: '',
      url: '',
      style: 'info',
    });
    toggleEditVisible(true);
  }, []);

  /**
   * 打开右键菜单时记录link索引
   * @param {*} linkIndex
   */
  const handleLinkContextOpen = useCallback((linkIndex: number) => {
    setActiveLinkIndex(linkIndex);
  }, []);

  // link排序
  const handleContainerMouseUp = useCallback(
    (insertOrder: number) => {
      if (!movingLink || _.isNil(movingLinkFromWhichBlock)) {
        return;
      }

      let newSettings = _.cloneDeep(settings);
      // 在原来的block中删除
      newSettings = update(`links[${movingLinkFromWhichBlock}].buttons`)((buttons) => {
        return buttons.filter((item: Link) => item.id !== movingLink!.id);
      })(newSettings);

      newSettings.links[index].buttons?.splice(insertOrder, 0, _.cloneDeep(movingLink));

      newSettings.createdAt = new Date().getTime();
      updateSettings(newSettings);

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'));
      }, 1000);
      // 延时任务，等待渲染完成后自动更新布局
      setTimeout(() => {
        updateLayout(newSettings);
      }, 100);
    },
    [index, settings, updateLayout, updateSettings],
  );

  const blockMenu = useMemo(
    () => [
      [
        {
          key: 1,
          className: 'menu-item',
          title: 'Edit',
          icon: <BiEditAlt style={iconStyle} />,
          onClick: handleEditBlock,
        },
        {
          key: 2,
          className: 'menu-item',
          title: 'Add block',
          icon: <BiPlusCircle style={iconStyle} />,
          onClick: handleAddBlock,
        },
      ],
      [
        {
          key: 4,
          className: 'menu-item',
          title: 'Delete',
          icon: <BiTrash style={iconStyle} />,
          onClick: () => {
            setDataToDelete(block);
            toggleConfirmVisible(true);
          },
        },
      ],
    ],
    [block, handleAddBlock, handleEditBlock],
  );

  const linkMenu = useMemo(
    () => [
      [
        {
          key: 2,
          className: 'menu-item',
          title: 'Edit',
          icon: <BiEditAlt style={iconStyle} />,
          onClick: handleEditLink,
        },
        {
          key: 1,
          className: 'menu-item',
          title: 'Insert link after',
          icon: <BiListPlus style={iconStyle} />,
          onClick: handleAddLink,
        },
      ],
      [
        {
          key: 3,
          className: 'menu-item',
          title: 'Delete',
          icon: <BiTrash style={iconStyle} />,
          onClick: (e: React.MouseEvent, unused: unknown, link: Link) => {
            setDataToDelete(link);
            toggleConfirmVisible(true);
          },
        },
      ],
    ],
    [handleAddLink, handleEditLink],
  );

  const card = (
    <StyledBlock>
      <Card>
        <Card.Header className="card-header" ref={blockHeaderRef}>
          {title}
        </Card.Header>
        {/* @ts-ignore */}
        <MovableContainer
          className="block-content card-body"
          ref={blockBodyRef}
          disabled={!editable}
          onMouseUp={handleContainerMouseUp}
        >
          {links?.length === 0 && editable && (
            <Button size="sm" className="link-btn" onClick={handleAddLink} variant="light">
              Add link
            </Button>
          )}
          {links?.map((link, linkIndex) => {
            const { title: buttonTitle, style, url, menu, id, description } = link;
            const buttonStyle = TYPES.includes(style)
              ? {}
              : {
                  backgroundColor: style,
                  color: isDark(style) ? '#fff' : '#000',
                };

            if (menu) {
              const linkItem = (
                <MovableTarget
                  disabled={!editable}
                  onMouseDown={() => {
                    movingLink = link;
                    movingLinkFromWhichBlock = index;
                  }}
                >
                  <Dropdown align="start" className="link-btn" onClick={() => onMenuClick(index)}>
                    <Dropdown.Toggle size="sm" className="link-group" variant={style}>
                      {buttonTitle}
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                      {menu.map(({ title: menuTitle, url: menuUrl, id: menuItemId }) => {
                        return (
                          <Dropdown.Item size="sm" key={menuItemId} href={menuUrl}>
                            {menuTitle}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                </MovableTarget>
              );

              return editable ? (
                <ContextMenu key={id} data={link} menu={linkMenu} onOpen={() => handleLinkContextOpen(linkIndex)}>
                  {/*@ts-ignore*/}
                  {linkItem!}
                </ContextMenu>
              ) : (
                linkItem
              );
            }

            const button = (
              // @ts-ignore
              <MovableTarget
                disabled={!editable}
                onMouseDown={() => {
                  movingLink = link;
                  movingLinkFromWhichBlock = index;
                }}
              >
                <Button
                  as={editable ? 'button' : 'a'}
                  href={url}
                  size="sm"
                  date-url={url}
                  className="link-btn"
                  variant={TYPES.includes(style) ? style : 'light'}
                  style={buttonStyle}
                >
                  {buttonTitle}
                </Button>
              </MovableTarget>
            );

            if (editable) {
              return (
                <ContextMenu key={id} data={link} menu={linkMenu} onOpen={() => handleLinkContextOpen(linkIndex)}>
                  {/* @ts-ignore */}
                  <div className="link-btn under-context-menu">{button! as React.ReactNode}</div>
                </ContextMenu>
              );
            }

            return (
              <OverlayTrigger
                key={id}
                placement="top"
                show={typeof description === 'undefined' ? false : undefined}
                overlay={<Tooltip>{description}</Tooltip>}
              >
                {button}
              </OverlayTrigger>
            );
          })}
        </MovableContainer>
      </Card>
    </StyledBlock>
  );

  if (editable) {
    return (
      <>
        {/* @ts-ignore */}
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
    );
  }

  return card;
}
