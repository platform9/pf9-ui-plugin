import createCRUDActions from 'core/helpers/createCRUDActions'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { ActionDataKeys } from 'k8s/DataKeys'

const endpointsActions = createCRUDActions(ActionDataKeys.ApiEndpoints, {
  // TODO: implement list fetching real data
  listFn: async () => {
    const whitelist = ['qbert', 'keystone']
    const services = await loadServiceCatalog()
    return services.filter((service) => whitelist.includes(service.name))
  },
})

export default endpointsActions
