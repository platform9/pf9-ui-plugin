import context from '../../../context'
import RoleBinding from '../../../models/qbert/RoleBinding'

export const getRoleBindings = (req, res) => {
  const { namespace, clusterId } = req.params
  const roleBindings = RoleBinding.list({ context, config: { clusterId, namespace } })
  const response = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    items: roleBindings,
    kind: 'RoleBindingList',
    metadata: {
      resourceVersion: '219042',
      selfLink: '/apis/rbac.authorization.k8s.io/v1/rolebindings'
    }
  }
  return res.send(response)
}

export const postRoleBinding = (req, res) => {
  const { namespace, clusterId } = req.params
  const roleBinding = { ...req.body }

  if (roleBinding.kind !== 'RoleBinding') {
    return res.status(400).send({ code: 400, message: 'Must be of kind "RoleBinding"' })
  }
  if (RoleBinding.findByName({ name: roleBinding.metadata.name, context, config: { clusterId, namespace } })) {
    return res.status(409).send({ code: 409, message: `roleBinding ${roleBinding.metadata.name} already exists` })
  }

  const newRoleBinding = RoleBinding.create({ data: roleBinding, context, config: { clusterId, namespace } })
  res.status(201).send(newRoleBinding)
}

// Todo
// export const putRoleBinding = (req, res) => {
//   const { name, namespace, clusterId } = req.params
//   const roleBinding = { ...req.body }

//   const existingRoleBinding = RoleBinding.findByName({ name, context, config: { clusterId, namespace } })
//   if (!existingRoleBinding) {
//     return res.status(404).send({ code: 404, message: `roleBinding ${name} does not exist`})
//   }

//   console.log(existingRoleBinding)
//   res.status(200).send(existingRoleBinding)
// }

export const deleteRoleBinding = (req, res) => {
  // TODO: account for tenancy
  const { roleBindingName, clusterId, namespace } = req.params
  console.log('Attempting to delete roleBindingName: ', roleBindingName)
  const roleBinding = RoleBinding.findByName({ name: roleBindingName, context, config: { clusterId, namespace } })
  // this should throw an error if it doesn't exist
  if (!roleBinding) {
    return res.status(404).send({ code: 404, message: 'roleBinding not found' })
  }
  RoleBinding.delete({ id: roleBinding.metadata.uid, context })
  res.status(200).send(roleBinding)
}
