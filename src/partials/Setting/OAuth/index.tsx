import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import BarLoader from 'react-spinners/BarLoader';
import styled from 'styled-components';

import Card from '@/components/Card';
import Modal from '@/components/Modal';
import SettingsContext from '@/context/settings.context';
import * as gistService from '@/service/gist';
import type { IGist } from '@/types/gist.type';
import { gid } from '@/utils/gid';
import parseGistContent from '@/utils/parseGistContent';

import StyledOauth from './styled';

const SpinnerStyle = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const spinner = (
  <SpinnerStyle>
    <BarLoader />
  </SpinnerStyle>
);

const uuid = gid();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

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
  const queryOne = useQuery(['gist', selectedGist?.id || gistId!], gistService.fetchOne, {
    enabled: !!(selectedGist?.id || gistId) && !!accessToken,
    initialData: null,
  });

  const filename = _.chain(queryOne.data).get(`data.files`).keys().head().value();
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
    if (queryOne.data?.data) {
      updateSettings({
        ...settings,
        // @ts-ignore
        ...parseGistContent(queryOne.data.data!),
        gistId: selectedGist.id,
      });
    }

    toggleGistsModalVisible(false);
  }, [queryOne.data?.data, selectedGist, settings, updateSettings]);

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
    <Form.Group className="mb-3">
      {queryOne.isFetching
        ? spinner
        : !_.isEmpty(queryOne.data) && (
            <Card>
              <Card.Header>{filename}</Card.Header>
              <Card.Body>
                {_.get(queryOne.data, 'data.description')}
                <br />
                <Badge bg="primary">
                  {t('createdAt')}
                  {dayjs(_.get(queryOne.data, 'data.created_at')).format(t('dateFormat'))}
                </Badge>
              </Card.Body>
            </Card>
          )}
    </Form.Group>
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
          <Form.Group className="mb-3">
            <Button variant="link" style={{ width: '100%' }} href={OAUTH_URL} target="_blank">
              {t('createAccessToken')}
            </Button>
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Control
            type="input"
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
        </Form.Group>
        {accessToken && gistNode}
        {accessToken && !queryOne.isFetching && (
          <Form.Group className="mb-3" controlId="url">
            <Row>
              <Col>
                <Button
                  style={{ width: '100%' }}
                  // @ts-ignore
                  disabled={createMutation.isFetching}
                  variant="primary"
                  onClick={handleCreateGist}
                >
                  {t('createGist')}
                </Button>
              </Col>
              <Col>
                <Button style={{ width: '100%' }} variant="secondary" onClick={handleOpenGists}>
                  {t('selectGist')}
                </Button>
              </Col>
            </Row>
          </Form.Group>
        )}
      </Form>
      {/* 選擇已有gist */}
      <Modal visible={gistsModalVisible} onClose={() => toggleGistsModalVisible(false)}>
        <Modal.Header>{t('selectGist')}</Modal.Header>
        <Modal.Body>
          {queryList.isFetching && spinner}
          {!queryList.isFetching && (
            <ListGroup style={{ margin: '16px 0' }}>
              {_.chain(queryList)
                .get('data.data', [])
                // @ts-ignore
                .map((item: IGist) => (
                  <ListGroup.Item
                    style={{ cursor: 'pointer' }}
                    key={item.id}
                    variant={
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
                          variant="secondary"
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
        </Modal.Body>
        <Modal.Footer>
          {!queryList.isFetching && (
            <Button variant="primary" onClick={handleSaveGist} disabled={queryOne.isFetching}>
              {queryOne.isFetching ? t('processing') : t('done')}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      {/* 創建gist */}
      <Modal visible={createGistModalVisible} onClose={handleCloseCreateModal}>
        <Modal.Header>{t('createGist')}</Modal.Header>
        <Modal.Body>
          <Form
            className="gist-form"
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>{t('fileName')}</Form.Label>
              <InputGroup className="mb-3">
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

            <Form.Group className="mb-3" controlId="description">
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
          <Button variant="secondary" onClick={handleCloseCreateModal}>
            {t('close')}
          </Button>
          <Button disabled={createMutation.isLoading} onClick={handleSaveCreateGist}>
            {createMutation.isLoading ? t('processing') : t('done')}
          </Button>
        </Modal.Footer>
      </Modal>
    </StyledOauth>
  );
}
