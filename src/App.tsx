import type { Layout } from 'react-grid-layout'
import type { Block as IBlock } from './types/setting.type'
import classNames from 'classnames'
import set from 'lodash/fp/set'
import { useCallback, useContext, useEffect, useState } from 'react'

import GridLayout from 'react-grid-layout'
import Button from './components/LinkButton'
import Spin from './components/Spin'
import SettingsContext from './context/settings.context'
import Block from './partials/Block'
import EditModal from './partials/Block/EditModal'
import Header from './partials/Header'
import { gid } from './utils/gid'

declare global {
  interface Window {
    initialTime: number
  }
}

const GRID_WIDTH = 1200 // 固定宽度，1240px - 40px (px-5 左右各20px)

function App() {
  const { settings, updateSettings } = useContext(SettingsContext)
  const [editable, toggleEditable] = useState(false)
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | undefined>()
  const layouts = (settings || {}).links?.map(item => item.layout) || []
  const [firstBlock, setFirstBlockData] = useState<IBlock>({} as IBlock)
  const [fistBlockVisible, toggleFirstBlockVisible] = useState(false)

  useEffect(() => {
    window.initialTime = new Date().getTime()
  }, [])

  useEffect(() => {
    if (editable) {
      document.body.classList.add('editable')
    }
    else {
      document.body.classList.remove('editable')
    }
  }, [editable])

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      const newLinks = settings.links.map((item) => {
        const layoutItem = layout.find(l => l.i === item.id)
        return { ...item, layout: layoutItem || item.layout }
      })

      const newSettings = {
        ...settings,
        links: newLinks,
      }

      updateSettings(newSettings)
    },
    [settings, updateSettings],
  )

  const handleToggleEditable = useCallback(() => {
    toggleEditable(!editable)
  }, [editable])

  const handleSetActiveBlockIndex = useCallback((index: number) => {
    setActiveBlockIndex(index)
  }, [])

  const handleCreateFirstBlock = useCallback(() => {
    toggleEditable(true)
    toggleFirstBlockVisible(true)
    const id = gid()
    setFirstBlockData({
      id,
      title: '',
      buttons: [],
      layout: {
        w: 2,
        h: 8,
        x: 0,
        y: 0,
        i: id,
      },
    })
  }, [])

  const handleSaveFirstBlock = useCallback(() => {
    updateSettings(set(`links[0]`)(firstBlock)(settings))
  }, [updateSettings, firstBlock, settings])

  const handleBlockChange = useCallback(
    (field: string) => (value: string | number | undefined | any[]) => {
      setFirstBlockData(set(field)(value)(firstBlock))
    },
    [firstBlock],
  )

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin spinning />
      </div>
    )
  }

  const links = settings.links.map((item, index) => {
    return (
      <div
        key={item.id}
        className={classNames({
          'blockActive': activeBlockIndex === index,
          'z-10': activeBlockIndex === index,
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
    )
  })

  return (
    <div
      className={classNames('main w-full max-w-[1240px] px-5 mt-4 [&_.editBtn]:leading-none [&_.editBtn_button]:px-[0.4rem]', {
        editable,
      })}
    >
      <Header onEdit={handleToggleEditable} editable={editable} />
      {links.length
        ? (
            <GridLayout
              className="layout my-12"
              layout={layouts}
              cols={12}
              rowHeight={4}
              width={GRID_WIDTH}
              margin={[0, 0]}
              onLayoutChange={handleLayoutChange}
              draggableHandle=".block-header"
              isResizable={editable}
              isDraggable={editable}
              isDroppable={editable}
              resizeHandles={['e', 'w']}
            >
              {links}
            </GridLayout>
          )
        : (
            <div className="flex items-center justify-center h-[80vh]">
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
    </div>
  )
}

export default App
