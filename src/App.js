import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import GridLayout from 'react-grid-layout';
import classNames from 'classnames';
import { Octokit } from '@octokit/rest';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import { set } from 'lodash/fp';
const queryClient = new QueryClient();
import { Toast, ToastContainer, Button } from 'react-bootstrap';
import styled from 'styled-components';
import BarLoader from 'react-spinners/BarLoader';

import useStorage from './hooks/useStorage';
import Header from './partials/Header';
import Block from './partials/Block';
import useSettings from './hooks/useSettings';
import SettingsContext from './context/settings.context';
import * as gistService from './service/gist';
import { FILE_NAME, GIST_DESCRIPTION } from './constant';
import parseGistContent from './utils/parseGistContent';
import EditModal from './partials/Block/EditModal';
import { uuid } from './utils';
import GlobalStyle from './globalStyle';
import AppStyle from './AppStyle';

const Grid = styled(GridLayout)`
  margin: 48px 0;
`;

function App() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [editable, toggleEditable] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState('');
  const layouts = _.chain(settings)
    .get('links')
    .map((item) => item.layout)
    .value();
  const [firstBlock, setFirstBlockData] = useState('');
  const [fistBlockVisible, toggleFirstBlockVisible] = useState(false);

  const handleLayoutChange = useCallback(
    (layout) => {
      if (Date.now() - window.initialTime < 1000) {
        console.log('Should not update settings');
        return;
      }
      const newLinks = settings.links.map((item, index) => {
        return { ...item, layout: layout[index] };
      });

      const newSettings = {
        ...settings,
        links: newLinks,
      };

      newSettings.createdAt = new Date().getTime();
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sync-upload'));
      }, 1000);

      updateSettings(newSettings);
    },
    [settings, updateSettings],
  );

  const handleToggleEditable = () => {
    toggleEditable(!editable);
  };

  const handleSetActiveBlockIndex = (index) => {
    setActiveBlockIndex(index);
  };

  const handleCreateFirstBlock = useCallback(() => {
    toggleEditable(true);
    toggleFirstBlockVisible(true);
    setFirstBlockData({
      id: uuid(),
      title: '',
      buttons: [],
      layout: {
        w: 2,
        h: 8,
        x: 0,
        y: 0,
      },
    });
  }, []);

  const handleSaveFirstBlock = useCallback(() => {
    updateSettings(set(`links[0]`)(firstBlock)(settings));
  }, [updateSettings, firstBlock, settings]);

  const handleBlockChange = useCallback(
    (field) => (value) => {
      setFirstBlockData(set(field)(value)(firstBlock));
    },
    [firstBlock],
  );

  if (!settings) {
    return (
      <div className="spinner">
        <BarLoader />
      </div>
    );
  }

  const links = settings.links.map((item, index) => {
    return (
      <div key={item.id}>
        <div
          data-grid={item.layout}
          className={classNames('block-wrap', {
            blockActive: activeBlockIndex === index,
          })}
        >
          <Block
            editable={editable}
            settings={settings}
            updateSettings={updateSettings}
            block={item}
            index={index}
            onMenuClick={handleSetActiveBlockIndex}
          />
        </div>
      </div>
    );
  });

  return (
    <AppStyle
      className={classNames('main', {
        editable,
      })}
    >
      <Header onEdit={handleToggleEditable} editable={editable} />
      {links.length ? (
        <Grid
          layout={layouts}
          draggableHandle=".card-header"
          isResizable={editable}
          isDraggable={editable}
          isDroppable={editable}
          onLayoutChange={handleLayoutChange}
          className="layout"
          cols={12}
          rowHeight={4}
          width={1200}
          margin={[0, 0]}
          resizeHandles={['e', 'w']}
        >
          {links}
        </Grid>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '80vh',
          }}
        >
          <Button size="lg" onClick={handleCreateFirstBlock}>
            Create first block
          </Button>
          <EditModal
            data={firstBlock}
            onChange={handleBlockChange}
            onSave={handleSaveFirstBlock}
            type="block"
            visible={fistBlockVisible}
            onClose={() => toggleFirstBlockVisible(false)}
          />
        </div>
      )}
    </AppStyle>
  );
}

