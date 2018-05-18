import { graphqlExpress } from 'apollo-server-express'
import expressPlayground from 'graphql-playground-middleware-express'
import bodyParser from 'body-parser'
import context from './context'
import cors from 'cors'

import schema from '../graphql/openstack'

export const mountGraphql = app => {
  app.use(
    '/graphql',
    cors(),
    bodyParser.json(),
    graphqlExpress(req => ({ schema, context }))
  )

  app.use('/playground', expressPlayground({ endpoint: '/graphql' }))
}
