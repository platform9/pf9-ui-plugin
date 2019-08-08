import Group from '../../models/openstack/Group'
import { mapAsJson } from '../../helpers'

const getGroups = (req, res) => {
  const groups = mapAsJson(Group.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ groups })
}

export default getGroups
