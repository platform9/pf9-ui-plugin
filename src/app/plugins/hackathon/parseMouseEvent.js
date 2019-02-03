export const MOUSE_LEFT = 1
export const MOUSE_RIGHT = 2
export const MOUSE_MIDDLE = 4

const parseMouseEvent = e => {
  const buttons = {
    left: !!(e.buttons & 1),
    middle: !!(e.buttons & 4),
    right: !!(e.buttons & 2),
  }
  return { buttons }
}

export default parseMouseEvent
