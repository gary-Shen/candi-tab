import {
  Button,
  Form,
  ListGroup,
  Col,
  Row,
  Badge,
  Dropdown,
  ButtonGroup,
  DropdownButton,
  Card,
  InputGroup,
} from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { set, get, map } from 'lodash/fp';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import _ from 'lodash';
import BarLoader from 'react-spinners/BarLoader';
import { v4 as uuid4 } from 'uuid';
import dayjs from 'dayjs';

import Modal from '../Modal';
import SettingsContext from '../../context/settings.context';
import * as gistService from '../../service/gist';
import * as candiService from '../../service/candi';
import parseGistContent from '../../utils/parseGistContent';
import StyledWrap from './OAuthStyle';

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

const uuid = uuid4();
const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid}`;

export default function OAuth({ visible, onClose }) {
  const { settings, updateSettings, accessToken, updateAccessToken } = useContext(SettingsContext);
  const [tokenValue, setTokenValue] = useState(accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTokenValue(accessToken);
  }, [accessToken]);

  const handleOnChange = (e) => {
    setTokenValue(e.target.value);
  };

  const handleSave = useCallback(() => {
    updateAccessToken(tokenValue);
  }, [tokenValue, updateAccessToken]);

  /**
   * 开始授权时，创建轮询，直到获取到token
   */
  const [isStartFetchToken, toggleStartFetchToken] = useState(false);
  const handleOauthStart = useCallback(() => {
    toggleStartFetchToken(true);
  }, []);
  // const queryToken = useQuery(['access-token', uuid], candiService.fetchToken, {
  //   enabled: isStartFetchToken,
  //   retry: 10,
  //   onSuccess: (data) => {
  //     toggleStartFetchToken(false);
  //   },
  // });

  const createTokenNode = accessToken ? null : (
    <Button variant="link" style={{ width: '100%' }} href={OAUTH_URL} onClick={handleOauthStart} target="_blank">
      Create Access Token with github OAuth
    </Button>
  );

  /** ========================== 选中gist ========================== */

  const gistId = _.get(settings, `gistId`);

  const [selectedGist, setGist] = useState(null);
  const queryOne = useQuery(['gist', selectedGist?.id || gistId], gistService.fetchOne, {
    initialData: settings.gist,
    enabled: !!(selectedGist?.id || gistId) && !!accessToken,
    initialData: null,
  });

  const handleClose = useCallback(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryOne.data, onClose, settings]);

  const filename = _.chain(queryOne.data).get(`data.files`).keys().head().value();
  const [gistsModalVisible, toggleGistsModalVisible] = useState(false);

  const handleOpenGists = useCallback(() => {
    toggleGistsModalVisible(true);
  }, [toggleGistsModalVisible]);
  const queryList = useQuery(['gists'], gistService.fetchAll, {
    enabled: gistsModalVisible && !!accessToken,
    cacheTime: 0,
    initialData: [],
  });
  const handleSelectGist = useCallback((gist) => {
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
        ...parseGistContent(queryOne.data.data),
        gistId: selectedGist.id,
      });
    }

    toggleGistsModalVisible(false);
  }, [queryOne.data?.data, selectedGist, settings, updateSettings]);

  /** ========================== 选中gist ========================== */

  /** ========================== 创建gist ========================== */
  const createMutation = useMutation(gistService.create, {
    onSuccess: (response) => {
      toggleCreateGistModalVisible(false);
      setGist(response.data);
      updateSettings({
        ...settings,
        gistId: response.data.id,
      });
      setTimeout(() => {
        queryClient.invalidateQueries('gist');
      });
    },
    enabled: !!accessToken,
  });
  const [createGistModalVisible, toggleCreateGistModalVisible] = useState(false);
  const [gistForm, setGistForm] = useState({
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
    (field) => (e) => {
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
            <Card border="primary">
              <Card.Header>{filename}</Card.Header>
              <Card.Body>
                {_.get(queryOne.data, 'data.description')}
                <br />
                <Badge bg="light" text="dark">
                  @{dayjs(_.get(queryOne.data, 'data.created_at')).format('YYYY-MM-DD HH:mm:ss')}
                </Badge>
              </Card.Body>
            </Card>
          )}
    </Form.Group>
  );

  return (
    <StyledWrap>
      <Modal visible={visible} onClose={handleClose}>
        <Modal.Header>Syncing with github gist</Modal.Header>
        <Modal.Body className="oauth-modal-content">
          <Form
            className="oauth-form"
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Form.Group className="mb-3">{createTokenNode}</Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="input"
                placeholder="Paste Access Token here."
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
                      disabled={createMutation.isFetching}
                      variant="primary"
                      onClick={handleCreateGist}
                    >
                      Create a new gist
                    </Button>
                  </Col>
                  <Col>
                    <Button style={{ width: '100%' }} variant="secondary" onClick={handleOpenGists}>
                      Select an existing gist.
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      <Modal visible={gistsModalVisible} onClose={() => toggleGistsModalVisible(false)}>
        <Modal.Header>Select a gist from existing gists</Modal.Header>
        <Modal.Body>
          {queryList.isFetching && spinner}
          {!queryList.isFetching && (
            <ListGroup style={{ margin: '16px 0' }}>
              {_.chain(queryList)
                .get('data.data')
                .map((item) => (
                  <ListGroup.Item
                    style={{ cursor: 'pointer' }}
                    key={item.id}
                    variant={
                      selectedGist && selectedGist.id === item.id
                        ? 'primary'
                        : settings.gistId === item.id
                        ? 'info'
                        : null
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
                          variant="light"
                          title="files"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {_.chain(item.files)
                            .keys()
                            .map((filename) => (
                              <Dropdown.Item style={{ cursor: 'default' }} key={filename}>
                                {filename}
                              </Dropdown.Item>
                            ))
                            .value()}
                        </DropdownButton>
                        {/* <Form.Select
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          {_.chain(item.files)
                            .keys()
                            .slice(0, 3)
                            .map((filename) => <option key={filename}>{filename}</option>)
                            .value()}
                        </Form.Select> */}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Badge bg="light" text="dark" style={{ marginBottom: 8 }}>
                          created@{dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}
                        </Badge>
                        <Badge bg="light" text="dark">
                          updated@{dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')}
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
            <Button variant="primary" onClick={handleSaveGist}>
              Yes
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      <Modal visible={createGistModalVisible} onClose={handleCloseCreateModal}>
        <Modal.Header>Create a gist</Modal.Header>
        <Modal.Body>
          <Form
            className="gist-form"
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Form.Group className="mb-3" controlId="description">
              <Form.Label>File name</Form.Label>
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
              <Form.Label>Description</Form.Label>
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
            Close
          </Button>
          <Button disabled={createMutation.isLoading} onClick={handleSaveCreateGist}>
            {createMutation.isLoading ? 'Processing' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </StyledWrap>
  );
}