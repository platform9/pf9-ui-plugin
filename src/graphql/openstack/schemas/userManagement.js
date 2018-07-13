import typeDefs from './UserManagement.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    tenants: (_, __, context) => context.getTenants(),
    tenantRoles: user => context.getTenantRoles(user),
    users: (_, __, context) => context.getUsers(),
    user: (obj, args, context) => context.getUser(args.id)
  },

  Mutation: {
    createTenant: (obj, args, context) => context.createTenant(args),
    updateTenant: (obj, { id, input }, context) => context.updateTenant(id, input),
    removeTenant: (obj, { id }, context) => context.removeTenant(id),

    createUser: (obj, args, context) => context.createUser(args),
    updateUser: (obj, { id, input }, context) => context.updateUser(id, input),
    removeUser: (obj, { id }, context) => context.removeUser(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
