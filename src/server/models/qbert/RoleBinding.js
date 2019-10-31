import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'roleBindings',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      annotations: {
        'rbac.authorization.kubernetes.io/autoupdate': 'true'
      },
      creationTimestamp: '',
      labels: {},
      name: '',
      namespace: '',
      resourceVersion: '144',
      uid: '',
    },
    roleRef: {}, // Role can either be a role or a cluster role
    subjects: [], // Subjects can either be keystone users or groups
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (roleBindings) => {
    return roleBindings.map((roleBinding) => {
      const newRoleBinding = { ...roleBinding, metadata: { ...roleBinding.metadata, uid: roleBinding.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newRoleBinding)
    })
  }
}

const RoleBinding = createModel(options)

export default RoleBinding
