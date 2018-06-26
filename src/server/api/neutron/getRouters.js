/* eslint-disable no-unused-vars */
import Router from '../../models/Router'
import { mapAsJson } from '../../helpers'

const getRouters = (req, res) => {
  // TODO: account for tenancy
  const { tenantId } = req.params
  const routers = mapAsJson(Router.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ routers })
}

export default getRouters
