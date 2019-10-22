import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'clusterRoles',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      annotations: {
        'rbac.authorization.kubernetes.io/autoupdate': 'true'
      },
      creationTimestamp: '',
      labels: {},
      name: '',
      resourceVersion: '144',
      uid: '',
    },
    rules: [],
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (clusterRoles) => {
    return clusterRoles.map((clusterRole) => {
      const newClusterRole = { ...clusterRole, metadata: { ...clusterRole.metadata, uid: clusterRole.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newClusterRole)
    })
  }
}

const ClusterRole = createModel(options)

export default ClusterRole
