import Tenant from '../../models/openstack/Tenant'
import { mapAsJson } from '../../helpers'

const getTenantUsers = (req, res) => {
  const withUsers = true
  const tenants = mapAsJson(Tenant.getCollection(), withUsers)
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ tenants })
}

export default getTenantUsers
