import Region from '../../models/openstack/Region'
import { mapAsJson } from '../../helpers'

const getRegions = (req, res) => {
  const regions = mapAsJson(Region.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ regions })
}

export default getRegions
