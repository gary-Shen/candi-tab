import React, { useCallback, useContext, useMemo } from 'react';
import { changeLanguage } from 'i18next';
import { set } from 'lodash/fp';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';

import Modal from '@/components/Dialog';
import MyTabs from '@/components/Tabs';
import Select from '@/components/Select';

import SettingsContext from '../../context/settings.context';
import OAuth from './OAuth';

export interface OAuthProps {
  visible?: boolean;
  onClose?: () => void;
}

const themes = [
  {
    label: 'Github Light',
    value: 'github-light',
  },
  {
    label: 'Github Dark',
    value: 'github-dark',
  },
];

const langOptions = [
  {
    label: 'English',
    value: 'en-US',
  },
  {
    label: '中文-简体',
    value: 'zh-CN',
  },
  {
    label: '中文-繁体',
    value: 'zh-TR',
  },
];

export default function SettingModal({ visible, onClose }: OAuthProps) {
  const { settings, updateSettings } = useContext(SettingsContext);
  const { t } = useTranslation();
  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  const handleLangChange = useCallback(
    (value: string) => {
      updateSettings(set('general.language')(value)(settings));
      changeLanguage(value);

      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'));
      }, 1000);
    },
    [settings, updateSettings],
  );

  const handleThemeSolutionChange = useCallback(
    (value: string) => {
      updateSettings(set('theme.solution')(value)(settings));
    },
    [settings, updateSettings],
  );

  const tabItems = useMemo(() => {
    return [
      {
        title: t('general'),
        key: 'general',
        content: (
          <div>
            <div className="mb-4">
              <div className="mb-2">{t('language')}</div>
              <Select options={langOptions} value={get(settings, 'general.language')} onChange={handleLangChange} />
            </div>
            <div>
              <div className="mb-2">{t('themeSolution')}</div>
              <Select options={themes} value={get(settings, 'theme.solution')} onChange={handleThemeSolutionChange} />
            </div>
          </div>
        ),
      },
      {
        title: t('synchronization'),
        key: 'synchronization',
        content: <OAuth onClose={handleClose} />,
      },
    ];
  }, [handleClose, handleLangChange, handleThemeSolutionChange, settings, t]);

  return (
    <Modal title={t('setting')} visible={visible} onClose={handleClose} width={442}>
      <MyTabs items={tabItems} />
    </Modal>
  );
}
