import { BiTrash } from '@react-icons/all-files/bi/BiTrash';
import classNames from 'classnames';
import compose from 'lodash/fp/compose';
import fpGet from 'lodash/fp/get';
import update from 'lodash/fp/update';
import get from 'lodash/get';
import pick from 'lodash/pick';
import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useState } from 'react';
import { Button, ButtonGroup, Form, InputGroup, OverlayTrigger, Popover, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { TYPES } from '@/constant';
import type { Block, Link, MenuLink } from '@/types/setting.type';
import { gid } from '@/utils/gid';

import MyButton from '../../Button';
import Modal from '../../Modal';
import StyledBody from './styled';

export interface LinkColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const StylePicker = ({ value, onChange, className, ...props }: LinkColorPickerProps) => {
  const handleChangeStyle = useCallback(
    (type: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(typeof type === 'object' ? type.target.value : type);
      }
    },
    [onChange],
  );

  return (
    <div>
      <Tabs
        className={classNames('color-tab', className)}
        defaultActiveKey="preset"
        id="uncontrolled-tab-example"
        {...props}
      >
        <Tab eventKey="preset" title="Built-in">
          <ButtonGroup className="me-2" aria-label="Second group">
            {TYPES.map((type) => (
              <Button key={type} variant={type} onClick={() => handleChangeStyle(type as any)} />
            ))}
          </ButtonGroup>
        </Tab>
        <Tab eventKey="custom" title="Color">
          <Form.Control
            type="color"
            defaultValue="#563d7c"
            title="Choose your color"
            value={value}
            onChange={handleChangeStyle}
          />
        </Tab>
      </Tabs>
    </div>
  );
};

export type FormOnChange = (field: string) => (value: string | number | undefined | any[]) => void;

export interface LinkFormProps {
  data: Link;
  onChange: FormOnChange;
  onClose: () => void;
  onSave: () => void;
}

const LinkForm = ({ data, onChange, onSave }: LinkFormProps) => {
  const { t } = useTranslation();
  const [isMenu, toggleIsMenu] = useState(!!data.menu);
  const handleOnChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field)(e.target.value);
  };

  const handleValueChange = (field: string) => (value: string) => {
    onChange(field)(value);
  };

  const handleToggleIsMenu = () => {
    if (!isMenu) {
      onChange('menu')(data.url ? [{ id: gid(), ...pick(data, ['title', 'url']) }] : []);
      onChange('url')(undefined);
    } else {
      onChange('menu')(undefined);
      onChange('url')(data.menu ? get(data.menu, [0, 'url']) : '');
    }
    toggleIsMenu(!isMenu);
  };

  const handleAddMenu = () => {
    onChange('menu')(
      compose(
        fpGet('menu'),
        update('menu')((items) => (items || []).concat([{ id: gid(), title: 'untitled', url: '' }])),
      )(data),
    );
  };

  const handleDeleteMenu = (id: string) => () => {
    onChange('menu')(
      compose(
        fpGet('menu'),
        update('menu')((items) => (items || []).filter((item: MenuLink) => item.id !== id)),
      )(data),
    );
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSave();
    },
    [onSave],
  );

  const popover = (
    <Popover>
      <Popover.Body>
        <StylePicker onChange={handleValueChange('style')} value={data.style} />
      </Popover.Body>
    </Popover>
  );

  const buttonStyle = TYPES.includes(data.style)
    ? {}
    : {
        backgroundColor: data.style,
      };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>{t('name')}</Form.Label>
        <Form.Control
          type="input"
          placeholder="Type link name here"
          autoFocus
          onChange={handleOnChange('title')}
          value={data.title}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="isMenu">
        <Form.Check type="checkbox" checked={isMenu} onChange={handleToggleIsMenu} label={t('Convert to Menu')} />
      </Form.Group>

      {!isMenu && (
        <Form.Group className="mb-3" controlId="url">
          <Form.Label>{t('link')}</Form.Label>
          <InputGroup className="mb-3">
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
              <Button
                variant={TYPES.includes(data.style) ? data.style : 'light'}
                className="style-btn"
                style={buttonStyle}
              />
            </OverlayTrigger>

            <Form.Control
              type="input"
              placeholder={t('Type link name here')}
              onChange={handleOnChange('url')}
              value={data.url}
            />
          </InputGroup>
        </Form.Group>
      )}

      {isMenu && (
        <Form.Group className="mb-3" controlId="url">
          <Form.Label>{t('links')}</Form.Label>
          {data.menu &&
            data.menu.map((item, index) => (
              <InputGroup className="mb-3" key={item.id}>
                <Form.Control type="input" onChange={handleOnChange(`menu[${index}].title`)} value={item.title} />
                <Form.Control type="input" onChange={handleOnChange(`menu[${index}].url`)} value={item.url} />
                <Button size="sm" variant="danger" onClick={handleDeleteMenu(item.id)}>
                  <BiTrash />
                </Button>
              </InputGroup>
            ))}
          <div className="d-grid gap-2">
            <MyButton type="primary" onClick={handleAddMenu}>
              {t('addLink')}
            </MyButton>
          </div>
        </Form.Group>
      )}
      <Form.Group className="mb-3" controlId="description">
        <Form.Label>{t('description')}</Form.Label>
        <Form.Control value={data.description} onChange={handleOnChange('description')} as="textarea" rows={3} />
      </Form.Group>
    </Form>
  );
};

export interface BlockFormProps {
  data: Block;
  onChange: FormOnChange;
  onClose: () => void;
  onSave: () => void;
}

const BlockForm = ({ data, onChange, onSave }: BlockFormProps) => {
  const { t } = useTranslation();
  const handleOnChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field)(e.target.value);
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSave();
    },
    [onSave],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>{t('title')}</Form.Label>
        <Form.Control
          type="input"
          placeholder={t('blockTitle')}
          autoFocus
          onChange={handleOnChange('title')}
          value={data.title}
        />
      </Form.Group>
    </Form>
  );
};

const FormSet: Record<FormType, typeof LinkForm | typeof BlockForm> = {
  Link: LinkForm,
  Block: BlockForm,
};

type FormType = 'Link' | 'Block';
export type EditType = 'link' | 'block';

export interface EditModalProps {
  data: Link | Block;
  visible: boolean;
  type: EditType;
  onChange: FormOnChange;
  onSave: () => void;
  onClose: () => void;
}

export default function EditModal({ data, type, onChange, ...props }: EditModalProps) {
  const EditForm = FormSet[upperFirst(type) as FormType];
  const { t } = useTranslation();
  return (
    <Modal {...props} onClose={props.onClose}>
      <Modal.Header>{data.title || 'untitled'}</Modal.Header>
      <Modal.Body>
        <StyledBody>
          <EditForm data={data as Link & Block} onChange={onChange} onSave={props.onSave} onClose={props.onClose} />
        </StyledBody>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          {t('close')}
        </Button>
        <Button onClick={props.onSave}>{t('done')}</Button>
      </Modal.Footer>
    </Modal>
  );
}
