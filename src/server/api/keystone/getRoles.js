import Role from '../../models/openstack/Role'
import { mapAsJson } from '../../helpers'

const getRoles = (req, res) => {
  const roles = mapAsJson(Role.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ roles })
}

export default getRoles
