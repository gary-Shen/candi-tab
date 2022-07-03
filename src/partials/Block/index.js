import React, { useState } from 'react';
import { Button, Card, Dropdown, Tooltip, OverlayTrigger } from 'react-bootstrap';
import classNames from 'classnames';
import ContextMenu from 'lina-context-menu';
import { set, update, concat } from 'lodash/fp';

import { uuid } from '../../utils';
import EditModal from './EditModal';
import Modal from '../Modal';
import { TYPES } from '../../const';
import styles from './index.less';

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

export default function Block({ block, onMenuClick, settings, updateSettings, index, editable }) {
  const { buttons: links, title } = block;
  const [editVisible, toggleEditVisible] = useState(false);
  const [editType, setEditType] = useState('block');
  const [editData, setEditData] = useState(block);
  const [activeLinkIndex, setActiveLinkIndex] = useState(-1);
  const [isAddition, toggleAddition] = useState(null);
  const [confirmVisible, toggleConfirmVisible] = useState(false);
  const [dataToDelete, setDataToDelete] = useState(null);

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
    let newSettings = settings;
    if (isAddition) {
      if (editType === 'link') {
        newSettings = update(`links[${index}].buttons`)((links) => concat(links || [])([editData]))(newSettings);
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
  };

  /**
   * 添加block
   */
  const handleAddBlock = () => {
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
  };

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
        title: 'Edit',
        onClick: handleEditBlock,
      },
      {
        key: 2,
        title: 'Add block',
        onClick: handleAddBlock,
      },
    ],
    [
      {
        key: 4,
        title: 'Delete',
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
        title: 'Edit',
        onClick: handleEditLink,
      },
      {
        key: 1,
        title: 'Insert link after',
        onClick: handleAddLink,
      },
      {
        key: 3,
        title: 'Delete',
        onClick: (e, _, link) => {
          setDataToDelete(link);
          toggleConfirmVisible(true);
        },
      },
    ],
  ];

  const card = (
    <Card className={styles.card}>
      <Card.Header className={styles.cardHeader}>{title}</Card.Header>
      <Card.Body className={styles.blockContent}>
        {links.length === 0 && editable && (
          <Button size="sm" className={styles.linkBtn} onClick={handleAddLink} variant="light">
            Add link
          </Button>
        )}
        {links.map((link, linkIndex) => {
          const { title: buttonTitle, style, url, menu, id, description } = link;
          const rgb = style && (style.startsWith('#') ? hexToRgb(style) : rgbString2Obj(style));
          const hsp = rgb ? Math.sqrt(0.299 * (rgb.r * rgb.r) + 0.587 * (rgb.g * rgb.g) + 0.114 * (rgb.b * rgb.b)) : 0;
          const isDark = hsp <= 127.5;
          const buttonStyle = TYPES.includes(style)
            ? {}
            : {
                backgroundColor: style,
                color: isDark ? '#fff' : '#000',
              };

          buttonTitle === '本地Plex' && console.log('rgb', buttonTitle, isDark, style);

          if (menu) {
            const linkItem = (
              <Dropdown align="start" className={classNames(styles.linkBtn)} onClick={() => onMenuClick(index)}>
                <Dropdown.Toggle size="sm" className={styles.linkGroup} variant={style}>
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
              className={styles.linkBtn}
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
