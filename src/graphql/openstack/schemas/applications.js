import typeDefs from './Application.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    applications: (_, __, context) => context.getApplications(),
    application: (_, { id }, context) => context.getApplication(id)
  },

  Mutation: {
    createApplication: (_, args, context) => context.createApplication(args),
    updateApplication: (_, { id, input }, context) => context.updateApplication(id, input),
    removeApplication: (_, { id }, context) => context.removeApplication(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
