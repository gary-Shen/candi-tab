import { changeLanguage } from 'i18next';
import { set } from 'lodash/fp';
import get from 'lodash/get';
import { useCallback, useContext } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import Modal from '@/components/Modal';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@/components/Tabs';

import SettingsContext from '../../context/settings.context';
import OAuth from './OAuth';
import StyledSettingModal from './styled';

export interface OAuthProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function SettingModal({ visible, onClose }: OAuthProps) {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const handleLangChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSettings(set('general.language')(e.target.value)(settings));
      changeLanguage(e.target.value);

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'));
      }, 1000);
    },
    [settings, updateSettings],
  );

  const handleThemeSolutionChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateSettings(set('theme.solution')(e.target.value)(settings));

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'));
      }, 1000);
    },
    [settings, updateSettings],
  );

  return (
    <StyledSettingModal visible={visible} onClose={handleClose}>
      <Tabs>
        <Modal.Header>
          <TabList>
            <Tab>{t('general')}</Tab>
            <Tab>{t('syncing')}</Tab>
          </TabList>
        </Modal.Header>
        <Modal.Body>
          <TabPanels>
            <TabPanel>
              <Form>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>{t('language')}</Form.Label>
                  <Form.Select
                    autoFocus
                    aria-label="Languages"
                    value={get(settings, 'general.language')}
                    onChange={handleLangChange}
                  >
                    <option value="en-US">English</option>
                    <option value="zh-CN">中文-简体</option>
                    <option value="zh-TR">中文-繁体</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>{t('themeSolution')}</Form.Label>
                  <Form.Select
                    aria-label="Languages"
                    value={get(settings, 'theme.solution')}
                    onChange={handleThemeSolutionChange}
                  >
                    <option value="github-light">Github Light</option>
                    <option value="github-dark">Github Dark</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </TabPanel>
            <TabPanel>
              <OAuth />
            </TabPanel>
          </TabPanels>
        </Modal.Body>
      </Tabs>
    </StyledSettingModal>
  );
}
