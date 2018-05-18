import typeDefs from '../schemas/Flavor.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    flavors (obj, args, context) {
      return context.getFlavors()
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema
