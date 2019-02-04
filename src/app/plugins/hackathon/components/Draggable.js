import React from 'react'
import PropTypes from 'prop-types'
import parseMouseEvent from '../parseMouseEvent'
import { compose } from 'ramda'
import { withCanvasContext } from './SVGCanvas'

class Draggable extends React.Component {
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
    const { onDrag, x, y } = this.props
    const { buttons } = parseMouseEvent(e)
    if (!buttons.left) { return }
    const dx = e.clientX - this.startX
    const dy = e.clientY - this.startY
    this.startX = e.clientX
    this.startY = e.clientY
    const { scale } = this.props.canvasContext
    const newX = x + dx / scale
    const newY = y + dy / scale
    onDrag({ x: newX, y: newY })
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
    const { children, x, y } = this.props
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

Draggable.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onDrag: PropTypes.func.isRequired,
}

export default compose(
  withCanvasContext,
)(Draggable)
