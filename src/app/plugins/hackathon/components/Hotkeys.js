import React from 'react'
import { compose } from 'ramda'
import { withAppContext } from 'core/AppContext'

const keyMap = {
  ' ': 'move',
  'a': 'add',
  'd': 'delete',
  'e': 'edit',
  's': 'select',
  't': 'text',
  'v': 'move',
  'w': 'wire',
  'Delete': 'delete',
}

const cursorMap = {
  add: 'crosshair',
  delete: 'no-drop',
  edit: 'pointer',
  select: 'default',
  text: 'text',
  move: 'grab',
  wire: 'default',
}

class HotKeys extends React.Component {
  state = {
    previousTool: null,
  }

  handleKeyDown = e => {
    const { context, setContext } = this.props

    // Stop the page from scrolling when space is pressed
    if (e.key === ' ') {
      e.preventDefault()
    }

    // We only care when the key is first pressed.  The browser
    // will send repeat keydown events while the key is pressed.
    if (e.repeat) { return }

    // Spacebar is a temporary tool.  It reverts back to previous tool.
    if (e.key === ' ') {
      this.setState({ previousTool: context.selectedTool })
      setContext({ cursor: 'grab' })
    }

    const tool = keyMap[e.key]
    if (!tool) { return }

    setContext({ selectedTool: tool })
    this.setCursor(tool)
  }

  handleKeyUp = e => {
    // Revert back to previous tool when spacebar is released.
    if (e.key === ' ' && this.state.previousTool) {
      this.props.setContext({ selectedTool: this.state.previousTool })
      this.setCursor(this.state.previousTool)
    }
  }

  setCursor = tool => {
    const cursor = cursorMap[tool]
    if (!cursor) { return }
    this.props.setContext({ cursor })
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

export default compose(
  withAppContext,
)(HotKeys)
