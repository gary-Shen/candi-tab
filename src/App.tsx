import { Octokit } from '@octokit/rest';
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import classNames from 'classnames';
import _ from 'lodash';
import { set } from 'lodash/fp';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import type { Layout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import { hot } from 'react-hot-loader/root';
import BarLoader from 'react-spinners/BarLoader';
import styled from 'styled-components';
const queryClient = new QueryClient();

import type { SettingsContextType } from './context/settings.context';
import SettingsContext from './context/settings.context';
import GlobalStyle from './GlobalStyle';
import useSettings from './hooks/useSettings';
import useStorage from './hooks/useStorage';
import Block from './partials/Block';
import EditModal from './partials/Block/EditModal';
import Header from './partials/Header';
import * as gistService from './service/gist';
import StyledApp from './styled';
import type { Block as IBlock, Setting } from './types/setting.type';
import { uuid } from './utils';
import parseGistContent from './utils/parseGistContent';

const Grid = styled(GridLayout)`
  margin: 48px 0;
`;

declare global {
  interface Window {
    initialTime: number;
  }
}

function App() {
  const { settings, updateSettings } = useContext(SettingsContext);
  const [editable, toggleEditable] = useState(false);
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | undefined>();
  const layouts = _.chain(settings)
    .get('links')
    .map((item) => item.layout)
    .value();
  const [firstBlock, setFirstBlockData] = useState<IBlock>({} as IBlock);
  const [fistBlockVisible, toggleFirstBlockVisible] = useState(false);

  const handleLayoutChange = _.debounce(
    useCallback(
      (layout: Layout[]) => {
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
    ),
    1000,
  );

  const handleToggleEditable = useCallback(() => {
    toggleEditable(!editable);
  }, [editable]);

  const handleSetActiveBlockIndex = useCallback((index: number) => {
    setActiveBlockIndex(index);
  }, []);

  const handleCreateFirstBlock = useCallback(() => {
    toggleEditable(true);
    toggleFirstBlockVisible(true);
    const id = uuid();
    setFirstBlockData({
      id: id,
      title: '',
      buttons: [],
      layout: {
        w: 2,
        h: 8,
        x: 0,
        y: 0,
        i: id,
      },
    });
  }, []);

  const handleSaveFirstBlock = useCallback(() => {
    updateSettings(set(`links[0]`)(firstBlock)(settings));
  }, [updateSettings, firstBlock, settings]);

  const handleBlockChange = useCallback(
    (field: string) => (value: string | number | undefined | any[]) => {
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
      <div
        key={item.id}
        className={classNames({
          blockActive: activeBlockIndex === index,
        })}
      >
        <div data-grid={item.layout} className={classNames('block-wrap')}>
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
    <StyledApp
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
    </StyledApp>
  );
}

function withOauth<WrapComponentProps>(Comp: React.ComponentType<WrapComponentProps>) {
  return function OauthWrapper(props: WrapComponentProps) {
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
      if (!accessToken) {
        return;
      }

      gistService.setOctokit(
        new Octokit({
          auth: accessToken,
        }),
      );

      return () => {
        gistService.destroyOctokit();
      };
    }, [accessToken]);

    // @ts-ignore
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
    const queryOne = useQuery(['gist', gistId!], gistService.fetchOne, {
      enabled: !!gistId,
      initialData: {} as any,
    });

    const settingsContent = parseGistContent(_.get(queryOne, 'data.data'));
    const fileName = _.chain(queryOne).get('data.data.files').keys().first().value();
    const description = _.get(queryOne, 'data.data.description');

    // 上传gist
    const handleUploadGist = useCallback(() => {
      if (!settings || !_.get(settings, 'gistId')) {
        return;
      }

      if (settingsContent && settingsContent.createdAt > (settings as Setting).createdAt) {
        return;
      }

      updateMutation.mutate({
        gist_id: _.get(settings, 'gistId'),
        public: false,
        description: description,
        files: {
          [fileName]: {
            content: JSON.stringify(settings),
          },
        },
      });
    }, [fileName, description, settings, settingsContent, updateMutation]);

    useEffect(() => {
      if (
        queryOne.status === 'success' &&
        settings &&
        settingsContent?.createdAt > settings?.createdAt &&
        updateSettings
      ) {
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
      <SettingsContext.Provider value={value as NonNullable<SettingsContextType>}>
        <Comp {...props} />
        <ToastContainer
          // @ts-ignore
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
            {/* @ts-ignore */}
            <Toast.Body>{updateMutation.error?.message}</Toast.Body>
          </Toast>
        </ToastContainer>
      </SettingsContext.Provider>
    );
  };
}

function withQuery<WrapComponentProps>(Component: React.ComponentType<WrapComponentProps>) {
  return function QueryWrapped(props: WrapComponentProps) {
    return (
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <Component {...props} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  };
}

const AppWrapper = hot(withQuery(withOauth(App)));

export default AppWrapper;
