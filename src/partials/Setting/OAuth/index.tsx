import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Badge, Col, Dropdown, DropdownButton, Form, InputGroup, ListGroup, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

// import Card from '@/components/Card';
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
import Spin from '@/components/Spin';
import MyRadioGroup from '@/components/RadioGroup';

import StyledOauth from './styled';

const spinner = <Spin />;

const uuid = gid();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

function GistList() {
  const allGist = useGistAll();

  const gistOptions = useMemo(() => {
    return (allGist.data ?? []).map((gist) => {
      return {
        label: gist.description,
        content: (
          <div>
            <ul className="list-disc list-inside">
              {Object.keys(gist.files || {})
                .slice(0, 2)
                .map((fileName) => {
                  return (
                    <li key={fileName} className="my-2">
                      {fileName}
                    </li>
                  );
                })}
            </ul>
            {Object.keys(gist.files || {}).length > 2 && <div className="mb-2">...</div>}
            <div className="flex flex-col items-start">
              <div className="mb-2">updated@{dayjs(gist.updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>
              <div>created@{dayjs(gist.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
          </div>
        ),
        value: gist.id,
      };
    });
  }, [allGist.data]);

  return (
    <div>
      <div className="mb-2 text-lg text-center">我的 gist 列表</div>
      <div className="overflow-y-auto max-h-[60vh] mx-[-0.8rem] px-[0.8rem] my-[-3px] py-[3px]">
        <MyRadioGroup options={gistOptions} />
      </div>
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
  const queryList = useQuery(['gists'], gistService.fetchAll, {
    enabled: gistsModalVisible && !!accessToken,
    cacheTime: 0,
    // @ts-ignore
    initialData: () => [],
  });
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

  const gistNode = (
    <>
      {oneGist.isFetching
        ? spinner
        : !_.isEmpty(oneGist.data) && (
            <Card>
              <Card.Header>{filename}</Card.Header>
              <Card.Body>
                {_.get(oneGist.data, 'data.description')}
                <br />
                <Badge bg="primary">
                  {t('createdAt')}
                  {dayjs(_.get(oneGist.data, 'data.created_at')).format(t('dateFormat'))}
                </Badge>
              </Card.Body>
            </Card>
          )}
    </>
  );

  return (
    <StyledOauth className="oauth-modal-content">
      <Form
        className="oauth-form"
        onSubmit={(e) => {
          e.preventDefault();
          return;
        }}
      >
        {accessToken ? null : (
          <Button type="link" className="w-full mb-2 block" as="a" href={OAUTH_URL} target="_blank">
            {t('createAccessToken')}
          </Button>
        )}

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
        {accessToken && gistNode}
        <Spin spinning={allGist.isLoading} className="mb-2">
          <GistList />
        </Spin>
        {accessToken && !allGist.isLoading && (
          <div className="mb-2">
            <Button
              className="mb-2 w-full"
              // @ts-ignore
              disabled={createMutation.isFetching}
              type="secondary"
              onClick={handleCreateGist}
            >
              {t('createGist')}
            </Button>
          </div>
        )}
      </Form>
      {/* 選擇已有gist */}
      <Modal
        title={t('selectGist')}
        visible={gistsModalVisible}
        onClose={() => toggleGistsModalVisible(false)}
        footer={
          <Button type="primary" onClick={handleSaveGist}>
            {false ? t('processing') : t('done')}
          </Button>
        }
      >
        <div>
          <Spin spinning />
          {!queryList.isFetching && (
            <ListGroup style={{ margin: '16px 0' }}>
              {_.chain(queryList)
                .get('data.data', [])
                // @ts-ignore
                .map((item: IGist) => (
                  <ListGroup.Item
                    style={{ cursor: 'pointer' }}
                    key={item.id}
                    type={
                      selectedGist && selectedGist.id === item.id
                        ? 'primary'
                        : settings.gistId === item.id
                        ? 'secondary'
                        : undefined
                    }
                    onClick={() => handleSelectGist(item)}
                  >
                    <div>{item.description}</div>
                    <div
                      className="file-info"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <div style={{ flexGrow: 1, marginRight: 8 }}>
                        <DropdownButton
                          size="sm"
                          as={ButtonGroup}
                          type="secondary"
                          title="files"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {_.chain(item.files)
                            .keys()
                            .map((innerFilename) => (
                              <Dropdown.Item style={{ cursor: 'default' }} key={innerFilename}>
                                {innerFilename}
                              </Dropdown.Item>
                            ))
                            .value()}
                        </DropdownButton>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Badge bg="link" style={{ marginBottom: 8 }}>
                          {t('createdAt')}
                          {dayjs(item.created_at).format(t('dateFormat'))}
                        </Badge>
                        <Badge bg="link">
                          {t('updatedAt')}
                          {dayjs(item.updated_at).format(t('dateFormat'))}
                        </Badge>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
                .value()}
            </ListGroup>
          )}
        </div>
      </Modal>
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
