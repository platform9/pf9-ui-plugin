import { slice } from 'ramda'

export function hexToRgbaCss(hex = '', alpha = 1) {
  const { r, g, b } = hexToRgb(hex)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// From https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
export function hexToRgb(hex) {
  if (!hex) {
    return
  }
  if (!hex.includes('#')) {
    hex = `#${hex}`
  }
  if (![4, 7].includes(hex.length)) {
    console.error('invalid hex provided')
    return
  }
  if (hex.length === 4) {
    hex += hex.slice(1) // make it a 6 char hex
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return {
    r,
    g,
    b,
  }
}

export function rgbToHex(r, g, b) {
  const hexPart = ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b))
    .toString(16)
    .slice(1)
  if (hexPart.substr(0, 3) === hexPart.substr(3, 3)) {
    return `#${hexPart.substr(0, 3)}`
  }
  return (
    '#' + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1)
  )
}
