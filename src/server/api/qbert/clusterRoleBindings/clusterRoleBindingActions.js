import context from '../../../context'
import ClusterRoleBinding from '../../../models/qbert/ClusterRoleBinding'

export const getClusterRoleBindings = (req, res) => {
  const { clusterId } = req.params
  const clusterRoleBindings = ClusterRoleBinding.list({ context, config: { clusterId } })
  const response = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    items: clusterRoleBindings,
    kind: 'ClusterRoleBindingList',
    metadata: {
      resourceVersion: '223011',
      selfLink: '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings'
    }
  }
  return res.send(response)
}

export const postClusterRoleBinding = (req, res) => {
  const { clusterId } = req.params
  const clusterRoleBinding = { ...req.body }

  if (clusterRoleBinding.kind !== 'ClusterRoleBinding') {
    return res.status(400).send({ code: 400, message: 'Must be of kind "ClusterRoleBinding"' })
  }
  if (ClusterRoleBinding.findByName({ name: clusterRoleBinding.metadata.name, context, config: { clusterId } })) {
    return res.status(409).send({ code: 409, message: `clusterRoleBinding ${clusterRoleBinding.metadata.name} already exists` })
  }

  const newClusterRoleBinding = ClusterRoleBinding.create({ data: clusterRoleBinding, context, config: { clusterId } })
  res.status(201).send(newClusterRoleBinding)
}

// Todo
// export const putClusterRoleBinding = (req, res) => {
//   const { name, clusterId } = req.params
//   const clusterRoleBinding = { ...req.body }

//   const existingClusterRoleBinding = ClusterRoleBinding.findByName({ name, context, config: { clusterId } })
//   if (!existingClusterRoleBinding) {
//     return res.status(404).send({ code: 404, message: `clusterRoleBinding ${name} does not exist`})
//   }

//   console.log(existingClusterRoleBinding)
//   res.status(200).send(existingClusterRoleBinding)
// }

export const deleteClusterRoleBinding = (req, res) => {
  const { clusterRoleBindingName, clusterId } = req.params
  console.log('Attempting to delete clusterRoleBinding: ', clusterRoleBindingName)
  const clusterRoleBinding = ClusterRoleBinding.findByName({ name: clusterRoleBindingName, context, config: { clusterId } })
  // this should throw an error if it doesn't exist
  if (!clusterRoleBinding) {
    res.status(404).send({ code: 404, message: 'clusterRoleBinding not found' })
  }
  ClusterRoleBinding.delete({ id: clusterRoleBinding.metadata.uid, context })
  res.status(200).send(clusterRoleBinding)
}
