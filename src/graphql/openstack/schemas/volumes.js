import typeDefs from './Volume.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    volumes: (_, __, context) => context.getVolumes()
  },

  Mutation: {
    createVolume: (obj, args, context) => context.createVolume(args),
    updateVolume: (obj, { id, input }, context) => context.updateVolume(id, input),
    removeVolume: (obj, { id }, context) => context.removeVolume(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
