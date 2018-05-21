import Tenant from '../../models/Tenant'
import { mapAsJson } from '../../helpers'

const getProjects = (req, res) => {
  const tenants = mapAsJson(Tenant.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ projects: tenants })
}

export default getProjects
