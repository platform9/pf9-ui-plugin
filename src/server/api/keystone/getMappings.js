import Mapping from '../../models/openstack/Mapping'
import { mapAsJson } from '../../helpers'

const getMappings = (req, res) => {
  const mappings = mapAsJson(Mapping.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ mappings })
}

export default getMappings
