import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'clusterRoleBindings',
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
    roleRef: {}, // Role can only be a cluster role
    subjects: [], // Subjects can be keystone users or groups
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (clusterRoleBindings) => {
    return clusterRoleBindings.map((clusterRoleBinding) => {
      const newClusterRoleBinding = { ...clusterRoleBinding, metadata: { ...clusterRoleBinding.metadata, uid: clusterRoleBinding.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newClusterRoleBinding)
    })
  }
}

const ClusterRoleBinding = createModel(options)

export default ClusterRoleBinding
