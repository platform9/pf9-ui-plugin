import context from '../../../context'
import Pod from '../../../models/qbert/Pod'

export const getPods = (req, res) => {
  const { namespace, clusterId } = req.params
  const pods = Pod.list({ context, config: { clusterId, namespace } })
  const response = {
    apiVersion: 'v1',
    items: pods,
    kind: 'PodList',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/pods'
    }
  }
  return res.send(response)
}

export const postPod = (req, res) => {
  const { namespace, clusterId } = req.params
  const pod = { ...req.body }

  if (pod.kind !== 'Pod') {
    return res.status(400).send({code: 400, message: 'Must be of kind "Pod"'})
  }
  if (Pod.findByName(pod.metadata.name)) {
    return res.status(409).send({code: 409, message: `pods #{pod.metadata.name} already exists`})
  }

  const newPod = Pod.create({ data: pod, context, config: {clusterId, namespace} })
  res.status(201).send(newPod)
}

export const deletePod = (req, res) => {
  // TODO: account for tenancy
  const { podName, clusterId, namespace } = req.params
  console.log('Attempting to delete podName: ', podName)
  const pod = Pod.findByName({ name: podName, context, config: {clusterId, namespace} })
  // this should throw an error if it doesn't exist
  if (!pod) {
    res.status(404).send({code: 404, message: 'pod not found'})
  }

  // Set status to Running after some time
  setTimeout(() => {
    console.log(`Deleting pod #{pod.metadata.uid}`)
    Pod.delete(pod.metadata.uid, context)
  }, 30000)

  res.status(200).send(pod)
}
