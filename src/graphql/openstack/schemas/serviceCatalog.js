import typeDefs from '../schemas/serviceCatalog.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    serviceCatalog (obj, args, context) {
      return context.getServiceCatalog()
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema
