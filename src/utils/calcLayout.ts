import type { Setting } from '@/types/setting.type'
import _ from 'lodash'

import update from 'lodash/fp/update'

const blockStyle = {
  blockPadding: 16,
  linkMargin: 8,
  blockMargin: 8,
}

export function calcLayout(inputSettings: Setting) {
  const blockElements = document.querySelectorAll(`.block-content`)
  let newSettings = inputSettings

  for (let i = 0; i < blockElements.length; i++) {
    if (i >= newSettings.links.length) {
      break
    }

    const blockElem = blockElements[i] as HTMLDivElement
    const headerElem = blockElem.previousSibling as HTMLDivElement
    const headerHeight = headerElem?.offsetHeight || 0
    const linkSize = blockElem.children!.length
    const linkHeight = _.chain(blockElem.children)
      .map((item) => {
        return (item as HTMLElement).offsetHeight
      })
      .reduce((memo, cur) => {
        return memo + cur
      }, 0)
      .value()

    newSettings = update(`links[${i}]`)((blockItem) => {
      const newH = (linkHeight
        + (linkSize! - 1) * blockStyle.linkMargin
        + blockStyle.blockPadding * 2
        + blockStyle.blockMargin * 2
        + headerHeight!)
      / 4

      const newLayout = { ...blockItem.layout, h: newH }
      const newLayouts = blockItem.layouts ? { ...blockItem.layouts } : undefined

      if (newLayouts) {
        Object.keys(newLayouts).forEach((key) => {
          if (newLayouts[key].w === newLayout.w) {
            newLayouts[key] = { ...newLayouts[key], h: newH }
          }
        })
      }

      return {
        ...blockItem,
        layout: newLayout,
        layouts: newLayouts,
      }
    })(newSettings)
  }

  return newSettings
}
