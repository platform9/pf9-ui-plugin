import createCRUDActions from 'core/helpers/createCRUDActions'

export const kubeConfigCacheKey = 'apiAccess-kubeConfig'

const kubeConfigActions = createCRUDActions(kubeConfigCacheKey, {
  // TODO: implement list fetching real data
  listFn: async (params, loadFromContext) => {
    const kubeConfig = [
      { cluster: 'cluster-test', url: 'cluster-url' },
    ]

    return kubeConfig
  }
})

export default kubeConfigActions
