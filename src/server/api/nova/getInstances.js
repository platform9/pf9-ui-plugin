/* eslint-disable no-unused-vars */
import Instance from '../../models/Instance'
import { mapAsJson } from '../../helpers'

const getInstances = (req, res) => {
  const instances = mapAsJson(Instance.getCollection())
  return res.send({ servers: instances })
}

export default getInstances
