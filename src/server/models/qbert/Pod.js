import createModel from '../createModel'
import { getCurrentTime } from '../../util'
import { omit } from 'ramda'

// There is a lot of stuff in the real API response, too much to put here...
// Skimming down to what we use in the UI only
const options = {
  dataKey: 'pods',
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
    spec: {},
    status: {
      phase: 'Pending',
      hostIp: '',
    },
    name: '', // For easy access, will be returned in metadata for API response
  },
  // Phase should be 'Pending' when first created
  // After issuing delete it seems that phase stays as 'Running' up until termination (after 30 sec?)
  // in metadata there is a deletionGracePeriodSeconds and a deletionTimestamp
  createFn: (input, context) => {
    // Remove unneeded inputs
    const _input = omit(['apiVersion', 'kind'], input)

    // Set status to Running after some time
    setTimeout(() => {
      // If the context is reset on the server this callback will crash the server.
      // Unforunately we do not have any kind of destructor when resetting the context.
      // Instead we can workaround this by not accessing the pod if it doesn't exist.
      const pod = context.pods.find(x => x.name === _input.metadata.name)
      if (!pod) { return }
      pod.status.phase = 'Running'
    }, 5000)

    return { ..._input, name: _input.metadata.name, metadata: { ..._input.metadata, namespace: _input.namespace, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (pods) => {
    return pods.map((pod) => {
      const newPod = { ...pod, metadata: { ...pod.metadata, uid: pod.uuid } }
      return omit(['name', 'uuid', 'namespace', 'clusterId'], newPod)
    })
  }
}

const Pod = createModel(options)

export default Pod
