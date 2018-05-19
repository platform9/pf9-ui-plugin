import typeDefs from '../schemas/UserManagement.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    tenants (obj, args, context) {
      return context.getTenants()
    },

    users (obj, args, context) {
      return context.getUsers()
    },
  },

  User: {
    tenantRoles (user, args, context) {
      return context.getTenantRoles(user)
    },
  },

  Mutation: {
    removeTenant: (obj, { id }, context) => {
      return context.removeTenant(id)
    }
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default schema
