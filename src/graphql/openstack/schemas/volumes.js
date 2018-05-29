import typeDefs from '../schemas/Volume.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    volumes: (_, __, context) => context.getVolumes()
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
