export function hexToRGBA (hex = '', alpha = 1) {
  if (!hex.includes('#') || !hex.length || hex.length > 7) {
    console.error('invalid hex provided')
  }
  if (hex.length === 4) {
    hex += hex.slice(1) // make it a 6 char hex
  }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
