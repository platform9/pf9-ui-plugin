import typeDefs from './Volume.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    volumes: (_, __, context) => context.getVolumes(),
    volume: (obj, args, context) => context.getVolume(args.id),
    volumeTypes: (_, __, context) => context.getVolumeTypes()
  },

  Mutation: {
    createVolume: (obj, args, context) => context.createVolume(args),
    updateVolume: (obj, { id, input }, context) => context.updateVolume(id, input),
    removeVolume: (obj, { id }, context) => context.removeVolume(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
