import { BiTrash } from '@react-icons/all-files/bi/BiTrash';
import { BiMove } from '@react-icons/all-files/bi/BiMove';
import compose from 'lodash/fp/compose';
import fpGet from 'lodash/fp/get';
import update from 'lodash/fp/update';
import get from 'lodash/get';
import pick from 'lodash/pick';
import upperFirst from 'lodash/upperFirst';
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { TYPES } from '@/constant';
import type { Block, Link, MenuLink } from '@/types/setting.type';
import { gid } from '@/utils/gid';
import Input, { InputGroup } from '@/components/Input';
import TextArea from '@/components/TextArea';
import Button from '@/components/LinkButton';
import MyModal from '@/components/Dialog';
import MyPopover from '@/components/Popover';
import MyTabs from '@/components/Tabs';
import type { ButtonType } from '@/components/LinkButton/styled';
import { MovableContainer, MovableTarget } from '@/components/Movable';

import StyledBody from './styled';

export interface LinkColorPickerProps {
  value: ButtonType | string;
  onChange: (value: string) => void;
  className?: string;
}

const StyledPopover = styled(MyPopover)`
  & > button {
    height: 100%;
    border: 0;

    & > button {
      height: 100%;

      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      border: 0;
    }
  }
`;

const StyledColorWrapper = styled.div`
  button {
    &:not(:last-child) {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:not(:first-child) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
`;

const StylePicker = ({ value, onChange }: LinkColorPickerProps) => {
  const { t } = useTranslation();
  const handleChangeStyle = useCallback(
    (type: React.ChangeEvent<HTMLInputElement> | ButtonType) => {
      if (onChange) {
        onChange(typeof type === 'object' ? type.target.value : type);
      }
    },
    [onChange],
  );

  const handleOnClick = useCallback(
    (type: ButtonType) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      handleChangeStyle(type);
    },
    [handleChangeStyle],
  );

  const tabItems = useMemo(() => {
    return [
      {
        title: t('built in color'),
        key: 'built-in',
        content: (
          <StyledColorWrapper className="flex">
            {TYPES.map((type) => (
              <Button
                key={type}
                type={type as ButtonType}
                className="!p-0 w-8 h-8"
                onClick={handleOnClick(type as ButtonType)}
              />
            ))}
          </StyledColorWrapper>
        ),
      },
      {
        title: t('custom color'),
        key: 'custom',
        content: (
          <input type="color" className="w-full cursor-pointer border-0" value={value} onChange={handleChangeStyle} />
        ),
      },
    ];
  }, [handleChangeStyle, handleOnClick, t, value]);

  return <MyTabs defaultIndex={TYPES.includes(value) ? 0 : 1} items={tabItems} />;
};

const ShadowRow = React.memo(
  React.forwardRef(
    ({ data, targetRef }: { data: MenuLink; targetRef: React.RefObject<any> }, ref: React.ForwardedRef<any>) => {
      const containerRef = useRef<HTMLDivElement>(null);

      useImperativeHandle(ref, () => containerRef.current);

      useEffect(() => {
        // @ts-ignore
        if (containerRef.current && ref?.current) {
          containerRef.current.style.width = `${targetRef.current.parentElement.offsetWidth}px`;
        }
      }, [ref, targetRef]);

      return (
        <div ref={containerRef} className="opacity-70">
          <InputGroup className="mb-2">
            <Button
              type="light"
              onClick={(e) => e.preventDefault()}
              className="self-stretch border !w-24 !p-0 !cursor-move"
            >
              <BiMove />
            </Button>
            <Input readOnly value={data?.title} />
            <Input readOnly value={data?.url} />
            <Button type="danger" className="self-stretch !w-24 !p-0">
              <BiTrash />
            </Button>
          </InputGroup>
        </div>
      );
    },
  ),
);

interface LinkRowProps {
  data: MenuLink;
  index: number;
  onChange: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete: (id: string) => (e: React.MouseEvent) => void;
  onDragStart: (data: MenuLink, index: number) => () => void;
}

const LinkRow = React.memo(({ index, data, onChange, onDelete, onDragStart }: LinkRowProps) => {
  return (
    <InputGroup className="py-1">
      <MovableTarget
        onMouseDown={onDragStart(data, index)}
        getShadowNode={(shadowRef, targetRef) => <ShadowRow ref={shadowRef} data={data} targetRef={targetRef} />}
      >
        <Button
          type="light"
          onClick={(e) => e.preventDefault()}
          className="self-stretch border !w-24 !p-0 !cursor-move"
        >
          <BiMove />
        </Button>
      </MovableTarget>
      <Input onChange={onChange(`menu[${index}].title`)} value={data?.title} />
      <Input onChange={onChange(`menu[${index}].url`)} value={data?.url} />
      <Button type="danger" className="self-stretch !w-24 !p-0" onClick={onDelete(data?.id)}>
        <BiTrash />
      </Button>
    </InputGroup>
  );
});

