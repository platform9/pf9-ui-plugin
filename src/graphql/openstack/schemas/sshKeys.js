import typeDefs from './SshKey.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    sshKeys: (_, __, context) => context.getSshKeys(),
    sshKey: (obj, args, context) => context.getSshKey(args.id),
  },

  Mutation: {
    createSshKey: (obj, args, context) => context.createSshKey(args),
    removeSshKey: (obj, { id }, context) => context.removeSshKey(id),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
