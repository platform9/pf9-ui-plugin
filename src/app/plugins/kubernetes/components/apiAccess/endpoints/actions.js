import createCRUDActions from 'core/helpers/createCRUDActions'
import { serviceCatalogContextKey } from 'openstack/components/api-access/actions'

export const endpointsCacheKey = 'apiAccess-endpoints'

const endpointsActions = createCRUDActions(endpointsCacheKey, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const whitelist = ['qbert', 'keystone']
    const services = await loadFromContext(serviceCatalogContextKey)
    return services.filter(service => whitelist.includes(service.name))
  }
})

export default endpointsActions
