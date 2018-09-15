import React from 'react'
import ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'

import ApolloClient from 'apollo-boost'
import { ApolloProvider } from 'react-apollo'

import App from './App'

import plugins from './plugins'
import { getStorage } from './core/common/pf9-storage'

import { mergeSchemas } from 'graphql-tools'

let pluginManager = require('./core/pluginManager').default

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
      <AppContainer>
        <div>
          <Component pluginManager={pluginManager} />
        </div>
      </AppContainer>
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
