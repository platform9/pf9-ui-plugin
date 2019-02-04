import React from 'react'
import PropTypes from 'prop-types'
import parseMouseEvent from '../parseMouseEvent'
import { compose } from 'ramda'
import { withCanvasContext } from './SVGCanvas'

class Draggable extends React.Component {
  state = {
    dragging: false,
  }

  handleMouseDown = e => {
    const { buttons } = parseMouseEvent(e)

    if (this.props.selectedTool !== 'move') { return }

    if (buttons.left) {
      e.stopPropagation()
      e.preventDefault()
    }

    this.startX = e.clientX
    this.startY = e.clientY
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
    this.setState({ dragging: true })
  }

  handleMouseUp = e => {
    document.removeEventListener('mousemove', this.handleMouseMove)
  }

  // Might want to change some context (like a status bar) when the component is hovered
  handleMouseEnter = e => {}
  handleMouseLeave = e => {}

  handleClick = e => {
    if (this.state.dragging) {
      this.setState({ dragging: false })
      return
    }
    this.props.onClick && this.props.onClick(e)
  }

  render () {
    const { children, x, y } = this.props
    return (
      <g
        transform={`translate(${x}, ${y})`}
        onClick={this.handleClick}
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
  onClick: PropTypes.func,
  onDrag: PropTypes.func.isRequired,
  selectedTool: PropTypes.string.isRequired,
}

export default compose(
  withCanvasContext,
)(Draggable)
