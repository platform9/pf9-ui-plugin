import Tenant from '../../models/openstack/Tenant'
import { mapAsJson } from '../../helpers'

const getProjects = (req, res) => {
  const tenants = mapAsJson(Tenant.getCollection())
  return res.send({ projects: tenants })
}

export default getProjects
