/* eslint-disable no-unused-vars */
import FloatingIp from '../../models/FloatingIp'
import { mapAsJson } from '../../helpers'

const getFloatingIps = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const floatingIps = mapAsJson(FloatingIp.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ floatingips: floatingIps })
}

export default getFloatingIps
