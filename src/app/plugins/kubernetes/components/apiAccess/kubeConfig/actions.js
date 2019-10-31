import createCRUDActions from 'core/helpers/createCRUDActions'

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const kubeConfig = Promise.resolve([
      { cluster: 'klee-test', url: 'klee-test-5ab3b7a0-api.df-us-mpt1-kvm.platform9.net' },
    ])

    return kubeConfig
  }
})

export default kubeConfigActions
