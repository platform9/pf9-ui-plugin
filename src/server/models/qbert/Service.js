import createModel from '../createModel'
import { getCurrentTime } from '../../util'

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
  mappingFn: (input, context) => {
    return { ...input, metadata: { ...input.metadata, name: input.name, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (services) => {
    return services.map((service) => {
      const newService = { ...service, metadata: { ...service.metadata, uid: service.uuid } }
      delete newService.name
      delete newService.uuid
      return newService
    })
  }
}

const Service = createModel(options)

export default Service
