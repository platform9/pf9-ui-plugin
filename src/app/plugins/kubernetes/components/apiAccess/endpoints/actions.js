import createCRUDActions from 'core/helpers/createCRUDActions'

export const endpointsCacheKey = 'apiAccess-endpoints'

const endpointsActions = createCRUDActions(endpointsCacheKey, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const endpoints = Promise.resolve([
      { service: 'keystone', type: 'identity', url: 'https://df-us-mpt1-kvm.platform9.net/keystone/v2.0' },
      { service: 'qbert', type: 'qbert', url: 'https://df-us-mpt1-kvm.platform9.net/qbert/v3' },
    ])

    return endpoints
  }
})

export default endpointsActions
