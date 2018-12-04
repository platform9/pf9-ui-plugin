import createModel from '../createModel'
import { getCurrentTime } from '../../util'

const options = {
  dataKey: 'namespaces',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      creationTimestamp: '',
      name: '',
      resourceVersion: '10',
      selfLink: '',
      uid: ''
    },
    spec: {
      finalizers: ['kubernetes']
    },
    status: {
      phase: 'Active'
    },
    name: '', // For easy access, will be returned in metadata for API response
  },
  mappingFn: (input, context) => {
    return { ...input, metadata: { ...input.metadata, name: input.name, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (namespaces) => {
    return namespaces.map((namespace) => {
      const newNamespace = { ...namespace, metadata: { ...namespace.metadata, uid: namespace.uuid } }
      delete newNamespace.name
      delete newNamespace.uuid
      return newNamespace
    })
  }
}

const Namespace = createModel(options)

export default Namespace