function withOauth(Comp) {
  return function OauthWrapper(props) {
    const [accessToken, setAccessToken] = useStorage('accessToken');
    const [settings, updateSettings] = useSettings();
    const gistId = _.get(settings, `gistId`);

    useEffect(() => {
      window.initialTime = new Date().getTime();
    }, []);

    const value = useMemo(() => {
      return {
        updateSettings,
        settings,
        accessToken,
        updateAccessToken: setAccessToken,
      };
    }, [updateSettings, settings, accessToken, setAccessToken]);

    useEffect(() => {
      if (accessToken) {
        gistService.setOctokit(
          new Octokit({
            auth: accessToken,
          }),
        );

        return () => {
          gistService.destroyOctokit();
        };
      }
    }, [accessToken]);

    const updateMutation = useMutation(gistService.updateGist, {
      enabled: !!gistId && !!accessToken,
    });
    const [successToastVisible, toggleSuccessToastVisible] = useState(false);
    const [errorToastVisible, toggleErrorToastVisible] = useState(false);
    useEffect(() => {
      if (updateMutation.isSuccess) {
        toggleSuccessToastVisible(true);
      }
    }, [updateMutation.isSuccess]);
    useEffect(() => {
      if (updateMutation.isError) {
        toggleErrorToastVisible(true);
      }
    }, [updateMutation.isError]);

    const queryOne = useQuery(['gist', gistId], gistService.fetchOne, {
      enabled: !!gistId,
      initialData: {},
    });

    const settingsContent = parseGistContent(_.get(queryOne, 'data.data'));

    // 上传gist
    const handleUploadGist = useCallback(() => {
      if (!settings || !_.get(settings, 'gistId')) {
        return;
      }

      if (settingsContent && settingsContent.createdAt > settings.createdAt) {
        return;
      }

      updateMutation.mutate({
        gist_id: _.get(settings, 'gistId'),
        public: false,
        description: GIST_DESCRIPTION,
        files: {
          [FILE_NAME]: {
            content: JSON.stringify(settings),
          },
        },
      });
    }, [settings, settingsContent, updateMutation]);

    useEffect(() => {
      if (queryOne.status === 'success' && settingsContent?.createdAt > settings?.createdAt) {
        updateSettings(settingsContent);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryOne.status, settings?.createdAt, settingsContent]);

    useEffect(() => {
      document.addEventListener('sync-upload', handleUploadGist);

      return () => {
        document.removeEventListener('sync-upload', handleUploadGist);
      };
    }, [handleUploadGist]);

    const toastStyle = {
      width: 'auto',
    };

    return (
      <SettingsContext.Provider value={value}>
        <Comp {...props} />
        <ToastContainer
          position="bottom-end-2"
          style={{ color: '#fff', right: 10, bottom: 10 }}
          containerPosition="fixed"
        >
          <Toast autohide style={toastStyle} show={updateMutation.isLoading || queryOne.isLoading}>
            <Toast.Body>
              <BarLoader />
            </Toast.Body>
          </Toast>
          <Toast
            autohide
            style={toastStyle}
            bg="success"
            delay={2000}
            show={successToastVisible}
            onClose={() => toggleSuccessToastVisible(false)}
          >
            <Toast.Body>Upload success</Toast.Body>
          </Toast>
          <Toast
            autohide
            style={toastStyle}
            bg="danger"
            delay={5000}
            show={errorToastVisible}
            onClose={() => toggleErrorToastVisible(false)}
          >
            <Toast.Header closeButton={false}>Upload failed</Toast.Header>
            <Toast.Body>{updateMutation.error?.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </SettingsContext.Provider>
    );
  };
}

function withQuery(Component) {
  return function QueryWrapped(props) {
    return (
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <Component {...props} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  };
}

export default hot(withQuery(withOauth(App)));
