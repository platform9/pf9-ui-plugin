/* eslint-disable no-unused-vars */
import Flavor from '../../models/openstack/Flavor'
import { mapAsJson } from '../../helpers'

const getFlavors = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const flavors = mapAsJson(Flavor.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ flavors })
}

export default getFlavors
