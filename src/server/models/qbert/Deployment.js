import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import Pod from './Pod'
import uuid from 'uuid'

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
  createFn: (input, context) => {
    // Remove unneeded inputs
    if (input.apiVersion) { delete input.apiVersion }
    if (input.kind) { delete input.kind }

    const deploymentUuid = uuid.v4()

    // Create pods equal to the number of replicas specified with owner reference
    for (let i = 0; i < input.spec.replicas; i++) {
      Pod.create({
        data: {
          metadata: {
            name: `${input.metadata.name}-${uuid.v4()}`,
            namespace: input.namespace,
            ownerReferences: [{name: input.metadata.name, uid: deploymentUuid}]
          }
        },
        context,
        config: {
          clusterId: input.clusterId,
          namespace: input.namespace
        }
      })
    }

    return { ...input, name: input.metadata.name, metadata: { ...input.metadata, name: input.metadata.name, namespace: input.namespace, creationTimestamp: getCurrentTime(), uuid: deploymentUuid } }
  },
  loaderFn: (deployments) => {
    return deployments.map((deployment) => {
      const newDeployment = { ...deployment, metadata: { ...deployment.metadata, uid: deployment.uuid } }
      delete newDeployment.name
      delete newDeployment.uuid
      delete newDeployment.namespace
      delete newDeployment.clusterId
      return newDeployment
    })
  }
}

const Deployment = createModel(options)

export default Deployment
