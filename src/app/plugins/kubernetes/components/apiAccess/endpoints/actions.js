import createCRUDActions from 'core/helpers/createCRUDActions'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import DataKeys from 'k8s/DataKeys'

const endpointsActions = createCRUDActions(DataKeys.ApiEndpoints, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const whitelist = ['qbert', 'keystone']
    const services = await loadServiceCatalog()
    return services.filter((service) => whitelist.includes(service.name))
  },
})

export default endpointsActions
