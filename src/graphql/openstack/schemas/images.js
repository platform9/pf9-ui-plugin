import typeDefs from './Image.graphql'
import makeExecutableSchema from 'graphql-tools'

const resolvers = {
  Query: {
    images: (_, __, context) => context.getImages()
  },
  Mutation: {
    updateImage: (obj, { id, input }, context) => context.updateImage(id, input),
    removeImage: (obj, { id }, context) => context.removeImage(id)
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
