/* eslint-disable no-unused-vars */
import context from '../../../context'
import Pod from '../../../models/qbert/Pod'

export const getPods = (req, res) => {
  const pods = Pod.list(context)
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
  const pod = { ...req.body }

  if (pod.kind !== 'Pod') {
    return res.status(400).send({code: 400, message: 'Must be of kind "Pod"'})
  }
  if (Pod.findByName(pod.metadata.name)) {
    return res.status(409).send({code: 409, message: `pods #{pod.metadata.name} already exists`})
  }

  if (pod.apiVersion) { delete pod.apiVersion }
  if (pod.kind) { delete pod.kind }
  const newPod = Pod.create(pod, context)
  res.status(201).send(newPod)
}

export const deletePod = (req, res) => {
  // TODO: account for tenancy
  const { podId, tenantId } = req.params
  console.log('Attempting to delete podId: ', podId)
  // this should throw an error if it doesn't exist
  Pod.delete(podId, context)
  res.status(200).send({})
}
