/* eslint-disable no-unused-vars */
import Hypervisor from '../../models/openstack/Hypervisor'
import { mapAsJson } from '../../helpers'

const getHypervisors = (req, res) => {
  const hypervisors = mapAsJson(Hypervisor.getCollection())
  return res.send({ hypervisors })
}

export default getHypervisors
