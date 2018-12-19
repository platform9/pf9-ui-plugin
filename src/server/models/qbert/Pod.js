import createModel from '../createModel'
import { getCurrentTime } from '../../util'

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
    if (input.apiVersion) { delete input.apiVersion }
    if (input.kind) { delete input.kind }
    // Set status to Running after some time
    setTimeout(() => {
      const pod = context.pods.find(x => x.name === input.metadata.name)
      pod.status.phase = 'Running'
    }, 5000)

    return { ...input, name: input.metadata.name, metadata: { ...input.metadata, name: input.metadata.name, namespace: input.namespace, creationTimestamp: getCurrentTime() } }
  },
  loaderFn: (pods) => {
    return pods.map((pod) => {
      const newPod = { ...pod, metadata: { ...pod.metadata, uid: pod.uuid } }
      delete newPod.name
      delete newPod.uuid
      delete newPod.namespace
      delete newPod.clusterId
      return newPod
    })
  }
}

const Pod = createModel(options)

export default Pod
