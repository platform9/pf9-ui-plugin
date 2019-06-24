import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import Pod from './Pod'
import uuid from 'uuid'
import { omit } from 'ramda'

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
    const _input = omit(['apiVersion', 'kind'], input)

    const deploymentUuid = uuid.v4()

    // Create pods equal to the number of replicas specified with owner reference
    for (let i = 0; i < _input.spec.replicas; i++) {
      Pod.create({
        data: {
          metadata: {
            name: `${_input.metadata.name}-${uuid.v4()}`,
            namespace: _input.namespace,
            ownerReferences: [{ name: _input.metadata.name, uid: deploymentUuid }]
          }
        },
        context,
        config: {
          clusterId: _input.clusterId,
          namespace: _input.namespace
        }
      })
    }

    return { ..._input, name: _input.metadata.name, uuid: deploymentUuid, metadata: { ..._input.metadata, namespace: _input.namespace, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (deployments) => {
    return deployments.map((deployment) => {
      const newDeployment = { ...deployment, metadata: { ...deployment.metadata, uid: deployment.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newDeployment)
    })
  }
}

const Deployment = createModel(options)

export default Deployment
