import type { Setting } from '@/types/setting.type'
import _ from 'lodash'

const blockStyle = {
  blockPadding: 16,
  linkMargin: 8,
  blockMargin: 8,
}

export function calcLayout(inputSettings: Setting) {
  /*
   * 修复收起时会影响同一列的block的顺序问题
   * 直接查询dom会导致grid layout渲染顺序变化，改用id查询
   */
  const newSettings = _.cloneDeep(inputSettings)
  for (let i = 0; i < newSettings.links.length; i++) {
    const link = newSettings.links[i]
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

    const newH = (linkHeight
      + (linkSize! - 1) * blockStyle.linkMargin
      + blockStyle.blockPadding * 2
      + blockStyle.blockMargin * 2
      + headerHeight!)
    / 4

    const oldH = link.layout.h
    const deltaH = newH - oldH
    link.layout.h = newH

    const newLayouts = link.layouts ? { ...link.layouts } : undefined
    if (newLayouts) {
      Object.keys(newLayouts).forEach((key) => {
        if (newLayouts[key].w === link.layout.w) {
          newLayouts[key] = { ...newLayouts[key], h: newH }
        }
      })
      link.layouts = newLayouts
    }

    if (Math.abs(deltaH) > 0.001) {
      // Find items below this one in the same column
      // x ranges overlap: (a.x < b.x + b.w) && (a.x + a.w > b.x)
      // and b is below a: b.y >= a.y + a.h_old (roughly)
      // Actually simpler: just checking overlap + y position
      for (let j = 0; j < newSettings.links.length; j++) {
        const other = newSettings.links[j]
        if (other.id === link.id)
          continue

        // Check horizontal overlap
        const isHorizontallyOverlapping = (link.layout.x < other.layout.x + other.layout.w)
          && (link.layout.x + link.layout.w > other.layout.x)

        if (isHorizontallyOverlapping && other.layout.y >= link.layout.y + (oldH * 0.5)) {
          // If strictly below (using a loose check because y is float), shift it
          other.layout.y += deltaH

          if (other.layouts) {
            Object.keys(other.layouts).forEach((key) => {
              if (other.layouts![key].w === other.layout.w) {
                other.layouts![key] = { ...other.layouts![key], y: other.layout.y }
              }
            })
          }
        }
      }
    }
  }

  return newSettings
}
