import typeDefs from './GlanceImage.graphql'
import makeExecutableSchema from 'graphql-tools'

const resolvers = {
  Query: {
    glanceImages: (_, __, context) => context.getGlanceImages()
  },
  Mutation: {
    updateGlanceImage: (obj, { id, input }, context) => context.updateGlanceImage(id, input),
    removeGlanceImage: (obj, { id }, context) => context.removeGlanceImage(id)
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export default schema
