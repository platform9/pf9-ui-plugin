import Volume from '../../models/openstack/Volume'
import { mapAsJson } from '../../helpers'

const getVolumes = (req, res) => {
  const volumes = mapAsJson(Volume.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ volumes })
}

export default getVolumes
