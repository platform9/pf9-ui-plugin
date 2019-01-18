import context from '../../../context'
import Deployment from '../../../models/qbert/Deployment'

export const getDeployments = (req, res) => {
  const { namespace, clusterId } = req.params
  const deployments = Deployment.list({ context, config: { clusterId, namespace } })
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
  const { namespace, clusterId } = req.params
  const deployment = { ...req.body }

  if (deployment.kind !== 'Deployment') {
    return res.status(400).send({code: 400, message: 'Must be of kind "Deployment"'})
  }
  if (Deployment.findByName({ name: deployment.metadata.name, context, config: { namespace, clusterId } })) {
    return res.status(409).send({code: 409, message: `deployments ${deployment.metadata.name} already exists`})
  }

  const newDeployment = Deployment.create({ data: deployment, context, config: { clusterId, namespace } })
  res.status(201).send(newDeployment)
}

// Don't need to implement deletion yet, UI does not allow this action
// export const deleteDeployment = (req, res) => {
//   const { deploymentName, clusterId, namespace } = req.params
//   console.log('Attempting to delete deploymentName: ', deploymentName)
//   const deployment = Deployment.findByName({ name: deploymentName, context, config: { clusterId, namespace } })
//   // this should throw an error if it doesn't exist
//   if (!deployment) {
//     res.status(404).send({code: 404, message: 'deployment not found'})
//   }
//   Deployment.delete(deployment.metadata.uid, context)
//   res.status(200).send({})
// }
