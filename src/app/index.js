import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import './bootstrap'
import App from './App'
import plugins from './plugins'

let pluginManager = require('./core/utils/pluginManager').default
plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <Component pluginManager={pluginManager} />
    </AppContainer>,
    document.getElementById('root')
  )
}

render(App)
