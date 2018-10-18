import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App'
import plugins from './plugins'

let pluginManager = require('./core/pluginManager').default
plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const render = Component => {
  ReactDOM.render(
    <AppContainer>
      <div>
        <Component pluginManager={pluginManager} />
      </div>
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
