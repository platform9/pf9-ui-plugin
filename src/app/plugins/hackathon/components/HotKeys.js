import React from 'react'
import PropTypes from 'prop-types'

const keyMap = {
  ' ': 'move',
  'c': 'create',
  'd': 'delete',
  'e': 'edit',
  'a': 'select',
  't': 'text',
  'v': 'move',
  'w': 'wire',
  'Delete': 'delete',
}

class HotKeys extends React.Component {
  state = {
    previousTool: null,
  }

  handleKeyDown = e => {
    if (e.target.tagName.toUpperCase() === 'INPUT') { return }

    const { onToolChange, selectedTool } = this.props

    // Stop the page from scrolling when space is pressed
    if (e.key === ' ') {
      e.preventDefault()
    }

    // We only care when the key is first pressed.  The browser
    // will send repeat keydown events while the key is pressed.
    if (e.repeat) { return }

    // Spacebar is a temporary tool.  It reverts back to previous tool.
    if (e.key === ' ') {
      this.setState({ previousTool: selectedTool })
    }

    const tool = keyMap[e.key]
    if (!tool) { return }

    onToolChange(tool)
  }

  handleKeyUp = e => {
    // Revert back to previous tool when spacebar is released.
    if (e.key === ' ' && this.state.previousTool) {
      this.props.onToolChange(this.state.previousTool)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.handleKeyDown)
    document.addEventListener('keyup', this.handleKeyUp)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown)
    document.removeEventListener('keyup', this.handleKeyUp)
  }

  render = () => this.props.children
}

HotKeys.propTypes = {
  selectedTool: PropTypes.string.isRequired,
  onToolChange: PropTypes.func.isRequired,
}

export default HotKeys
