import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Button, Card, Dropdown, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { BiEditAlt, BiListPlus, BiTrash, BiPlusCircle } from 'react-icons/bi';
import ContextMenu from 'lina-context-menu';
import { set, update, concat } from 'lodash/fp';
import _ from 'lodash';
import styled from 'styled-components';

import { uuid } from '../../utils';
import EditModal from './EditModal';
import Modal from '../Modal';
import { TYPES } from '../../const';
import StyledBlock from './BlockStyle';

const iconStyle = {
  fontSize: 16,
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbString2Obj(rgb) {
  const [r, g, b] = rgb.replace(/rgb|\(\|\)/, '').split(' ');
  return {
    r: parseInt(r),
    g: parseInt(g),
    b: parseInt(b),
  };
}

const Confirm = ({ title, visible, onConfirm, onClose }) => {
  return (
    <Modal visible={visible} onClose={onClose}>
      <Modal.Header closeButton>Confirm</Modal.Header>
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

export default function Block({ block, onMenuClick, settings, updateSettings, index, editable }) {
  const { buttons: links, title } = block;
  const [editVisible, toggleEditVisible] = useState(false);
  const [editType, setEditType] = useState('block');
  const [editData, setEditData] = useState(block);
  const [activeLinkIndex, setActiveLinkIndex] = useState(-1);
  const [isAddition, toggleAddition] = useState(null);
  const [confirmVisible, toggleConfirmVisible] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

  const blockBodyRef = useRef(null);
  const blockHeaderRef = useRef(null);

  useEffect(() => {
    document.addEventListener('candi-add-block', handleAddBlock);

    return () => {
      document.removeEventListener('candi-add-block', handleAddBlock);
    };
  }, [handleAddBlock]);

  /**
   * 动态更新block尺寸
   */
  const updateLayout = useCallback(
    (inputSettings) => {
      if (!blockBodyRef.current || !blockHeaderRef.current) {
        return;
      }

      setTimeout(() => {
        const headerHeight = blockHeaderRef.current.offsetHeight;
        const linkSize = blockBodyRef.current.childNodes.length;
        const linkHeight = _.chain(blockBodyRef.current.childNodes)
          .map((item) => {
            return item.offsetHeight;
          })
          .reduce((memo, cur) => {
            return memo + cur;
          }, 0)
          .value();

        updateSettings(
          update(`links[${index}]`)((blockItem) => {
            return {
              ...blockItem,
              layout: {
                ...blockItem.layout,
                h:
                  (linkHeight +
                    (linkSize - 1) * blockStyle.linkMargin +
                    blockStyle.blockPadding * 2 +
                    blockStyle.blockMargin * 2 +
                    headerHeight) /
                  4,
              },
            };
          })(inputSettings),
        );
      });
    },
    [index, updateSettings],
  );

  /**
   * 编辑block
   */
  const handleEditBlock = () => {
    setEditType('block');
    toggleEditVisible(true);
    setEditData(block);
  };

  /**
   * 编辑Link
   */
  const handleEditLink = (e, _, link) => {
    setEditType('link');
    toggleEditVisible(true);
    setEditData(link);
  };

  /**
   * 编辑表单
   */
  const handleOnChange = (field) => (value) => {
    setEditData(set(field)(value)(editData));
  };

  /**
   * 保存表单
   */
  const handleSave = () => {
    let newSettings = _.cloneDeep(settings);
    if (isAddition) {
      if (editType === 'link') {
        newSettings.links[index].buttons.splice(activeLinkIndex + 1, 0, editData);
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
    updateSettings(newSettings);
    toggleEditVisible(false);
    toggleAddition(false);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'));
    }, 1000);
    updateLayout(newSettings);
  };

  /**
   * 添加block
   */
  const handleAddBlock = useCallback(() => {
    toggleAddition(true);
    setEditData({
      id: uuid(),
      title: '',
      buttons: [],
      layout: {
        w: 2,
        h: 8,
        x: block.layout.x,
        y: 0,
      },
    });
    toggleEditVisible(true);
    setEditType('block');
  }, [block.layout.x]);

  /**
   * 删除block
   */
  const handleDelete = () => {
    const isBlock = dataToDelete && typeof dataToDelete.url === 'undefined';
    const isLink = !isBlock || dataToDelete.menu;
    let path = '';

    if (isLink) {
      path = `links[${index}].buttons`;
    } else {
      path = 'links';
    }

    setDataToDelete(null);
    const newSettings = update(path)((items) => items.filter((item) => item.id !== dataToDelete.id))(settings);
    newSettings.createdAt = new Date().getTime();
    updateSettings(newSettings);
    toggleConfirmVisible(false);
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'));
    }, 1000);
    updateLayout(newSettings);
  };

  const handleCloseConfirm = () => {
    toggleConfirmVisible(false);
  };

  /**
   * 添加链接
   */
  const handleAddLink = () => {
    setEditType('link');
    toggleAddition(true);
    setEditData({
      id: uuid(),
      title: '',
      url: '',
      style: 'info',
    });
    toggleEditVisible(true);
  };

  /**
   * 打开右键菜单时记录link索引
   * @param {*} index
   */
  const handleLinkContextOpen = (index) => {
    setActiveLinkIndex(index);
  };

  const blockMenu = [
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
  ];

  const linkMenu = [
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
        onClick: (e, _, link) => {
          setDataToDelete(link);
          toggleConfirmVisible(true);
        },
      },
    ],
  ];

  const card = (
    <StyledBlock>
      <Card>
        <Card.Header className="card-header" ref={blockHeaderRef}>
          {title}
        </Card.Header>
        <Card.Body className="block-content" ref={blockBodyRef}>
          {links.length === 0 && editable && (
            <Button size="sm" className="link-btn" onClick={handleAddLink} variant="light">
              Add link
            </Button>
          )}
          {links.map((link, linkIndex) => {
            const { title: buttonTitle, style, url, menu, id, description } = link;
            const rgb = style && (style.startsWith('#') ? hexToRgb(style) : rgbString2Obj(style));
            const hsp = rgb
              ? Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b))
              : 0;
            const isDark = hsp <= 127.5;
            const buttonStyle = TYPES.includes(style)
              ? {}
              : {
                  backgroundColor: style,
                  color: isDark ? '#fff' : '#000',
                };

            if (menu) {
              const linkItem = (
                <Dropdown align="start" className="link-btn" onClick={() => onMenuClick(index)}>
                  <Dropdown.Toggle size="sm" className="link-group" variant={style}>
                    {buttonTitle}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    {menu.map(({ title: menuTitle, url: menuUrl }) => {
                      return (
                        <Dropdown.Item size="sm" key={menuUrl} href={menuUrl}>
                          {menuTitle}
                        </Dropdown.Item>
                      );
                    })}
                  </Dropdown.Menu>
                </Dropdown>
              );

              return editable ? (
                <ContextMenu
                  // key={id}
                  data={link}
                  menu={linkMenu}
                  onOpen={() => handleLinkContextOpen(linkIndex)}
                >
                  {linkItem}
                </ContextMenu>
              ) : (
                linkItem
              );
            }

            const button = (
              <Button
                as="a"
                href={url}
                size="sm"
                date-url={url}
                className="link-btn"
                variant={TYPES.includes(style) ? style : 'light'}
                style={buttonStyle}
              >
                {buttonTitle}
              </Button>
            );

            if (editable) {
              return (
                <ContextMenu
                  // key={id}
                  data={link}
                  menu={linkMenu}
                  onOpen={() => handleLinkContextOpen(linkIndex)}
                >
                  {button}
                </ContextMenu>
              );
            }

            return (
              <OverlayTrigger
                placement="top"
                show={typeof description === 'undefined' ? false : undefined}
                overlay={<Tooltip>{description}</Tooltip>}
              >
                {button}
              </OverlayTrigger>
            );
          })}
        </Card.Body>
      </Card>
    </StyledBlock>
  );

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
    );
  }

  return card;
}
