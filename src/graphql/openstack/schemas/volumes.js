import typeDefs from '../schemas/Volume.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    volumes (obj, args, context) {
      return context.getVolumes()
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema
