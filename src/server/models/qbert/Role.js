import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'k8sRoles',
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
    rules: [],
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (roles) => {
    return roles.map((role) => {
      const newRole = { ...role, metadata: { ...role.metadata, uid: role.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newRole)
    })
  }
}

const Role = createModel(options)

export default Role
