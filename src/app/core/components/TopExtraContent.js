import React from 'react'
import ReactDOM from 'react-dom'
import { extraContentId } from 'core/components/Toolbar'

class TopExtraContent extends React.Component {
  render () {
    const { children } = this.props
    const container = document.getElementById(`${extraContentId}`)
    if (!container) {
      return null
    }
    return ReactDOM.createPortal(
      children,
      container,
    )
  }
}

export default TopExtraContent
