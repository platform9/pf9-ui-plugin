import typeDefs from './Network.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    networks: (_, __, context) => context.getNetworks(),
    network: (_, { id }, context) => context.getNetwork(id)
  },

  Mutation: {
    createNetwork: (_, args, context) => context.createNetwork(args),
    updateNetwork: (_, { id, input }, context) => context.updateNetwork(id, input),
    removeNetwork: (_, { id }, context) => context.removeNetwork(id)
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
