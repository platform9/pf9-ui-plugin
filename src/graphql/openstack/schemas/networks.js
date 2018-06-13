import typeDefs from '../schemas/Network.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    networks: (_, __, context) => context.getNetworks(),
  },

  Mutation: {
    createNetwork: (_, args, context) => context.createNetwork(args),
    removeNetwork: (_, { id }, context) => context.removeNetwork(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
