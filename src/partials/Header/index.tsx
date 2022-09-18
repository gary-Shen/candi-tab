import type { MenuButtonProps } from '@reach/menu-button';
import { Menu, MenuButton } from '@reach/menu-button';
import { BiCheck } from '@react-icons/all-files/bi/BiCheck';
import { BiCog } from '@react-icons/all-files/bi/BiCog';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { BiExport } from '@react-icons/all-files/bi/BiExport';
import { BiImport } from '@react-icons/all-files/bi/BiImport';
import { BiSync } from '@react-icons/all-files/bi/BiSync';
import omit from 'lodash/fp/omit';
import React, { useCallback, useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import type { Setting } from '@/types/setting.type';
import download from '@/utils/download';

import SettingsContext from '../../context/settings.context';
import { buttonStyle } from '../IconButton';
import IconText from '../IconText';
import Modal from '../Modal';
import OAuth from '../OAuth';
import { StyledHeader, StyledMenuItem, StyledMenuList } from './styled';

// @ts-ignore
const StyledMenuButton = (props: Polymorphic.ForwardRefComponent<'button', MenuButtonProps>) => (
  <MenuButton {...props} css={buttonStyle} />
);

export interface HeaderProps {
  onEdit: (e: React.MouseEvent) => void;
  editable?: boolean;
}

export default function Header({ onEdit, editable }: HeaderProps) {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [oauthVisible, setOauthVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [toImport, setToImport] = useState<Setting | null>(null);

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

  const handleFileOnload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (files && files.length) {
      const file = files.item(0);
      const reader = new FileReader();
      reader.readAsText(file!);
      reader.onload = () => {
        let imported;
        try {
          imported = JSON.parse(reader.result as string);
        } catch (err) {
          // return window.alert(file.name + " doesn't seem to be a valid JSON file.");
        }

        setToImport(imported);
      };
    }
  }, []);

  const handleSaveImport = useCallback(() => {
    if (!toImport) {
      return;
    }

    updateSettings({
      ...(omit(['gistId'])(toImport) as Setting),
      gistId: settings.gistId,
      createdAt: Date.now(),
    });
    setImportVisible(false);
  }, [updateSettings, toImport, settings]);

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
          <StyledMenuList>
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
          </StyledMenuList>
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
