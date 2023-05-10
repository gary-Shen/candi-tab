import type { MenuButtonProps } from '@reach/menu-button';
import { Menu, MenuButton } from '@reach/menu-button';
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
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import IconButton, { buttonStyle } from '@/components/IconButton';
import Button from '@/components/Button';
import IconText from '@/components/IconText';
// import Menu, { MenuItem, MenuList } from '@/components/Menu';
import Modal from '@/components/Modal';
import SettingsContext from '@/context/settings.context';
import type { Setting } from '@/types/setting.type';
import { calcLayout } from '@/utils/calcLayout';
import download from '@/utils/download';
import MyModal from '@/components/Dialog';
import TextArea from '@/components/TextArea';

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
  const textRef = React.useRef<HTMLTextAreaElement>(null);
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
    updateSettings(set('clipboard')(clipContent)(settings));
    toggleClipboardVisible(false);
  }, [clipContent, settings, updateSettings]);

  return (
    <>
      <StyledHeader>
        <IconButton onClick={handleOpenClipboard} className="">
          <BiClipboard />
        </IconButton>
        <IconButton onClick={onEdit} className="">
          {editable ? <BiCheck /> : <BiEditAlt />}
        </IconButton>
        {/* <Menu>
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
        </Menu> */}
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
              <Button onClick={handleSaveImport}>{t('done')}</Button>
            </Form.Group>
          </Modal.Footer>
        </Form>
      </Modal>

      <MyModal
        visible={clipboardVisible}
        width={640}
        title={t('clipboard content')}
        initialFocus={textRef}
        onClose={() => toggleClipboardVisible(false)}
      >
        <Form onSubmit={(e) => e.preventDefault()}>
          <Form.Group className="mb-3">
            <TextArea rows={12} ref={textRef} value={clipContent} onChange={handleClipContentChange} />
          </Form.Group>
          <Form.Group>
            <Button onClick={handleSaveClipboard}>{t('done')}</Button>
          </Form.Group>
        </Form>
      </MyModal>
    </>
  );
}
