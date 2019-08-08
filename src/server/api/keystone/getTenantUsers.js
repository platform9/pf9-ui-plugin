import TenantUser from '../../models/openstack/TenantUser'
import { mapAsJson } from '../../helpers'

const getTenantUsers = (req, res) => {
  const tenants = mapAsJson(TenantUser.getCollection())
  // TODO: need to filter this list by what the user is allowed to see
  return res.send({ tenants })
}

export default getTenantUsers