export type FormOnChange = (field: string) => (value: string | number | undefined | any[]) => void;

export interface LinkFormProps {
  data: Link;
  onChange: FormOnChange;
  onClose: () => void;
  onSave: () => void;
}

const LinkForm = ({ data, onChange, onSave }: LinkFormProps) => {
  const { t } = useTranslation();
  const moveContainerRef = useRef<any>(null);
  const [isMenu, toggleIsMenu] = useState(!!data.menu);
  const handleOnChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleAddMenu = (e: React.MouseEvent<any>) => {
    e.preventDefault();
    onChange('menu')(
      compose(
        fpGet('menu'),
        update('menu')((items) => (items || []).concat([{ id: gid(), title: 'untitled', url: '' }])),
      )(data),
    );
  };

  const handleDeleteMenu = (id: string) => (e: React.MouseEvent<any>) => {
    e.preventDefault();
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

  const popover = <StylePicker onChange={handleValueChange('style')} value={data.style} />;

  const buttonStyle = TYPES.includes(data.style)
    ? {}
    : {
        backgroundColor: data.style,
      };

  const sortIndex = useRef<number | undefined>(undefined);
  const handleMoveEnd = useCallback(
    (order: number) => {
      if (sortIndex.current === undefined) {
        return;
      }

      onChange('menu')(
        compose(
          fpGet('menu'),
          update('menu')((items) => {
            const newItems = [...(items || [])];
            // @ts-ignore
            const [removed] = newItems.splice(sortIndex.current, 1);
            newItems.splice(order, 0, removed);
            return newItems;
          }),
        )(data),
      );
    },
    [data, onChange],
  );
  const handleDragStart = useCallback(
    (linkItem: MenuLink, index: number) => () => {
      sortIndex.current = index;
    },
    [],
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2">{t('name')}</div>
        <InputGroup>
          <StyledPopover className="self-stretch" overlay={popover}>
            <Button
              className="!p-0 w-12"
              type={TYPES.includes(data.style) ? data.style : 'light'}
              style={buttonStyle}
            />
          </StyledPopover>
          <Input placeholder="Type link name here" autoFocus onChange={handleOnChange('title')} value={data.title} />
        </InputGroup>
      </div>

      <div className="mb-4">
        <input type="checkbox" id="isMenu" name="isMenu" checked={isMenu} onChange={handleToggleIsMenu} />
        <label className="ml-2" htmlFor="isMenu">
          {t('Convert to Menu')}
        </label>
      </div>

      {!isMenu && (
        <div className="mb-4">
          <div className="mb-2">{t('link')}</div>
          <Input placeholder={t('Type link name here')} onChange={handleOnChange('url')} value={data.url} />
        </div>
      )}

      {isMenu && (
        <div className="mb-4">
          <div className="mb-2">{t('links')}</div>
          <MovableContainer ref={moveContainerRef} onMouseUp={handleMoveEnd}>
            {data.menu &&
              data.menu.map((item, index) => (
                <div key={item.id}>
                  <LinkRow
                    data={item}
                    index={index}
                    key={item.id}
                    onDragStart={handleDragStart}
                    onChange={handleOnChange}
                    onDelete={handleDeleteMenu}
                  />
                </div>
              ))}
          </MovableContainer>

          <Button className="w-full mt-2" type="secondary" onClick={handleAddMenu}>
            {t('addLink')}
          </Button>
        </div>
      )}
      <div className="mb-2">{t('description')}</div>
      <TextArea value={data.description} onChange={handleOnChange('description')} rows={3} />
    </form>
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
    <form onSubmit={handleSubmit}>
      <div className="mb-2">{t('title')}</div>
      <Input placeholder={t('blockTitle')} autoFocus onChange={handleOnChange('title')} value={data.title} />
    </form>
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
    <MyModal
      {...props}
      width={type === 'link' ? 600 : 400}
      title={data.title || 'untitled'}
      onClose={props.onClose}
      footer={
        <>
          <Button type="secondary" className="flex-1" onClick={props.onClose}>
            {t('close')}
          </Button>
          <Button className="ml-4 flex-1" onClick={props.onSave}>
            {t('done')}
          </Button>
        </>
      }
    >
      <StyledBody>
        <EditForm data={data as Link & Block} onChange={onChange} onSave={props.onSave} onClose={props.onClose} />
      </StyledBody>
    </MyModal>
  );
}
