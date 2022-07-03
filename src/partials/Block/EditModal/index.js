import React, { useState } from 'react';
import classNames from 'classnames';
import { DragOutlined } from '@ant-design/icons'
import upperFirst from 'lodash/upperFirst';
import pick from 'lodash/pick';
import get from 'lodash/get';
import update from 'lodash/fp/update';
import compose from 'lodash/fp/compose';
import fpGet from 'lodash/fp/get';
import { Button, Form, Tabs, Tab, ButtonGroup, Popover, InputGroup, OverlayTrigger, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

import { uuid } from '../../../utils';
import { TYPES } from '../../../const';
import IconText from '../../IconText';
import Modal from '../../../partials/Modal';
import styles from './index.less';

const StylePicker = ({ value, onChange, className, ...props }) => {
  const handleChangeStyle = (type) => {
    if (onChange) {
      onChange(typeof type === 'object' ? type.target.value : type);
    }
  };
  
  return (
    <div>
      <Tabs className={classNames(styles.tab, className)} defaultActiveKey="preset" id="uncontrolled-tab-example" {...props}>
        <Tab eventKey="preset" title="Built-in">
          <ButtonGroup className="me-2" aria-label="Second group">
            {TYPES.map(type => (
              <Button key={type} variant={type} onClick={() => handleChangeStyle(type)} />
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
  )
}

const LinkForm = ({ data, onChange }) => {
  const [isMenu, toggleIsMenu] = useState(!!data.menu);
  const handleOnChange = field => (e) => {
    onChange(field)(e.target ? e.target.value : e);
  };

  const handleToggleIsMenu = () => {
    if (!isMenu) {
      onChange('menu')(data.url ? [{ id: uuid(), ...pick(data, ['title', 'url']) }] : []);
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
        update('menu')(items => (items || []).concat([{ id: uuid(), title: 'untitled', url: '' }]))
      )(data))
  };

  const handleDeleteMenu = (id) => () => {
    onChange('menu')(
      compose(
        fpGet('menu'),
        update('menu')(items => (items || []).filter(item => item.id !== id))
      )(data)
    )
  }

  const popover = (
    <Popover>
      <Popover.Body>
        <StylePicker onChange={handleOnChange('style')} value={data.style} />
      </Popover.Body>
    </Popover>
  );

  const buttonStyle = TYPES.includes(data.style) ? {} : {
    backgroundColor: data.style,
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="input"
          placeholder="Type link name here"
          autoFocus
          onChange={handleOnChange('title')}
          value={data.title}
        />
      </Form.Group>

      <Form.Group className="mb-3" controlId="isMenu">
        <Form.Check 
          type="checkbox"
          checked={isMenu}
          onChange={handleToggleIsMenu}
          label="Convert to Menu"
        />
      </Form.Group>
      
      {!isMenu && (
        <Form.Group className="mb-3" controlId="url">
          <Form.Label>Link</Form.Label>
          <InputGroup className="mb-3">
            <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
              <Button variant={TYPES.includes(data.style) ? data.style : 'light'} className={styles.styleBtn} style={buttonStyle} />
            </OverlayTrigger>
            
            <Form.Control
              type="input"
              placeholder="Type link name here"
              onChange={handleOnChange('url')}
              value={data.url}
            />
          </InputGroup>
        </Form.Group>
      )}

      {isMenu && (
        <Form.Group className="mb-3" controlId="url">
          <Form.Label>Links</Form.Label>
          {
            data.menu && data.menu.map((item, index) => (
              <InputGroup className="mb-3" key={item.id}>
                <Button size="sm" variant="secondary" className={styles.moveLink} onClick={handleDeleteMenu(item.id)}>
                  <IconText text="">
                    <DragOutlined />
                  </IconText>
                </Button>
                <Form.Control
                  type="input"
                  onChange={handleOnChange(`menu[${index}].title`)}
                  value={item.title}
                />
                <Form.Control
                  type="input"
                  onChange={handleOnChange(`menu[${index}].url`)}
                  value={item.url}
                />
                <Button size="sm" variant="danger" onClick={handleDeleteMenu(item.id)}>
                  Delete
                </Button>
              </InputGroup>
            ))
          }
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handleAddMenu} size="sm">
              Add link
            </Button>
          </div>
        </Form.Group>
      )}
      <Form.Group
        className="mb-3"
        controlId="description"
      >
        <Form.Label>Description</Form.Label>
        <Form.Control value={data.description} onChange={handleOnChange('description')} as="textarea" rows={3} />
      </Form.Group>
    </Form>
  );
};

const BlockForm = ({ data, onChange }) => {
  const handleOnChange = field => (e) => {
    onChange(field)(e.target.value);
  };

  return (
    <Form>
      <Form.Group className="mb-3" controlId="title">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="input"
          placeholder="Block title"
          autoFocus
          onChange={handleOnChange('title')}
          value={data.title}
        />
      </Form.Group>
    </Form>
  );
} 

const FormSet = {
  Link: LinkForm,
  Block: BlockForm,
};

export default function EditModal({ data, type, onChange, ...props}) {
  const EditForm = FormSet[upperFirst(type)];
  return (
    <Modal
      {...props}
    >
      <Modal.Header closeButton>
        {data.title || 'untitled'}
      </Modal.Header>
      <Modal.Body>
        <EditForm data={data} onChange={onChange} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>Close</Button>
        <Button onClick={props.onSave}>Save</Button>
      </Modal.Footer>
    </Modal>
  );
}