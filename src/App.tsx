import classNames from 'classnames';
import set from 'lodash/fp/set';
import { useCallback, useContext, useEffect, useState } from 'react';
import type { Layout } from 'react-grid-layout';
import GridLayout from 'react-grid-layout';
import BarLoader from 'react-spinners/BarLoader';
import styled from 'styled-components';

import Button from './components/LinkButton';
import SettingsContext from './context/settings.context';
import Block from './partials/Block';
import EditModal from './partials/Block/EditModal';
import Header from './partials/Header';
import GlobalStyle from './style/GlobalStyle';
import StyledApp from './styled';
import type { Block as IBlock } from './types/setting.type';
import { gid } from './utils/gid';

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
  const layouts = (settings || {}).links?.map((item) => item.layout) || [];
  const [firstBlock, setFirstBlockData] = useState<IBlock>({} as IBlock);
  const [fistBlockVisible, toggleFirstBlockVisible] = useState(false);

  useEffect(() => {
    window.initialTime = new Date().getTime();
  }, []);

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (Date.now() - window.initialTime < 1000) {
        // eslint-disable-next-line
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

  const handleToggleEditable = useCallback(() => {
    toggleEditable(!editable);
  }, [editable]);

  const handleSetActiveBlockIndex = useCallback((index: number) => {
    setActiveBlockIndex(index);
  }, []);

  const handleCreateFirstBlock = useCallback(() => {
    toggleEditable(true);
    toggleFirstBlockVisible(true);
    const id = gid();
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
      <GlobalStyle editable={editable} />
      <Header onEdit={handleToggleEditable} editable={editable} />
      {links.length ? (
        <Grid
          layout={layouts}
          draggableHandle=".block-header"
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
          <Button onClick={handleCreateFirstBlock}>Create first block</Button>
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

export default App;
