import typeDefs from './Router.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    routers: (_, __, context) => context.getRouters(),
    router: (_, { id }, context) => context.getRouter(id)
  },

  Mutation: {
    createRouter: (_, args, context) => context.createRouter(args),
    updateRouter: (_, { id, input }, context) => context.updateRouter(id, input),
    removeRouter: (_, { id }, context) => context.removeRouter(id)
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
