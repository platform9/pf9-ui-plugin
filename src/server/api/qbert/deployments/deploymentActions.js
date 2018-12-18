/* eslint-disable no-unused-vars */
import context from '../../../context'
import Deployment from '../../../models/qbert/deployment'

export const getDeployments = (req, res) => {
  const deployments = Deployment.list(context)
  const response = {
    apiVersion: 'v1',
    items: deployments,
    kind: 'deploymentList',
    metadata: {
      resourceVersion: '5201088',
      selfLink: '/api/v1/deployments'
    }
  }
  return res.send(response)
}

export const postDeployment = (req, res) => {
  const deployment = { ...req.body }

  if (deployment.kind !== 'Deployment') {
    return res.status(400).send({code: 400, message: 'Must be of kind "Deployment"'})
  }
  if (Deployment.findByName(deployment.metadata.name)) {
    return res.status(409).send({code: 409, message: `deployments #{deployment.metadata.name} already exists`})
  }

  const newDeployment = Deployment.create(deployment, context)
  res.status(201).send(newDeployment)
}

// Don't need to implement this yet, UI does not allow this action
export const deleteDeployment = (req, res) => {
  // TODO: account for tenancy
  const { deploymentId, tenantId } = req.params
  console.log('Attempting to delete deploymentId: ', deploymentId)
  // this should throw an error if it doesn't exist
  Deployment.delete(deploymentId, context)
  res.status(200).send({})
}
