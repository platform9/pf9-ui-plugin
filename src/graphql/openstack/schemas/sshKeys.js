import typeDefs from './SshKey.graphql'
import { makeExecutableSchema } from 'graphql-tools'

const resolvers = {
  Query: {
    sshKeys: (_, __, context) => context.getSshKeys(),
    sshKey: (obj, args, context) => context.getSshKey(args.name),
  },

  Mutation: {
    createSshKey: (obj, args, context) => context.createSshKey(args),
    removeSshKey: (obj, { name }, context) => context.removeSshKey(name),
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
