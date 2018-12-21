import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'storageClasses',
  uniqueIdentifier: 'uuid',
  defaults: {
    metadata: {
      annotations: {
        'storageclass.kubernetes.io/is-default-class': 'false'
      },
      creationTimestamp: '',
      labels: {},
      name: '',
      resourceVersion: '10',
      uid: '',
    },
    parameters: {
      type: 'gp2'
    },
    provisioner: 'kubernetes.io/aws-ebs',
    name: '', // For easy access, will be returned in metadata for API response
  },
  createFn: (input, context) => {
    const _input = omit(['apiVersion', 'kind'], input)
    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (storageClasses) => {
    return storageClasses.map((storageClass) => {
      const newStorageClass = { ...storageClass, metadata: { ...storageClass.metadata, uid: storageClass.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newStorageClass)
    })
  }
}

const StorageClass = createModel(options)

export default StorageClass
