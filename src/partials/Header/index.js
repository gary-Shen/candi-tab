import React, { useState, useCallback, useContext } from 'react';
import styled from 'styled-components';
import { BiEditAlt, BiCog, BiCheck, BiSync, BiImport, BiExport } from 'react-icons/bi';
import '@reach/dialog/styles.css';
import { Menu, MenuList, MenuButton, MenuItem } from '@reach/menu-button';
import { Button, Form, ListGroup, Col, Row, Badge, Toast, ToastContainer, Card } from 'react-bootstrap';

import IconText from '../IconText';
import OAuth from '../OAuth';
import { buttonStyle } from '../IconButton';
import SettingsContext from '../../context/settings.context';
import Modal from '../Modal';

const StyledHeader = styled.div`
  position: absolute;
  display: flex;
  top: 16px;
  right: 16px;
  z-index: 2;
`;

const StyledMenuButton = (props) => <MenuButton {...props} css={buttonStyle} />;

const Menus = styled(MenuList)`
  background-color: #fff;
  padding: 8px 0;
  border-radius: 3px;
  box-shadow: rgb(15 15 15 / 5%) 0px 0px 0px 1px, rgb(15 15 15 / 10%) 0px 3px 6px, rgb(15 15 15 / 20%) 0px 9px 24px;
`;

const StyledMenuItem = styled(MenuItem)`
  cursor: pointer;
  padding: 4px 16px;
  transition: all 0.2s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

function download(url, name) {
  const link = document.createElement('a');
  link.setAttribute('download', name);
  link.href = url;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function Header({ onEdit, editable }) {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [oauthVisible, setOauthVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [toImport, setToImport] = useState(null);

  const handleOpenSyncing = () => {
    setOauthVisible(true);
  };
  const handleCloseSyncing = () => {
    setOauthVisible(false);
  };

  const handleExport = useCallback(() => {
    download(
      'data:application/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(settings)),
      'candi-tab-settings.json',
    );
  }, [settings]);

  const handleOpenImport = useCallback(() => {
    setImportVisible(true);
  }, []);

  const handleFileOnload = useCallback((e) => {
    if (this.files.length) {
      const file = e.files.item(0);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        let toImport;
        try {
          toImport = JSON.parse(reader.result);
        } catch (e) {
          // return window.alert(file.name + " doesn't seem to be a valid JSON file.");
        }

        setToImport(toImport);
      };
    }
  }, []);

  const handleSaveImport = useCallback(() => {
    updateSettings({
      ...settings,
      ...toImport,
    });
  }, [updateSettings, settings, toImport]);

  return (
    <>
      <StyledHeader>
        <Menu>
          <StyledMenuButton onClick={onEdit}>{editable ? <BiCheck /> : <BiEditAlt />}</StyledMenuButton>
        </Menu>
        <Menu>
          <StyledMenuButton>
            <BiCog />
          </StyledMenuButton>
          <Menus>
            <StyledMenuItem onSelect={handleOpenSyncing}>
              <IconText text="Syncing">
                <BiSync />
              </IconText>
            </StyledMenuItem>
            <StyledMenuItem onSelect={handleOpenImport}>
              <IconText text="Import">
                <BiImport />
              </IconText>
            </StyledMenuItem>
            <StyledMenuItem onSelect={handleExport}>
              <IconText text="Export">
                <BiExport />
              </IconText>
            </StyledMenuItem>
          </Menus>
        </Menu>
      </StyledHeader>
      {oauthVisible && <OAuth visible={oauthVisible} onClose={handleCloseSyncing} />}
      <Modal visible={importVisible} onClose={() => setImportVisible(false)}>
        <Form>
          <Modal.Header>Import setting file</Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Setting file</Form.Label>
              <Form.Control type="file" onChange={handleFileOnload} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Form.Group>
              <Button variant="primary" onClick={handleSaveImport}>
                Yes
              </Button>
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
