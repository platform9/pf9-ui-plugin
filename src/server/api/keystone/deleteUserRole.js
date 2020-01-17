import Tenant from '../../models/openstack/Tenant'
import User from '../../models/openstack/User'

const deleteUserRole = (req, res) => {
  const { userId, roleId, tenantId } = req.params
  const user = User.findById(userId)
  const tenant = Tenant.findById(tenantId)
  user.removeRole(tenantId, roleId)
  tenant.removeUser(user)
  return res.status(204).send(null)
}

export default deleteUserRole
