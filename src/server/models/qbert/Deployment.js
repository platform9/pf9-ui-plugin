import createModel from '../createModel'
import { getCurrentTime } from '../../util'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'deployments',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      creationTimestamp: '',
      labels: {},
      name: '',
      namespace: '',
      resourceVersion: '10',
      uid: '',
    },
    spec: {},
    status: {},
    name: '', // For easy access, will be returned in metadata for API response
  },
  mappingFn: (input, context) => {
    return { ...input, metadata: { ...input.metadata, name: input.name, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (deployments) => {
    return deployments.map((deployment) => {
      const newDeployment = { ...deployment, metadata: { ...deployment.metadata, uid: deployment.uuid } }
      delete newDeployment.name
      delete newDeployment.uuid
      return newDeployment
    })
  }
}

const Deployment = createModel(options)

export default Deployment
