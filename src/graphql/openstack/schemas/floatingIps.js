import typeDefs from './FloatingIp.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    floatingIps: (_, __, context) => context.getFloatingIps(),
    floatingIp: (_, { id }, context) => context.getFloatingIp(id)
  },

  Mutation: {
    createFloatingIp: (_, args, context) => context.createFloatingIp(args),
    updateFloatingIp: (_, { id, input }, context) => context.updateFloatingIp(id, input),
    removeFloatingIp: (_, { id }, context) => context.removeFloatingIp(id)
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
