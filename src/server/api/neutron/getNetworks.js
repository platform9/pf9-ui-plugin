/* eslint-disable no-unused-vars */
import Network from '../../models/Network'
import { mapAsJson } from '../../helpers'

const getNetworks = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const networks = mapAsJson(Network.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ networks })
}

export default getNetworks
