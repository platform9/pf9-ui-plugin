import createCRUDActions from 'core/helpers/createCRUDActions'
import { loadServiceCatalog } from 'openstack/components/api-access/actions'
import { ActionDataKeys } from 'k8s/DataKeys'
import Bugsnag from '@bugsnag/js'

const endpointsActions = createCRUDActions(ActionDataKeys.ApiEndpoints, {
  // TODO: implement list fetching real data
  listFn: async () => {
    Bugsnag.leaveBreadcrumb('Attempting to get API endpoints')
    const whitelist = ['qbert', 'keystone']
    const services = await loadServiceCatalog()
    return services.filter((service) => whitelist.includes(service.name))
  },
})

export default endpointsActions
