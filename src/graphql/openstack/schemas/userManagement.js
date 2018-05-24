import typeDefs from '../schemas/UserManagement.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    tenants: (_, __, context) => context.getTenants(),
    users: (_, __, context) => context.getUsers(),
  },

  User: {
    tenantRoles: user => context.getTenantRoles(user),
  },

  Mutation: {
    createTenant: (obj, args, context) => context.createTenant(args),
    updateTenant: (obj, { id, input }, context) => context.updateTenant(id, input),
    removeTenant: (obj, { id }, context) => context.removeTenant(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
