import React from 'react'
import parseMouseEvent from '../parseMouseEvent'
import { compose } from 'ramda'
import { withCanvasContext } from './SVGCanvas'

class Draggable extends React.Component {
  state = {
    x: 0,
    y: 0,
  }

  handleMouseDown = e => {
    const { buttons } = parseMouseEvent(e)
    if (buttons.left) {
      e.stopPropagation()
      e.preventDefault()
    }

    this.startX = e.clientX
    this.startY = e.clientY
    this.props.setCanvasContext({ cursor: 'move' })
    document.addEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseMove = e => {
    const { buttons } = parseMouseEvent(e)
    if (!buttons.left) { return }
    const dx = e.clientX - this.startX
    const dy = e.clientY - this.startY
    this.startX = e.clientX
    this.startY = e.clientY
    const { scale } = this.props.canvasContext
    const x = this.state.x + dx / scale
    const y = this.state.y + dy / scale
    this.setState({ x, y })
    if (this.props.onChange) { this.props.onChange({ x, y }) }
  }

  handleMouseUp = e => {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseEnter = e => {
    this.props.setCanvasContext({ cursor: 'move' })
  }

  handleMouseLeave = e => {
    this.props.setCanvasContext({ cursor: 'default' })
  }

  render () {
    const { children } = this.props
    const { x, y } = this.state
    return (
      <g
        transform={`translate(${x}, ${y})`}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {children}
      </g>
    )
  }
}

export default compose(
  withCanvasContext,
)(Draggable)
