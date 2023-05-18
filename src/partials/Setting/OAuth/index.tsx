import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BiLinkExternal } from '@react-icons/all-files/bi/BiLinkExternal';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

// import Card from '@/components/Card';
import { Transition } from '@headlessui/react';

import Button from '@/components/LinkButton';
import Modal from '@/components/Dialog';
import SettingsContext from '@/context/settings.context';
import * as gistService from '@/service/gist';
import type { IGist } from '@/types/gist.type';
import { calcLayout } from '@/utils/calcLayout';
import { gid } from '@/utils/gid';
import parseGistContent from '@/utils/parseGistContent';
import { useGistAll, useGistOne } from '@/hooks/useGistQuery';
import Input from '@/components/Input';
import TextArea from '@/components/TextArea';
import Spin from '@/components/Spin';
import MyRadioGroup from '@/components/RadioGroup';
import IconText from '@/components/IconText';
import Select from '@/components/Select';

import StyledOauth from './styled';

const spinner = <Spin />;

const uuid = gid();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

function GistList() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const allGist = useGistAll();
  const [selectedGist, setSelectedGist] = useState<IGist | undefined>();
  const [selectedFile, setSelectedFile] = useState<string>('');
  const oneGist = useGistOne(selectedGist?.id || settings.gistId);
  const { t } = useTranslation();

  const files = useMemo(() => {
    if (!oneGist.data) {
      return [];
    }

    return Object.keys(oneGist.data.files || {}).map((fileName) => {
      return {
        label: fileName,
        value: fileName,
      };
    });
  }, [oneGist]);

  const fileName = settings.fileName || files?.[0]?.value;

  const gistOptions = useMemo(() => {
    return (allGist.data ?? []).map((gist) => {
      return {
        label: gist.description,
        value: gist.id,
      };
    });
  }, [allGist.data]);

  const handleSelectGist = useCallback(
    (gistId: string) => {
      const gist = allGist.data?.find((item) => item.id === gistId);
      setSelectedGist(gist!);
      setSelectedFile('');
    },
    [allGist.data],
  );
  const handleSelectFile = useCallback((changedFileName: string) => {
    setSelectedFile(changedFileName);
  }, []);

  const handleSave = useCallback(() => {
    if (oneGist?.data && selectedGist?.id) {
      const newSettings = {
        ...settings,
        // @ts-ignore
        ...parseGistContent(oneGist.data!),
        gistId: selectedGist.id,
      };

      updateSettings(newSettings);

      setTimeout(() => {
        updateSettings(calcLayout(newSettings));
      });
    }
  }, [oneGist.data, selectedGist?.id, settings, updateSettings]);

  const disabled = useMemo(() => {
    return !oneGist.data || oneGist.isLoading || !(fileName in oneGist.data.files!);
  }, [fileName, oneGist.data, oneGist.isLoading]);

  if (gistOptions.length === 0) {
    return null;
  }

  return (
    <div className="max-h-[60vh] mx-[-0.8rem] px-[0.8rem] my-[-3px] py-[3px]">
      <div className="mb-2">
        <div>gist</div>
        <Select options={gistOptions} value={settings.gistId} onChange={handleSelectGist} />
      </div>
      <div className="mb-2">
        <div>file</div>
        <Select options={files} value={fileName} onChange={handleSelectFile} />
      </div>
      <Button disabled={disabled} type="secondary" className="w-full" onClick={handleSave}>
        使用此文件
      </Button>
    </div>
  );
}

