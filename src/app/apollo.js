import ApolloClient from 'apollo-boost'
import { mergeSchemas } from 'graphql-tools'
import { getStorage } from './core/common/pf9-storage'
import plugins from './plugins'

let pluginManager = require('./core/pluginManager').default

plugins.forEach(plugin => plugin.registerPlugin(pluginManager))

const mergedSchemas = mergeSchemas({
  schemas: pluginManager.getSchemas()
})

export const client = new ApolloClient({
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
