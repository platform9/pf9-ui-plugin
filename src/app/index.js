import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { Provider } from 'react-redux'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import App from './App'
import store from './store'

import plugins from './plugins'
import pluginManager from './core/pluginManager'
import PluginProvider from './core/PluginProvider'
import { getStorage } from './core/common/pf9-storage'

import { mergeSchemas } from 'graphql-tools'

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const mergedSchemas = mergeSchemas({
  schemas: pluginManager.getSchemas()
})

const client = new ApolloClient({
  uri: 'http://localhost:4444/graphql',
  clientState: {
    ...mergedSchemas,
  },
  request: async op =>
    op.setContext({
      headers: {
        'x-auth-token': getStorage('scopedToken') || getStorage('unscopedToken'),
      }
    })
})

const render = Component => {
  ReactDOM.render(
    <ApolloProvider client={client}>
      <Provider store={store}>
        <AppContainer>
          <div>
            <PluginProvider pluginManager={pluginManager}>
              <Component />
            </PluginProvider>
          </div>
        </AppContainer>
      </Provider>
    </ApolloProvider>,
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