export default function OAuth() {
  const { settings, updateSettings, accessToken, updateAccessToken } = useContext(SettingsContext);
  const [tokenValue, setTokenValue] = useState(accessToken);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    setTokenValue(accessToken);
  }, [accessToken]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenValue(e.target.value);
  };

  const handleSave = useCallback(() => {
    updateAccessToken(tokenValue);
  }, [tokenValue, updateAccessToken]);
  /** ========================== 选中gist ========================== */

  const gistId = _.get(settings, `gistId`);

  const [selectedGist, setGist] = useState<IGist | null>(null);
  const oneGist = useGistOne(gistId);
  const allGist = useGistAll();
  const filename = _.chain(oneGist.data).get(`files`).keys().head().value();
  const [gistsModalVisible, toggleGistsModalVisible] = useState(false);

  const handleOpenGists = useCallback(() => {
    toggleGistsModalVisible(true);
  }, [toggleGistsModalVisible]);

  const handleSelectGist = useCallback((gist: IGist) => {
    setGist(gist);
  }, []);
  const handleSaveGist = useCallback(() => {
    if (!selectedGist) {
      toggleGistsModalVisible(false);
      return;
    }
    if (oneGist?.data) {
      const newSettings = {
        ...settings,
        // @ts-ignore
        ...parseGistContent(oneGist.data!),
        gistId: selectedGist.id,
      };

      updateSettings(newSettings);

      setTimeout(() => {
        updateSettings(calcLayout(newSettings));
      });
    }

    toggleGistsModalVisible(false);
  }, [oneGist?.data, selectedGist, settings, updateSettings]);

  /** ========================== 选中gist ========================== */

  /** ========================== 创建gist ========================== */
  const [createGistModalVisible, toggleCreateGistModalVisible] = useState(false);
  const createMutation = useMutation(gistService.create, {
    onSuccess: (response: { data: IGist }) => {
      toggleCreateGistModalVisible(false);
      setGist(response.data);
      updateSettings({
        ...settings,
        gistId: response.data.id,
      });
      setTimeout(() => {
        queryClient.invalidateQueries('gist' as any);
      });
    },
    enabled: !!accessToken,
  } as any);

  const [gistForm, setGistForm] = useState({
    files: {},
    public: false,
    description: 'A gist for settings syncing of candi-tab chrome extension',
    fileName: 'candi_tab_settings',
  });
  const handleCloseCreateModal = useCallback(() => {
    toggleCreateGistModalVisible(false);
  }, []);
  const handleCreateGist = useCallback(() => {
    toggleCreateGistModalVisible(true);
  }, []);
  const handleGistChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setGistForm({
        ...gistForm,
        [field]: e.target.value,
      });
    },
    [gistForm],
  );
  const handleSaveCreateGist = useCallback(() => {
    createMutation.mutate({
      gist: gistForm,
      settings,
    });
  }, [createMutation, gistForm, settings]);
  /** ========================== 创建gist ========================== */

  return (
    <StyledOauth className="oauth-modal-content">
      <Input
        className="mb-2"
        placeholder={t('pasteToken')}
        autoFocus
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.which === 13) {
            e.preventDefault();
            handleSave();
          }
        }}
        onChange={handleOnChange}
        value={tokenValue}
      />
      <div className="flex justify-end mb-4">
        <IconText
          position="right"
          text={
            <a href={OAUTH_URL} target="_blank" rel="noreferrer">
              {t('createAccessToken')}
            </a>
          }
        >
          <BiLinkExternal />
        </IconText>
      </div>
      <div className="overflow-x-hidden">
        <div className="w-[200%] relative h-[250px]">
          <Transition
            className="w-[50%] absolute"
            show={!createGistModalVisible}
            enter="transition ease-in-out duration-200"
            enterFrom="-translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in-out duration-200"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="-translate-x-full opacity-0"
          >
            <form
              className="oauth-form"
              onSubmit={(e) => {
                e.preventDefault();
                return;
              }}
            >
              <Spin spinning={allGist.isLoading} className="mb-4">
                <GistList />
              </Spin>
              {accessToken && allGist.data && (
                <Button
                  className="w-full"
                  // @ts-ignore
                  disabled={createMutation.isFetching}
                  type="primary"
                  onClick={handleCreateGist}
                >
                  {t('createGist')}
                </Button>
              )}
            </form>
          </Transition>
          <Transition
            className="w-[50%] absolute"
            show={createGistModalVisible}
            enter="transition ease-in-out duration-200"
            enterFrom="translate-x-full opacity-0"
            enterTo="translate-x-0 opacity-100"
            leave="transition ease-in-out duration-200"
            leaveFrom="translate-x-0 opacity-100"
            leaveTo="translate-x-full opacity-0"
          >
            <div>{t('fileName')}</div>
            <Input
              className="mb-2"
              placeholder={t('pasteToken')}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.which === 13) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              onChange={handleOnChange}
              value={gistForm.fileName}
            />
            <div>{t('description')}</div>
            <TextArea className="mb-2" rows={3} value={gistForm.description} />
            <Button
              className="w-full"
              type="primary"
              onClick={() => {
                toggleCreateGistModalVisible(false);
              }}
            >
              Save
            </Button>
          </Transition>
        </div>
      </div>

      {/* 創建gist */}
      {/* <Modal visible={createGistModalVisible} onClose={handleCloseCreateModal}>
        <Modal.Header>{t('createGist')}</Modal.Header>
        <Modal.Body>
          <Form
            className="gist-form"
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Form.Group className="mb-2" controlId="description">
              <Form.Label>{t('fileName')}</Form.Label>
              <InputGroup className="mb-2">
                <Form.Control
                  autoFocus
                  placeholder="file name"
                  aria-label="file name"
                  aria-describedby="fileName"
                  onChange={handleGistChange('fileName')}
                  value={gistForm.fileName}
                />
                <InputGroup.Text id="fileName">.json</InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-2" controlId="description">
              <Form.Label>{t('description')}</Form.Label>
              <Form.Control
                value={gistForm.description}
                onChange={handleGistChange('description')}
                as="textarea"
                rows={3}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button type="secondary" onClick={handleCloseCreateModal}>
            {t('close')}
          </Button>
          <Button disabled={createMutation.isLoading} onClick={handleSaveCreateGist}>
            {createMutation.isLoading ? t('processing') : t('done')}
          </Button>
        </Modal.Footer>
      </Modal> */}
    </StyledOauth>
  );
}
