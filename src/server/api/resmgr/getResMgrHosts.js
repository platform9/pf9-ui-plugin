import ResMgrHost from '../../models/resmgr/ResMgrHost'
import { mapAsJson } from '../../helpers'

const getResMgrHosts = (req, res) => {
  const resMgrHosts = mapAsJson(ResMgrHost.getCollection())
  return res.send(resMgrHosts)
}

export default getResMgrHosts
