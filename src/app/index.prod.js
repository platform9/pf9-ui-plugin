import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import plugins from './plugins'

let pluginManager = require('./core/utils/pluginManager').default
plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const render = Component => {
  ReactDOM.render(
    <Component pluginManager={pluginManager} />,
    document.getElementById('root')
  )
}

render(App)
