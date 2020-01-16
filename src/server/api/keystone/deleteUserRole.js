import { tryParseNumber } from '../../helpers'
import User from '../../models/openstack/User'

const deleteUserRole = (req, res) => {
  const { userId, roleId, tenantId } = req.params
  const user = User.findById(tryParseNumber(userId))
  user.removeRole(tryParseNumber(tenantId), tryParseNumber(roleId))
  return res.status(204).send(null)
}

export default deleteUserRole
