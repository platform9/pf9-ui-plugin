import Role from '../../models/openstack/Role'
import Tenant from '../../models/openstack/Tenant'
import User from '../../models/openstack/User'

const addUserRole = (req, res) => {
  const { userId, tenantId, roleId } = req.params
  const user = User.findById(userId)
  const tenant = Tenant.findById(tenantId)
  const role = Role.findById(roleId)
  tenant.addUser(user)
  user.addRole(tenant, role)

  // TODO: need to filter this list by what the user is allowed to see
  return res.status(204).send(null)
}

export default addUserRole
