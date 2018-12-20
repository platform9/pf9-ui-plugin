import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'services',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      creationTimestamp: '',
      labels: {},
      name: '',
      namespace: '',
      ownerReferences: {},
      resourceVersion: '10',
      uid: '',
    },
    // ports
    // externalName
    // type
    // clusterIp
    spec: {},
    // status.loadBalancer.ingress
    status: {},
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, name: _input.metadata.name, namespace: _input.namespace, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (services) => {
    return services.map((service) => {
      const newService = { ...service, metadata: { ...service.metadata, uid: service.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newService)
    })
  }
}

const Service = createModel(options)

export default Service
