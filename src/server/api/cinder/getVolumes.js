/* eslint-disable no-unused-vars */
import Volume from '../../models/Volume'
import { mapAsJson } from '../../helpers'

const getVolumes = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const volumes = mapAsJson(Volume.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ volumes })
}

export default getVolumes
