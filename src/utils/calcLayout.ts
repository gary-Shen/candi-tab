import type { Setting } from '@/types/setting.type'
import _ from 'lodash'

import update from 'lodash/fp/update'

const blockStyle = {
  blockPadding: 16,
  linkMargin: 8,
  blockMargin: 8,
}

export function calcLayout(inputSettings: Setting) {
  let newSettings = inputSettings
  /*
   * 修复收起时会影响同一列的block的顺序问题
   * 直接查询dom会导致grid layout渲染顺序变化，改用id查询
   */
  for (let i = 0; i < inputSettings.links.length; i++) {
    const link = inputSettings.links[i]
    const blockElem = document.querySelector(`.block-content[data-block-id="${link.id}"]`) as HTMLDivElement

    if (!blockElem) {
      continue
    }

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
