import { tryParseNumber } from '../../helpers'
import Role from '../../models/openstack/Role'
import Tenant from '../../models/openstack/Tenant'
import User from '../../models/openstack/User'

const addUserRole = (req, res) => {
  const { userId, tenantId, roleId } = req.params
  const user = User.findById(tryParseNumber(userId))
  const tenant = Tenant.findById(tryParseNumber(tenantId))
  const role = Role.findById(tryParseNumber(roleId))
  user.addRole(tenant, role)
  console.log(user, role)

  // TODO: need to filter this list by what the user is allowed to see
  return res.status(204).send(null)
}

export default addUserRole
