import { parseToRgb } from 'polished'

export function isDark(color: string) {
  if (typeof color !== 'string') {
    return null
  }

  const realColor = parseToRgb(color)
  const hsp = Math.sqrt(
    0.299 * (realColor.red * realColor.red)
    + 0.587 * (realColor.green * realColor.green)
    + 0.114 * (realColor.blue * realColor.blue),
  )
  // return hsp <= 127.5;
  return hsp <= 140
}
