import { makeExecutableSchema } from 'graphql-tools'
import k8TypeDefs from './k8TypeDefs.graphql'

const k8Resolvers = {
  Query: {
    K8Clusters: () => [
    ],
  },
}

const k8Schema = makeExecutableSchema({
  typeDefs: k8TypeDefs,
  resolvers: k8Resolvers,
})

export default k8Schema
