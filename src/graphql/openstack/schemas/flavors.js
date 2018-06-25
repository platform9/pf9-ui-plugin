import typeDefs from './Flavor.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    flavors: (_, __, context) => context.getFlavors(),
    flavor: (_, { id }, context) => context.getFlavor(id)
  },

  Mutation: {
    createFlavor: (_, args, context) => context.createFlavor(args),
    updateFlavor: (_, { id, input }, context) => context.updateFlavor(id, input),
    removeFlavor: (_, { id }, context) => context.removeFlavor(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
