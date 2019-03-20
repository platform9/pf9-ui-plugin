import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App'
import plugins from './plugins'

// IMPORTANT:
// Any changes to this file must be reflected in index.prod.js as well.
// index.prod.js should be the same as this file but without any development
// modules like react-hot-loader.

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

if (module.hot) {
  module.hot.accept('./App.js', () => {
    setTimeout(() => {
      const NewApp = require('./App.js').default
      render(NewApp)
    }, 1)
  })
}
