import { Button, Form, ListGroup, Col, Row, Badge, Toast, Alert, Card } from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { set, get, map } from 'lodash/fp';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from 'react-query';
import _ from 'lodash';
import BarLoader from 'react-spinners/BarLoader';
import { v4 as uuid4 } from 'uuid';

import Modal from '../Modal';
import styles from './index.less';
import SettingsContext from '../../context/settings.context';
import * as gistService from '../../service/gist';
import * as candiService from '../../service/candi';
import parseGistContent from '../../utils/parseGistContent';

const spinner = (
  <div style={{ width: '100%', height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <BarLoader />
  </div>
);

const OAUTH_URL = `https://github.com/login/oauth/authorize?scope=gist&client_id=9f776027a79806fc1363&redirect_uri=https://candi-tab.vercel.app/api/github?uuid=${uuid4()}`;

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
  const queryToken = useQuery('access-token', candiService.fetchToken, {
    enabled: isStartFetchToken,
    retry: 10,
    onSuccess: (data) => {
      toggleStartFetchToken(false);
    },
  });

  const createTokenNode = accessToken ? null : (
    <Button variant="link" style={{ width: '100%' }} href={OAUTH_URL} onClick={handleOauthStart} target="_blank">
      Create Access Token with github OAuth
    </Button>
  );

  const handleCreateGist = useCallback(() => {
    createMutation.mutate(settings);
  }, [createMutation, settings]);

  const gistId = useRef(_.get(settings, `gistId`));

  const queryOne = useQuery(['gist', gistId.current], gistService.fetchOne, {
    initialData: settings.gist,
    enabled: !!gistId.current,
  });
  const { data, isLoading } = queryOne;

  const handleClose = useCallback(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, onClose, settings]);

  const createMutation = useMutation(gistService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('gist');
      console.log('Create success!');
    },
  });

  useEffect(() => {
    if (createMutation.status === 'success') {
      updateSettings({
        ...settings,
        gistId: _.get(createMutation, 'data.data.id'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createMutation, settings]);

  const filename = _.chain(data).get(`data.files`).keys().head().value();

  const gistNode = (
    <Form.Group className="mb-3">
      {isLoading
        ? spinner
        : data && (
            <Card border="primary">
              <Card.Header>{filename}</Card.Header>
              <Card.Body>
                {_.get(data, 'data.description')}
                <br />
                <Badge bg="secondary">@{_.get(data, 'data.created_at')}</Badge>
              </Card.Body>
            </Card>
          )}
    </Form.Group>
  );

  const [gistsModalVisible, toggleGistsModalVisible] = useState(false);
  const [selectedGist, setGist] = useState(null);
  const handleOpenGists = useCallback(() => {
    toggleGistsModalVisible(true);
  }, [toggleGistsModalVisible]);
  const queryList = useQuery('gists', gistService.fetchAll, {
    enabled: gistsModalVisible,
  });
  const handleSelectGist = useCallback((gist) => {
    gistId.current = gist.id;
    setGist(gist);
  }, []);
  const handleSaveGist = useCallback(() => {
    if (data.data) {
      updateSettings({
        ...settings,
        ...parseGistContent(data.data),
        gistId: selectedGist.id,
      });
    } else {
      updateSettings({
        ...settings,
        gistId: selectedGist.id,
      });
    }

    toggleGistsModalVisible(false);
  }, [data?.data, selectedGist?.id, settings, updateSettings]);

  return (
    <>
      <Modal visible={visible} onClose={handleClose}>
        <Modal.Header>Syncing with github gist</Modal.Header>
        <Modal.Body className={styles.oauthModalContent}>
          <Form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              return;
            }}
          >
            <Form.Group className="mb-3">{createTokenNode}</Form.Group>

            {queryToken.isLoading && <Alert variant="primary">Waiting for github access token...</Alert>}

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
            {accessToken && !isLoading && (
              <Form.Group className="mb-3" controlId="url">
                <Row>
                  <Col>
                    <Button style={{ width: '100%' }} variant="primary" onClick={handleCreateGist}>
                      Create a new gist
                    </Button>
                  </Col>
                  <Col>
                    <Button style={{ width: '100%' }} variant="secondary" onClick={handleOpenGists}>
                      Select a existing gist.
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
      </Modal>
      <Modal visible={gistsModalVisible} onClose={() => toggleGistsModalVisible(false)}>
        <Modal.Header>Select an existing gist from your gists</Modal.Header>
        <Modal.Body>
          {queryList.isLoading && spinner}
          <ListGroup style={{ margin: '16px 0' }}>
            {_.chain(queryList)
              .get('data.data')
              .map((item) => (
                <ListGroup.Item
                  style={{ cursor: 'pointer' }}
                  key={item.id}
                  variant={settings.gistId === item.id ? 'primary' : null}
                  onClick={() => handleSelectGist(item)}
                  active={selectedGist && selectedGist.id === item.id}
                >
                  {item.description}
                  <br />
                  {_.chain(item.files)
                    .keys()
                    .map((filename) => (
                      <>
                        <Badge key={filename} bg="primary">
                          {filename}
                        </Badge>
                        <br />
                      </>
                    ))
                    .value()}
                  <br />
                  <Badge bg="secondary">@{item.created_at}</Badge> <Badge bg="info">@{item.updated_at}</Badge>
                </ListGroup.Item>
              ))
              .value()}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          {!queryList.isLoading && (
            <Button variant="primary" onClick={handleSaveGist}>
              Yes
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}
