import context from '../../../context'
import Role from '../../../models/qbert/Role'

export const getRoles = (req, res) => {
  const { namespace, clusterId } = req.params
  const roles = Role.list({ context, config: { clusterId, namespace } })
  const response = {
    apiVersion: 'rbac.authorization.k8s.io/v1',
    items: roles,
    kind: 'RoleList',
    metadata: {
      resourceVersion: '219042',
      selfLink: '/apis/rbac.authorization.k8s.io/v1/roles'
    }
  }
  return res.send(response)
}

export const postRole = (req, res) => {
  const { namespace, clusterId } = req.params
  const role = { ...req.body }

  if (role.kind !== 'Role') {
    return res.status(400).send({ code: 400, message: 'Must be of kind "Role"' })
  }
  if (Role.findByName({ name: role.metadata.name, context, config: { clusterId, namespace } })) {
    return res.status(409).send({ code: 409, message: `role ${role.metadata.name} already exists` })
  }

  const newRole = Role.create({ data: role, context, config: { clusterId, namespace } })
  res.status(201).send(newRole)
}

// Todo
// export const putRole = (req, res) => {
//   const { name, namespace, clusterId } = req.params
//   const role = { ...req.body }

//   const existingRole = Role.findByName({ name, context, config: { clusterId, namespace } })
//   if (!existingRole) {
//     return res.status(404).send({ code: 404, message: `role ${name} does not exist`})
//   }

//   console.log(existingRole)
//   res.status(200).send(existingRole)
// }

export const deleteRole = (req, res) => {
  // TODO: account for tenancy
  const { roleName, clusterId, namespace } = req.params
  console.log('Attempting to delete roleName: ', roleName)
  const role = Role.findByName({ name: roleName, context, config: { clusterId, namespace } })
  // this should throw an error if it doesn't exist
  if (!role) {
    return res.status(404).send({ code: 404, message: 'role not found' })
  }
  Role.delete({ id: role.metadata.uid, context })
  res.status(200).send(role)
}
