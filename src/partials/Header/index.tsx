import type { MenuButtonProps } from '@reach/menu-button';
import { MenuButton } from '@reach/menu-button';
import { BiCheck } from '@react-icons/all-files/bi/BiCheck';
import { BiClipboard } from '@react-icons/all-files/bi/BiClipboard';
import { BiCog } from '@react-icons/all-files/bi/BiCog';
import { BiEditAlt } from '@react-icons/all-files/bi/BiEditAlt';
import { BiExport } from '@react-icons/all-files/bi/BiExport';
import { BiImport } from '@react-icons/all-files/bi/BiImport';
import { BiInfoCircle } from '@react-icons/all-files/bi/BiInfoCircle';
import { BiMenu } from '@react-icons/all-files/bi/BiMenu';
import { set } from 'lodash/fp';
import omit from 'lodash/fp/omit';
import React, { useCallback, useContext, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { buttonStyle } from '@/components/IconButton';
import IconText from '@/components/IconText';
import Menu, { MenuItem, MenuList } from '@/components/Menu';
import Modal from '@/components/Modal';
import SettingsContext from '@/context/settings.context';
import type { Setting } from '@/types/setting.type';
import { calcLayout } from '@/utils/calcLayout';
import download from '@/utils/download';

import About from '../About';
import SettingModal from '../Setting';
import { StyledHeader } from './styled';

// @ts-ignore
const StyledMenuButton = (props: Polymorphic.ForwardRefComponent<'button', MenuButtonProps>) => (
  <MenuButton {...props} css={buttonStyle} />
);

export interface HeaderProps {
  onEdit: (e: React.MouseEvent) => void;
  editable?: boolean;
}

export default function Header({ onEdit, editable }: HeaderProps) {
  const { t } = useTranslation();
  const { settings, updateSettings } = useContext(SettingsContext);
  const [oauthVisible, setOauthVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [toImport, setToImport] = useState<Setting | null>(null);

  const handleOpenSyncing = useCallback(() => {
    setOauthVisible(true);
  }, []);
  const handleCloseSyncing = useCallback(() => {
    setOauthVisible(false);
  }, []);

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
      setImportVisible(false);
      return;
    }

    const newSettings = {
      ...(omit(['gistId'])(toImport) as Setting),
      gistId: settings.gistId,
      createdAt: Date.now(),
    };

    updateSettings(newSettings);

    setTimeout(() => {
      // 重新計算佈局
      updateSettings(calcLayout(newSettings));
    }, 1000);
    setImportVisible(false);
  }, [updateSettings, toImport, settings]);

  // 关于
  const [aboutVisible, toggleAboutVisible] = useState(false);
  const handleShowAbout = useCallback(() => {
    toggleAboutVisible(true);
  }, []);

  // clipboard
  const [clipboardVisible, toggleClipboardVisible] = useState(false);
  const [clipContent, setClipContent] = useState(settings.clipboard);
  const handleOpenClipboard = useCallback(() => {
    toggleClipboardVisible(true);
  }, []);
  const handleClipContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClipContent(e.target.value);
  }, []);
  const handleSaveClipboard = useCallback(() => {
    const newSettings = set('clipboard')(clipContent)(settings);
    newSettings.createdAt = Date.now();
    updateSettings(newSettings);
    toggleClipboardVisible(false);

    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sync-upload'));
    }, 1000);
  }, [clipContent, settings, updateSettings]);

  return (
    <>
      <StyledHeader>
        <Menu>
          <StyledMenuButton onClick={handleOpenClipboard}>
            <BiClipboard />
          </StyledMenuButton>
        </Menu>
        <Menu>
          <StyledMenuButton onClick={onEdit}>{editable ? <BiCheck /> : <BiEditAlt />}</StyledMenuButton>
        </Menu>
        <Menu>
          <StyledMenuButton>
            <BiMenu />
          </StyledMenuButton>
          <MenuList>
            <MenuItem onSelect={handleOpenSyncing}>
              <IconText text={t('setting')}>
                <BiCog />
              </IconText>
            </MenuItem>
            <MenuItem onSelect={handleOpenImport}>
              <IconText text={t('import')}>
                <BiImport />
              </IconText>
            </MenuItem>
            <MenuItem onSelect={handleExport}>
              <IconText text={t('export')}>
                <BiExport />
              </IconText>
            </MenuItem>
            <MenuItem onSelect={handleShowAbout}>
              <IconText text={t('about')}>
                <BiInfoCircle />
              </IconText>
            </MenuItem>
          </MenuList>
        </Menu>
      </StyledHeader>
      {oauthVisible && <SettingModal visible={oauthVisible} onClose={handleCloseSyncing} />}
      <About visible={aboutVisible} onClose={() => toggleAboutVisible(false)} />
      <Modal visible={importVisible} onClose={() => setImportVisible(false)}>
        <Form>
          <Modal.Header>{t('import')}</Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Control type="file" onChange={handleFileOnload} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Form.Group>
              <Button variant="primary" onClick={handleSaveImport}>
                {t('done')}
              </Button>
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal visible={clipboardVisible} onClose={() => toggleClipboardVisible(false)}>
        <Form>
          <Modal.Header>{t('clipboard content')}</Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Control as="textarea" rows={12} value={clipContent} onChange={handleClipContentChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Form.Group>
              <Button variant="primary" onClick={handleSaveClipboard}>
                {t('done')}
              </Button>
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}
