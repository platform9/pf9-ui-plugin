import context from '../../../context'
import ClusterRole from '../../../models/qbert/ClusterRole'

export const getClusterRoles = (req, res) => {
  const { clusterId } = req.params
  const clusterRoles = ClusterRole.list({ context, config: { clusterId } })
  const response = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    items: clusterRoles,
    kind: 'ClusterRoleList',
    metadata: {
      resourceVersion: '223011',
      selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterroles'
    }
  }
  return res.send(response)
}

export const postClusterRole = (req, res) => {
  const { clusterId } = req.params
  const clusterRole = { ...req.body }

  if (clusterRole.kind !== 'ClusterRole') {
    return res.status(400).send({ code: 400, message: 'Must be of kind "ClusterRole"' })
  }
  if (ClusterRole.findByName({ name: clusterRole.metadata.name, context, config: { clusterId } })) {
    return res.status(409).send({ code: 409, message: `clusterRole ${clusterRole.metadata.name} already exists` })
  }

  const newClusterRole = ClusterRole.create({ data: clusterRole, context, config: { clusterId } })
  res.status(201).send(newClusterRole)
}

// Todo
// export const putClusterRole = (req, res) => {
//   const { name, clusterId } = req.params
//   const clusterRole = { ...req.body }

//   const existingClusterRole = ClusterRole.findByName({ name, context, config: { clusterId } })
//   if (!existingClusterRole) {
//     return res.status(404).send({ code: 404, message: `clusterRole ${name} does not exist`})
//   }

//   console.log(existingClusterRole)
//   res.status(200).send(existingClusterRole)
// }

export const deleteClusterRole = (req, res) => {
  const { clusterRoleName, clusterId } = req.params
  console.log('Attempting to delete clusterRole: ', clusterRoleName)
  const clusterRole = ClusterRole.findByName({ name: clusterRoleName, context, config: { clusterId } })
  // this should throw an error if it doesn't exist
  if (!clusterRole) {
    res.status(404).send({ code: 404, message: 'clusterRole not found' })
  }
  ClusterRole.delete({ id: clusterRole.metadata.uid, context })
  res.status(200).send(clusterRole)
}
