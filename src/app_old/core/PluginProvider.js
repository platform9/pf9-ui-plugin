import React from 'react'
import PropTypes from 'prop-types'

class PluginProvider extends React.Component {
  getChildContext () {
    return {
      pluginManager: this.props.pluginManager
    }
  }

  render () {
    return this.props.children
  }
}

PluginProvider.childContextTypes = {
  pluginManager: PropTypes.object
}

export default PluginProvider
